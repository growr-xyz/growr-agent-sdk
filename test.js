const { GrowrAgent } = require('./index')

const initialize = async () => {
  try {
    const agent = await GrowrAgent.getInstance()
    const adr = await agent.Did.getEthAddressFromDid(agent.identity.did)
    console.log(adr)
  } catch (e) {
    console.error(e)
  }
}

initialize()
