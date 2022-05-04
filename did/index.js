const {
  rskDIDFromPrivateKey,
  rskTestnetDIDFromPrivateKey,
} = require("@rsksmart/rif-id-ethr-did");

const { fromRpcSig, hashPersonalMessage, ecrecover, pubToAddress } = require('ethereumjs-util')


class Did {
  #resolver

  constructor(resolver) {
    this.#resolver = resolver
    return this
  }

  createIdentity(privateKey, networkName) {
    return (networkName === 'rsk:testnet' ? rskTestnetDIDFromPrivateKey()(privateKey) : rskDIDFromPrivateKey()(privateKey))
  }

  async getEthAddressFromDid(did) {
    try {
      const doc = await this.#resolver.resolve(did)
      return doc.publicKey[0].ethereumAddress
    } catch (e) {
      console.error(e)
    }
  }

  verifyDid(did, nonce, signed) { // TODO NEEDS TO BE TESTED getEthAddressFromDid is has some differences than wallet.address
    const { v, r, s } = fromRpcSig(signed)
    const msgHash = hashPersonalMessage(Buffer.from(nonce))
    const signer = `0x${pubToAddress(ecrecover(msgHash, v, r, s)).toString('hex')}`
    if (this.getEthAddressFromDid(did) !== signer) {
      throw new Error('Invalid signature')
    }
    return true
  }
}

module.exports = { Did }