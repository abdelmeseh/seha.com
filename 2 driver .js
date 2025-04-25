// "use strict";

// let blindSignatures = require('blind-signatures');
// let SpyAgency = require('./spyAgency.js').SpyAgency;


// function makeDocument(coverName) {
//   return `The bearer of this signed document, ${coverName}, has full diplomatic immunity.`;
// }


// function blind(msg, n, e) {
//   return blindSignatures.blind({
//     message: msg,
//     N: n,
//     E: e,
//   });
// }

// function unblind(blindingFactor, sig, n) {
//   return blindSignatures.unblind({
//     signed: sig,
//     N: n,
//     r: blindingFactor,
//   });
// }

// let agency = new SpyAgency();

// const coverNames = [
//   "Agent X", "Agent Y", "Agent Z", "John Doe", "Jane Doe",
//   "Mr. Smith", "Ms. Johnson", "Dr. Brown", "Captain Rogers", "Black Widow"
// ];

// let documents = coverNames.map(makeDocument);
// let blindDocs = [];
// let blindingFactors = [];


// for (let doc of documents) {
//   let { blinded, r } = blind(doc, agency.n, agency.e);
//   blindDocs.push(blinded);
//   blindingFactors.push(r);
// }

// agency.signDocument(blindDocs, (selected, verifyAndSign) => {
//   let filteredFactors = blindingFactors.map((r, i) => (i === selected ? undefined : r));
//   let filteredDocs = documents.map((doc, i) => (i === selected ? undefined : doc));

//   let blindedSignature = verifyAndSign(filteredFactors, filteredDocs);
  
//   let unblindedSignature = unblind(blindingFactors[selected], blindedSignature, agency.n);

//   console.log(`✔️ التوقيع الأصلي للمستند "${coverNames[selected]}":`);
//   console.log(unblindedSignature);
// });


// "use strict";

// let blindSignatures = require('blind-signatures');
// let SpyAgency = require('./spyAgency.js').SpyAgency;

// function makeDocument(coverName) {
//   return `The bearer of this signed document, ${coverName}, has full diplomatic immunity.`;
// }

// function blind(msg, n, e) {
//   return blindSignatures.blind({
//     message: msg,
//     N: n,
//     E: e,
//   });
// }

// function unblind(blindingFactor, sig, n) {
//   return blindSignatures.unblind({
//     signed: sig,
//     N: n,
//     r: blindingFactor,
//   });
// }

// let agency = new SpyAgency();

// const coverNames = [
//   "Agent X", "Agent Y", "Agent Z", "John Doe", "Jane Doe",
//   "Mr. Smith", "Ms. Johnson", "Dr. Brown", "Captain Rogers", "Black Widow"
// ];

// let documents = coverNames.map(makeDocument);
// let blindDocs = [];
// let blindingFactors = [];

// for (let doc of documents) {
//   let { blinded, r } = blind(doc, agency.n, agency.e);
//   blindDocs.push(blinded);
//   blindingFactors.push(r);
// }

// agency.signDocument(blindDocs, (selected, verifyAndSign) => {
//   let filteredFactors = blindingFactors.filter((_, i) => i !== selected);
//   let filteredDocs = documents.filter((_, i) => i !== selected);

//   let blindedSignature = verifyAndSign(filteredFactors, filteredDocs);

//   if (!blindedSignature) {
//     console.error("❌ خطأ: فشل توقيع المستند!");
//     return;
//   }

//   let unblindedSignature = unblind(blindingFactors[selected], blindedSignature, agency.n);

//   console.log(`✔️ التوقيع الأصلي للمستند "${coverNames[selected]}":`);
//   console.log(unblindedSignature);
// });


"use strict";

let blindSignatures = require('blind-signatures');
let SpyAgency = require('./spyAgency.js').SpyAgency;

function makeDocument(coverName) {
  return `The bearer of this signed document, ${coverName}, has full diplomatic immunity.`;
}

function blind(msg, n, e) {
  return blindSignatures.blind({
    message: msg,
    N: n,
    E: e,
  });
}

function unblind(blindingFactor, sig, n) {
  return blindSignatures.unblind({
    signed: sig,
    N: n,
    r: blindingFactor,
  });
}

let agency = new SpyAgency();

const coverNames = [
  "Agent X", "Agent Y", "Agent Z", "John Doe", "Jane Doe",
  "Mr. Smith", "Ms. Johnson", "Dr. Brown", "Captain Rogers", "Black Widow"
];

let documents = coverNames.map(makeDocument);
let blindDocs = [];
let blindingFactors = [];

for (let doc of documents) {
  let { blinded, r } = blind(doc, agency.n, agency.e);
  blindDocs.push(blinded);
  blindingFactors.push(r);
}

agency.signDocument(blindDocs, (selected, verifyAndSign) => {
  let filteredFactors = blindingFactors.filter((_, i) => i !== selected);
  let filteredDocs = documents.filter((_, i) => i !== selected);

  let blindedSignature = verifyAndSign(filteredFactors, filteredDocs);

  if (!blindedSignature) {
    console.error("❌ خطأ: فشل توقيع المستند!");
    return;
  }

  let unblindedSignature = unblind(blindingFactors[selected], blindedSignature, agency.n);

  console.log(`✔️ التوقيع الأصلي للمستند "${coverNames[selected]}":`);
  console.log(unblindedSignature);
});
