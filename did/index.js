const {
  rskDIDFromPrivateKey,
  rskTestnetDIDFromPrivateKey,
} = require("@rsksmart/rif-id-ethr-did");

const { fromRpcSig, hashPersonalMessage, ecrecover, pubToAddress } = require('ethereumjs-util')

const createDidMethod = (chainId) => {
  switch (chainId) {
    case 1: return 'ethr'
    case 3: return 'ethr:ropsten'
    case 4: return 'ethr:rinkeby'
    case 5: return 'ethr:goerli'
    case 30: return 'ethr:rsk'
    case 31: return 'ethr:rsk:testnet'
    case 42: return 'ethr:kovan'
    case 5777: return 'ethr:development'
    case 31337: return 'ethr:rsk:testnet'
    default: return 'ethr:rsk:testnet'
  }
};

class Did {
  #resolver

  constructor(resolver) {
    this.#resolver = resolver
    return this
  }

  createIdentity(privateKey, networkName = 'rsk:testnet') {
    return (networkName === 'rsk:testnet' ? rskTestnetDIDFromPrivateKey()(privateKey) : rskDIDFromPrivateKey()(privateKey))
  }

  async getEthAddressFromDid(did) {
    try {
      const doc = await this.#resolver.resolve(did)
      return doc.publicKey[0].ethereumAddress.toLowerCase()
    } catch (e) {
      console.error(e)
    }
  }

  getAccountFromDID(did) { // TODO move to growr-agent-sdk/utils?
    return did.split(":").slice(-1)[0].toLowerCase()
  }

  getValidDidSigner(did, q, a) {
    const { v, r, s } = fromRpcSig(a)
    const msgHash = hashPersonalMessage(Buffer.from(q))
    const signer = `0x${pubToAddress(ecrecover(msgHash, v, r, s)).toString('hex').toLowerCase()}`
    if (this.getEthAddressFromDid(did) !== signer) {
      throw new Error('Invalid signature')
    }
    return signer
  }

  validateDidSignature(did, q, a) {
    // TODO make it dependant on env
    // return Promise.resolve(true) // comment when debugging backend only
    const signer = this.getValidDidSigner(did, q, a)
    if (this.getAccountFromDID(did) !== signer) {
      throw new Error('Invalid signature')
    }
  }

  static createDidFormat(address, chainId) {
    const method = createDidMethod(chainId);
    return `did:${method}:${address}`;
  };

}

module.exports = { Did }