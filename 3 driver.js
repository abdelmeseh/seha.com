"use strict";

const blindSignatures = require('blind-signatures');
const { Coin, COIN_RIS_LENGTH, IDENT_STR, BANK_STR } = require('./coin.js');
const utils = require('./utils.js');

const BANK_KEY = blindSignatures.keyGeneration({ b: 2048 });
const N = BANK_KEY.keyPair.n.toString();
const E = BANK_KEY.keyPair.e.toString();

function signCoin(blindedCoinHash) {
  return blindSignatures.sign({
    blinded: blindedCoinHash,
    key: BANK_KEY,
  });
}


function parseCoin(s) {
  let [cnst, amt, guid, leftHashes, rightHashes] = s.split('-');
  if (cnst !== BANK_STR) {
    throw new Error(`Invalid identity string: ${cnst} received, but ${BANK_STR} expected`);
  }
  return [leftHashes.split(','), rightHashes.split(',')];
}


function acceptCoin(coin) {
  const isValid = blindSignatures.verify({
    unblinded: coin.signature,
    message: coin.toString(),
    N: coin.n,
    E: coin.e,
  });

  if (!isValid) {
    throw new Error("Invalid coin signature.");
  }

  let [leftHashes, rightHashes] = parseCoin(coin.toString());
  let ris = [];

  for (let i = 0; i < COIN_RIS_LENGTH; i++) {
    const isLeft = utils.randInt(2) === 0;
    const ident = coin.getRis(isLeft, i);
    const hashCheck = utils.hash(ident);
    const expectedHash = isLeft ? leftHashes[i] : rightHashes[i];

    if (hashCheck !== expectedHash) {
      throw new Error(`Hash mismatch at position ${i}`);
    }

    ris.push(ident.toString('hex'));
  }

  return ris;
}


function determineCheater(guid, ris1, ris2) {
  for (let i = 0; i < COIN_RIS_LENGTH; i++) {
    const r1 = Buffer.from(ris1[i], 'hex');
    const r2 = Buffer.from(ris2[i], 'hex');

    const xorResult = Buffer.alloc(r1.length);
    for (let j = 0; j < r1.length; j++) {
      xorResult[j] = r1[j] ^ r2[j];
    }

    const str = xorResult.toString();
    if (str.startsWith(IDENT_STR)) {
      console.log(`Double-spender identified: ${str}`);
      return;
    }
  }

  console.log("Merchant is the cheater (RIS values are identical).");
}

let coin = new Coin('alice', 20, N, E);
coin.signature = signCoin(coin.blinded);
coin.unblind();

let ris1 = acceptCoin(coin);
let ris2 = acceptCoin(coin);

console.log(">> Double spending detection:");
determineCheater(coin.guid, ris1, ris2);

console.log("\n>> Same RIS comparison (should accuse merchant):");
determineCheater(coin.guid, ris1, ris1);
