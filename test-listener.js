const { ethers } = require("ethers");
const ERC20ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
]
// const xUSDAddress = process.env.NEXT_PUBLIC_XUSD_CONTRACT;
const provider = "wss://public-node.testnet.rsk.co/websocket"
const ecr20TokenAddress = '0x7237Ad8910561B683c760a29246aF14CAA52eed2'

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
    // const adr = await agent.Did.getEthAddressFromDid(agent.identity.did)
    agent.registerListener(provider, ecr20TokenAddress, "0xC667eB853172e4Ea76f839ad0b52B3dC98718fb0", console.log)
    console.log("Listener registered")
  } catch (e) {
    console.error(e)
  }
}

initialize()


// const Web3 = require('web3');

// const wsProvider = new Web3.providers.WebsocketProvider("wss://public-node.testnet.rsk.co/websocket");
// const web3 = new Web3(wsProvider);

// const smartContractAddress = '0x7237Ad8910561B683c760a29246aF14CAA52eed2'

// console.log("Subscribing to logs");
//   var subscription = web3.eth.subscribe('logs', {
//     address: smartContractAddress.toLowerCase(),
//   }, (error, result) => {
//     if (error) {
//       console.log(error)
//     } else {
//       console.log('log:')
//       console.log(result)
//     }
//   })
  
// subscription.on('data', event => console.log(event))
// subscription.on('changed', changed => console.log(changed))
// subscription.on('error', err => { throw err })
// subscription.on('connected', nr => console.log(nr))