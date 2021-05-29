const {v4: uuidv4} = require ('uuid');
const {verifySignature} = require ('../util/elliptic-key');
const {REWARD_INPUT, MINING_REWARD} = require ('../config');
class Transaction {
  constructor({senderWallet, amount, recipient, input, outputMap}) {
    this.id = uuidv4 ();
    this.outputMap =
      outputMap || this.createOutputMap ({senderWallet, amount, recipient});
    this.input =
      input || this.createInput ({senderWallet, outputMap: this.outputMap});
  }
  //Output Map is only for making the multiple recipients to transact through a transaction
  createOutputMap({senderWallet, amount, recipient}) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }
  createInput({senderWallet, outputMap}) {
    return {
      timestamp: Date.now (),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign (outputMap),
    };
  }
  static isValidTransaction (transaction) {
    const {input, outputMap} = transaction;
    const {address, amount, signature} = input;
    const outputMapTotal = Object.values (outputMap).reduce (
      (total, num) => total + num
    );
    if (outputMapTotal !== amount) {
      
      return false;
    }
    if (!verifySignature ({publicKey: address, data: outputMap, signature})) {
      return false;
    }
    return true;
  }
  update({senderWallet, amount, recipient}) {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error ('Amount exceeds balance');
    }
    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }
    this.outputMap[senderWallet.publicKey] -= amount;
    this.input = this.createInput ({senderWallet, outputMap: this.outputMap});
  }
  static rewardTransaction({minerWallet}) {
    return new this ({
      input: REWARD_INPUT,
      outputMap: {[minerWallet.publicKey]: MINING_REWARD},
    });
  }
}
module.exports = Transaction;
