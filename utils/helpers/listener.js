const { ethers } = require("ethers");
const ERC20ABI = require("../../abis/ERC20.json");
// const xUSDAddress = process.env.NEXT_PUBLIC_XUSD_CONTRACT;


class Listener {
  provider
  contractAddress

  constructor(provider) {
    this.provider = new ethers.WebSocketProvider(provider)
    this.provider.on('pending', () => {})
    return this
  }

  registerListener(contractAddress, walletAddress, sendFunction) {
    // contract.on(filter, (from, to, value, event) => {
    //   let transferEvent = {
    //     from: from,
    //     to: to,
    //     value: value,
    //     eventData: event,
    //   }
    //   console.log(transferEvent)
    // })
    // return contract.listeners('Transfer')
    let response = false
    var contract = new ethers.Contract(contractAddress.toLowerCase(), ERC20ABI, this.provider);
    const filter = contract.filters.Transfer(null, walletAddress);
    contract.on('Transfer', (from, to, value, event) => {
      console.log('XUSD transfer event')
      if (to === walletAddress) {
        let transferEvent = {
          from: from,
          to: to,
          value: value,
          eventData: event,
        }
        sendFunction(transferEvent)
      }
    })

    response = true
    return response 

  }

}

module.exports = { Listener }
