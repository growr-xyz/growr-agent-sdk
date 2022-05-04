require('dotenv').config()
const { ethers } = require('ethers')
const { Resolver } = require('did-resolver')
const { getResolver } = require('ethr-did-resolver')
const { Did } = require('./did')
const { VC } = require('./vc')

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
    // this.#connectNetwork(config.networkConfig)
    return this
  }

  #createResolver(providerConfig = defaultProviderConfig) {
    const resolver = new Resolver(getResolver(providerConfig))
    this.didResolver = resolver
    return this
  }

  async #connectNetwork(networkConfig) {
    try {
      this.#provider = await (new ethers.providers.JsonRpcProvider(networkConfig.uri, networkConfig.options))
      this.#wallet = await (new ethers.Wallet(process.env.GASDK_PRIVATE_KEY, this.#provider))
      this.address = this.#wallet.address
    } catch (e) {
      console.error(e)
      throw e
    }
  }


  static async getInstance({
    providerConfig,
    didConfig,
    networkConfig } = {
      providerConfig: defaultProviderConfig,
      didConfig: defaultDidConfig,
      networkConfig: defaultNetworkConfig
    }) {
    if (!this.instance) {
      this.instance = new GrowrAgent({ providerConfig, networkConfig })
      this.instance.identity = await this.instance.Did.createIdentity(didConfig.privateKey, didConfig.networkName)
      this.instance.VC = new VC(this.instance.identity, this.instance.didResolver)
      await this.instance.#connectNetwork(networkConfig)
      this.instance.wallet = this.instance.#wallet
      this.instance.address = this.instance.wallet.address
    }
    return this.instance
  }
}

module.exports = { GrowrAgent }

