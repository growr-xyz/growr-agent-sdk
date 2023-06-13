/*
TEST FOR MONITOR
const { GrowrAgent } = require('./index')

const initialize = async () => {
  try {
    const agent = await GrowrAgent.getInstance({})
    // const adr = await agent.Did.getEthAddressFromDid(agent.identity.did)
    const blockNumber = await agent.getLastBlockNumber()
    // const block = await agent.getBlockWithTransactions(3899552)
    // const transactions = await agent.getERC20TransfersFromBlock('0x7237aD8910561B683c760A29246af14cAA52EEd2', 3899552)
    // const transactions = await agent.getERC20TransactionsToReceiversFromRange('0x7237aD8910561B683c760A29246af14cAA52EEd2', ['0x6a3035ec3137beeb6789ffa90898ccad5cd06f79', '0xc667eb853172e4ea76f839ad0b52b3dc98718fb0'], [3899550,
    // 3899552])
    const transactions = await agent.getMultipleERC20TransactionsToReceiversFromRange(['0x7237aD8910561B683c760A29246af14cAA52EEd2'], ['0x6a3035ec3137beeb6789ffa90898ccad5cd06f79', '0xc667eb853172e4ea76f839ad0b52b3dc98718fb0'], [3899550,
      3899552])

    console.log(JSON.stringify(transactions, null, 2))
    // console.log(JSON.stringify(block, null, 2))
  } catch (e) {
    console.error(e)
  }
}

initialize()
*/

const { GrowrAgent } = require('./index')

const initialize = async () => {
  try {
    const agent = await GrowrAgent.getInstance({})
    const did = await agent.didResolver.resolve('did:ethr:rsk:0x915D1A40B9b1ad51FF38338624d029e7979a94B5')
    // // const adr = await agent.Did.getEthAddressFromDid(agent.identity.did)
    // const blockNumber = await agent.getLastBlockNumber()
    // // const block = await agent.getBlockWithTransactions(3899552)
    // // const transactions = await agent.getERC20TransfersFromBlock('0x7237aD8910561B683c760A29246af14cAA52EEd2', 3899552)
    // // const transactions = await agent.getERC20TransactionsToReceiversFromRange('0x7237aD8910561B683c760A29246af14cAA52EEd2', ['0x6a3035ec3137beeb6789ffa90898ccad5cd06f79', '0xc667eb853172e4ea76f839ad0b52b3dc98718fb0'], [3899550,
    // // 3899552])
    // const transactions = await agent.getMultipleERC20TransactionsToReceiversFromRange(
    //   ['0x7237aD8910561B683c760A29246af14cAA52EEd2'],
    //   ['0x83c19eD6099693ff896F6B9DFf1FeC7785D5C9D6', '0xC667eB853172e4Ea76f839ad0b52B3dC98718fb0'], 
    //   [3914891, 3914892])
    console.log(JSON.stringify(did, null, 2))
    // console.log(JSON.stringify(transactions, null, 2))
    // // console.log(JSON.stringify(block, null, 2))
  } catch (e) {
    console.error(e)
  }
}

initialize()
