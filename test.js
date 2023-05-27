const { GrowrAgent } = require('./index')
process.env.GASDK_PRIVATE_KEY = 'de7172b73823d43fbb1f856155c724eaabffc8c9c61bd07248f00341ceabb2c3'

const initialize = async () => {
  try {
    const agent = await GrowrAgent.getInstance(
      {
        providerConfig: {
          name: 'rsk:testnet',
          rpcUrl: 'https://did.testnet.rsk.co:4444',
          registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'
        },

        networkConfig: {
          uri: 'https://public-node.testnet.rsk.co',
          options: { name: 'rsk-testnet', chainId: 31 }
        },

        didConfig: {
          privateKey: process.env.GASDK_PRIVATE_KEY,
          networkName: 'rsk:testnet'
        }
      }
    )
    const adr = await agent.Did.getEthAddressFromDid(agent.identity.did)
    console.log(adr)
  } catch (e) {
    console.error(e)
  }
}

initialize()
