const Block = require ('./block');
const cryptoHash = require ('../util/crypto-hash');
const {REWARD_INPUT, MINING_REWARD}=require('../config');
const Transaction=require('../wallet/transaction');
const Wallet=require('../wallet');
class Blockchain {
  constructor () {
    this.chain = [Block.genesis ()];
  }
  //Addding a New Block
  addblock({data}) {
    const lastBlock = this.chain[this.chain.length - 1];
    const newBlock = Block.mineBlock ({data, lastBlock});
    this.chain.push (newBlock);
  }
  //Transaction Data Validation
  isValidTransactionData({chain}){
    for(let i=1;i<chain.length;i++){
      let rewardCount=0;
      let transactionSet=new Set();
      for(let transaction of chain[i].data){
        
        if(transaction.input.address===REWARD_INPUT.address){
          rewardCount+=1;
          if(rewardCount>1){
            return false;
          }
          if(Object.values(transaction.outputMap)[0]!== MINING_REWARD){
            return false;
          }
        }
        else{
          if(!Transaction.isValidTransaction(transaction)){
            return false;
          }
          const trueBalance=Wallet.calculateBalance({
            address:transaction.input.address,
            chain:this.chain
          });
          if(transaction.input.amount!==trueBalance){
            return false;
          }
          if(transactionSet.has(transaction)){
            return false;
          }
          else{
            transactionSet.add(transaction);
          }
        }
      }
    }
    return true;
  }
  //Chain Validation
  static isValidChain (chain) {
    if (JSON.stringify (chain[0]) !== JSON.stringify (Block.genesis ())) {
      
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const lastHash = chain[i].lastHash;
      const actualLastHash = chain[i - 1].hash;
      const lastDifficulty=chain[i-1].difficulty;
      if (lastHash !== actualLastHash) {
        
        return false;
      }
      const validateHash = cryptoHash (
        chain[i].timestamp,
        chain[i].lastHash,
        chain[i].data,
        chain[i].nonce,
        chain[i].difficulty
      );
      if (validateHash !== chain[i].hash) {
        
        return false;
      }
      if(Math.abs(chain[i].difficulty-lastDifficulty)>1){
        
        return false;
      }
    }

    return true;
  }
  //Replacing the longer chain with smaller one
  replaceChain(chain,validate,onSuccess){
    
    if(chain.length<=this.chain.length){
      
      return;
    }
    if(!Blockchain.isValidChain(chain)){
      
      return;
    }
    if(validate && !this.isValidTransactionData({chain})){
      return;
    }
    if(onSuccess){
      onSuccess();
    }
    this.chain=chain;
    
  }
}
module.exports = Blockchain;
