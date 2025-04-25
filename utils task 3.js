"use strict";

const crypto = require('crypto');
const HASH_ALG = 'sha256';

function makeOTP({ string, buffer }) {
  if ((!string && !buffer) || (string && buffer)) {
    throw new Error("Either string or buffer should be specified, but not both");
  }

  if (string) {
    buffer = Buffer.from(string);
  }

  const key = crypto.randomBytes(buffer.length);
  const ciphertext = Buffer.alloc(buffer.length);

  for (let i = 0; i < buffer.length; i++) {
    ciphertext[i] = buffer[i] ^ key[i];
  }

  return { key, ciphertext };
}

function decryptOTP({ key, ciphertext, returnType }) {
  if (key.length !== ciphertext.length) {
    throw new Error("Key and ciphertext length mismatch.");
  }

  const p = Buffer.alloc(key.length);
  for (let i = 0; i < key.length; i++) {
    p[i] = key[i] ^ ciphertext[i];
  }

  if (!returnType || returnType === 'buffer') return p;
  if (returnType === 'string') return p.toString();

  throw new Error(`Unsupported return type: ${returnType}`);
}

function makeGUID() {
  return crypto.randomBytes(48).toString('hex');
}

function hash(s) {
  s = s.toString();
  return crypto.createHash(HASH_ALG).update(s).digest('hex');
}

const MAX_RANGE = 256;

function sample() {
  return crypto.randomBytes(1).readUInt8();
}

function randInt(range) {
  if (range > MAX_RANGE) {
    throw new Error("Range too big.");
  }

  const q = Math.floor(MAX_RANGE / range);
  const max = q * range;

  let n;
  do {
    n = sample();
  } while (n >= max);

  return n % range;
}

exports.makeOTP = makeOTP;
exports.decryptOTP = decryptOTP;
exports.makeGUID = makeGUID;
exports.hash = hash;
exports.randInt = randInt;
