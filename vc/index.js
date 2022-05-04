const { verifyJWT } = require('jesse-did-jwt')
const { parseVerifiableCredential } = require('@growr/vc-json-schemas-parser')
const { getTemplate } = require('@growr/vc-json-schemas/util')

class VC {
  #identity
  #resolver

  constructor(identity, resolver) {
    this.#identity = identity,
      this.#resolver = resolver
    return this
  }
  verifyVerifiableJwt(jwt, ethSign = true) {
    return verifyJWT(jwt, { ethSign, resolver: this.#resolver })
  }


  // add template map and create payload from growr/vc-schemas
  async createVC(did, subject, type) {
    const template = getTemplate(type)
    const payload = template(did, subject)
    return createVerifiableCredentialJwt(payload, this.#identity)
  }

  async issueVC(did, subject, template) {
    return this.createVC(did, subject, template)
  }

  parseCredential(type, payload) {
    return parseVerifiableCredential(type, payload)
  }

}

module.exports = { VC }



