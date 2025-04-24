"use strict";

// to install run --> npm install blind-signatures
let blindSignatures = require('blind-signatures');
let BigInteger = require('jsbn').BigInteger;

let rand = require('./rand.js');

const COPIES_REQUIRED = 10;

class SpyAgency {
  constructor() {
    this.key = blindSignatures.keyGeneration({ b: 2048 }); // Setting key length
  }

  // Verifies that the hash and the blinding factor match the blind hash.
  consistent(blindHash, factor, hash) {
    let n = this.key.keyPair.n;
    let e = new BigInteger(this.key.keyPair.e.toString());
    blindHash = blindHash.toString();
    let bigHash = new BigInteger(hash, 16);
    let b = bigHash.multiply(factor.modPow(e, n)).mod(n).toString(); // (hash * (factor ^ e % n)) % n
    return blindHash === b;
  }

  // Returns true if the originalDoc matches expectations,
  // if its hash matches what was specified previously, and
  // if the blinded document matches the hash and blinding factor.
  verifyContents(blindHash, blindingFactor, originalDoc) {
    console.log(`🔍 Checking document: "${originalDoc}"`); // ✅ DEBUG: طباعة المستند قبل التحقق

    // التحقق من صحة النص
    if (!originalDoc.match(/^The bearer of this signed document, .*, has full diplomatic immunity.$/)) {
      console.warn(`⚠️ Warning: Document format is incorrect → "${originalDoc}"`);
      return false;
    }

    let h = blindSignatures.messageToHash(originalDoc);
    if (!this.consistent(blindHash, blindingFactor, h)) {
      console.warn(`⚠️ Warning: Hash inconsistency for document → "${originalDoc}"`);
      return false;
    }

    return true;
  }

  signDocument(blindDocs, response) {
    if (blindDocs.length !== COPIES_REQUIRED) {
      throw new Error(`❌ There must be ${COPIES_REQUIRED} documents, but I only received ${blindDocs.length}`);
    }

    // Cloning documents, in case the spy tries to change them after submission.
    blindDocs = blindDocs.slice();
    let selected = rand.nextInt(blindDocs.length);
    console.log(`🕵️ Agency selected document ${selected} for identity verification`);

    response(selected, (blindingFactors, originalDocs) => {
      blindDocs.forEach((doc, i) => {
        if (i === selected) return; // No blinding factor is expected for the selected identity.

        console.log(`🔹 Verifying document ${i}...`);
        console.log("📜 blindDocs[i]:", blindDocs[i]);
        console.log("🔑 blindingFactors[i]:", blindingFactors[i]);
        console.log("📝 originalDocs[i]:", originalDocs[i]);

        if (!this.verifyContents(blindDocs[i], blindingFactors[i], originalDocs[i])) {
          throw new Error(`❌ Document ${i} is invalid!`);
        }
      });

      // If we made it here, all documents looked good.
      return blindSignatures.sign({
        blinded: blindDocs[selected],
        key: this.key,
      });
    });
  }

  get n() {
    return this.key.keyPair.n.toString();
  }

  get e() {
    return this.key.keyPair.e.toString();
  }
}

exports.SpyAgency = SpyAgency;

