require('dotenv').config()
const { ethers } = require('ethers')
const { Resolver } = require('did-resolver')
const { getResolver } = require('ethr-did-resolver')
const { Did } = require('./did')
const { VC } = require('./vc')
const { Helpers } = require('./utils/helpers')
const defaultProviderConfig = {
  networks: [
    { name: 'rsk:testnet', rpcUrl: 'https://did.testnet.rsk.co:4444', registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b' },
    { name: 'rsk', rpcUrl: 'https://did.rsk.co:4444', registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b' },
  ]
}

const defaultNetworkConfig = {
  uri: process.env.GASDK_NODE_HOST || 'https://public-node.testnet.rsk.co', options: { name: 'rsk-testnet', chainId: 31 }
}

const defaultDidConfig = {
  privateKey: process.env.GASDK_PRIVATE_KEY,
  networkName: 'rsk:testnet'
}

class GrowrAgent {
  didResolver
  Did
  identity
  #provider
  #wallet
  address

  constructor(config) {
    this.#createResolver(config.providerConfig)
    this.Did = new Did(this.didResolver)
    return this
  }

  #createResolver(providerConfig = defaultProviderConfig) {
    const resolver = new Resolver(getResolver(providerConfig))
    this.didResolver = resolver
    return this
  }



  async #connectNetwork(networkConfig, privateKey = process.env.GASDK_PRIVATE_KEY) {
    try {
      this.#provider = await (new ethers.providers.JsonRpcProvider(networkConfig.uri, networkConfig.options))
      this.#wallet = await (new ethers.Wallet(privateKey, this.#provider))
      this.address = this.#wallet.address
    } catch (e) {
      console.error(e)
      throw e
    }
  }


  static async createWallet(networkConfig = defaultNetworkConfig) {
    const provider = await (new ethers.providers.JsonRpcProvider(networkConfig.uri, networkConfig.options))
    const wallet = ethers.Wallet.createRandom().connect(provider)
    return wallet
  }

  getProvider() {
    return this.#provider
  }

  static async getDid({ providerConfig = defaultProviderConfig, didConfig = defaultDidConfig }) {
    const agent = new GrowrAgent({ providerConfig })
    agent.identity = await agent.Did.createIdentity(didConfig.privateKey, didConfig.networkName)
    return agent.identity

  }

  static async getAgent({
    providerConfig = defaultProviderConfig,
    didConfig = defaultDidConfig,
    networkConfig = defaultNetworkConfig
  }) {
    const agent = new GrowrAgent({ providerConfig })
    agent.identity = await agent.Did.createIdentity(didConfig.privateKey, didConfig.networkName)
    await agent.#connectNetwork(networkConfig, didConfig.privateKey)
    agent.wallet = agent.#wallet
    agent.did = agent.identity.did.toLowerCase()
    agent.address = agent.wallet.address
    agent.provider = agent.getProvider()
    agent.VC = new VC(agent.identity, agent.didResolver, agent.provider, agent.wallet)
    return agent
  }

  static async getInstance({
    providerConfig = defaultProviderConfig,
    didConfig = defaultDidConfig,
    networkConfig = defaultNetworkConfig }) {

    try {
      if (!this.instance) {
        this.instance = new GrowrAgent({ providerConfig })
        this.instance.identity = await this.instance.Did.createIdentity(didConfig.privateKey, didConfig.networkName)
        await this.instance.#connectNetwork(networkConfig, didConfig.privateKey)
        this.instance.wallet = this.instance.#wallet
        this.instance.did = this.instance.identity.did.toLowerCase()

        this.instance.address = this.instance.wallet.address
        this.instance.provider = this.instance.getProvider()
        this.instance.VC = new VC(this.instance.identity, this.instance.didResolver, this.instance.provider, this.instance.wallet)
      }
      return this.instance
    } catch (e) {
      throw e
    }
  }

  async verifyCredentials(pondAddress, userCredentials) {
    if (!this.instance) {
      throw new Error('Should create instance first')
    }
    await this.instance.VC.verifyCredentials(pondAddress, userCredentials, this.instance)
  }

  async registerVerification(did, pondAddress, validity = 60 * 60) {
    if (!this.instance) {
      throw new Error('Should create instance first')
    }
    await this.instance.VC.registerVerification(did, pondAddress, validity, this.instance)
  }

  async getBestOffer(amount, duration, credentials) {
    return await Helpers.findBestOffer(this.provider, this.address, { amount, duration, credentials })
  }

  async getPondCriteriaNames(pondAddress) {
    return await Helpers.getPondCriteriaNames(this.provider, this.address, { pondAddress })
  }
}

module.exports = { GrowrAgent }

