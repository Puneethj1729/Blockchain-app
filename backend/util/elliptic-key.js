var EC=require('elliptic').ec;
var ec=new EC('secp256k1');
var cryptoHash=require('../util/crypto-hash');
const verifySignature=({publicKey,data,signature})=>{
    const key=ec.keyFromPublic(publicKey,'hex');
    return key.verify(cryptoHash(data),signature);
}
module.exports={ec,verifySignature};
