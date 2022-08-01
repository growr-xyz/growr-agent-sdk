const { verifyJWT } = require('jesse-did-jwt')
const { createVerifiableCredentialJwt } = require('did-jwt-vc')
const { parseVerifiableCredential } = require('@growr/vc-json-schemas-parser')
const { getTemplate } = require('@growr/vc-json-schemas/util')
const { ethers } = require('ethers')
const PondABI = require('../abis/Pond.json')

class VC {
  #identity
  #resolver
  #wallet
  #provider
  #create

  constructor(identity, resolver, provider, wallet) {
    this.#identity = identity
    this.#resolver = resolver
    this.#provider = provider
    this.#wallet = wallet
    this.#create = require('./generator')
    return this
  }
  verifyVerifiableJwt(jwt, ethSign = true) {
    return verifyJWT(jwt, { ethSign, resolver: this.#resolver })
  }


  // TODO add template map and create payload from growr/vc-schemas
  async createVC(did, subject, type) {
    const template = getTemplate(type)
    const payload = template(did, subject)
    return createVerifiableCredentialJwt(payload, this.#identity)
  }

  async issueVC(did, subject, type) {
    return this.createVC(did, subject, type)
  }

  parseCredential(type, payload) {
    return parseVerifiableCredential(type, payload)
  }


  async getCredentials(did, vps) {
    const vpsDecodePromises = []
    vps.forEach(vp => vpsDecodePromises.push(this.verifyVerifiableJwt(vp)))
    const verified = await Promise.all(vpsDecodePromises).catch(e => { throw e })
    const vcValues = verified.map(v => v.payload.vp.verifiableCredential)
    const vcsDecodePromises = []
    vcValues.forEach(vc => vcsDecodePromises.push(this.verifyVerifiableJwt(vc[0], false)))
    const credentials = await Promise.all(vcsDecodePromises).catch(e => { throw e })
    const parsedCredentials = credentials.map(cr => {
      // if (cr.payload.iss !== issuer.issuer.did) throw new Error('Issuer unknown')
      // if (cr.payload.subject !== did) throw new Error('DID and VC subject do not match')
      return this.parseCredential(cr.payload.vc.type[1], cr.payload.vc)
    })
    return parsedCredentials
  }

  async verifyCredentials(pondAddress, userCredentials, instance) {

    const decapitalizeFirstLetter = (text) => {
      return text && text[0].toLowerCase() + text.slice(1) || text
    }

    const userHasMatchingCredentials = (userCredentials, pondCredentials) => {
      const userCredentialTypes = userCredentials.map(credential => decapitalizeFirstLetter(Object.keys(credential)))
      if (pondCredentials.every(criteria => userCredentialTypes.includes(criteria))) return true
      return false
    }

    const createUserCredentialValues = (userCredentials) => {
      const names = []
      const contents = []
      for (const i in userCredentials) {
        const localNames = []
        localNames.push(...Object.keys(userCredentials[i]))
        for (const j of localNames) {
          names.push(decapitalizeFirstLetter(j))
          contents.push(userCredentials[i][j].text)
        }
      }
      return { names, contents }
    }

    const Pond = new ethers.Contract(pondAddress, PondABI, instance.provider);
    const criteriaNames = await Pond.getCriteriaNames();
    if (!userHasMatchingCredentials(userCredentials, criteriaNames)) { throw new Error('User credentials does not match pond requirements') }
    const userCredentialValues = createUserCredentialValues(userCredentials)
    return await Pond.verifyCredentials(userCredentialValues);
  }

  async registerVerification(did, pondAddress, validity = 60 * 60, instance) {
    console.log(`=== Granting access to pond ${pondAddress} for user ${did}`)
    const VerificationRegistry = new ethers.Contract(VerificationRegistryAddress, VerificationRegistryABI, instance.provider)
    const didAddress = await getAddressFromDid(did)
    try {
      const tx = await VerificationRegistry.connect(instance.wallet).registerVerification(didAddress, pondAddress, validity);
      return tx.wait();
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async createPresentation(jwt) {
    const signer = this.#provider.getSigner(this.#wallet.address);

    const vpPayload = {
      vp: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: [jwt], // TODO: To support more than one credential, we should change jwt to jwts (array of JWTs)
        nbf: Math.floor(new Date().getTime() / 1000),
        exp: Math.floor(new Date().getTime() / 1000) + 3600
      }
    };

    const signerFunction = async (data) => {
      const hexData = await signer.signMessage(data);
      const sig = ethers.utils.splitSignature(hexData);
      const { v, r, s } = sig;
      const result = {
        r: r.split('0x')[1],
        s: s.split('0x')[1],
        recoveryParam: v
      };
      return result;
    };

    // const ethrDid = new EthrDID({address: account, method: 'ethr:rsk:testnet', provider, signer: signerFunction});
    // console.log('ethrDid', ethrDid);
    return createJWT(vpPayload, { alg: 'ES256K', issuer: this.#identity.did, signer: signerFunction })
  };

}



module.exports = { VC }



