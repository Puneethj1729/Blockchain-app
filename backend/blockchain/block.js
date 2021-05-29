const hexToBinary=require('hex-to-binary');
const {GENESIS_DATA,MINE_RATE}=require('../config');
const cryptoHash=require('../util/crypto-hash');
class Block {
 constructor({timestamp, lastHash, data,hash,nonce,difficulty}) {
       this.timestamp = timestamp;
       this.lastHash = lastHash;
       this.data = data;
       this.hash = hash;
       this.nonce=nonce;
       this.difficulty=difficulty;
 }
 //Creating a Genesis block
 static genesis(){
       return new this(GENESIS_DATA);
 }
 //Mining a New Block
 static mineBlock({data,lastBlock}){
     let hash,timestamp;
     const lastHash=lastBlock.hash;
     let difficulty;
     let nonce=0;
     do{
         nonce++;
         timestamp=Date.now();
         difficulty=Block.adjustDifficulty({originalBlock:lastBlock,timestamp});
         hash=cryptoHash(data,lastHash,difficulty,nonce,timestamp);
     }while(hexToBinary(hash).substring(0,difficulty)!=='0'.repeat(difficulty));
     return new this({
         timestamp,
         data,
         lastHash,
         nonce,
         difficulty,
         hash   
     });
 }
 //Adjsuting the dynamic difficulty
 static adjustDifficulty({originalBlock,timestamp}){
     const difficulty=originalBlock.difficulty;
     if(difficulty<1){
         return 1;
     }
     if ((timestamp-originalBlock.timestamp)>MINE_RATE){
         return difficulty-1;
     }
     return difficulty+1;
 }
}
module.exports=Block;

