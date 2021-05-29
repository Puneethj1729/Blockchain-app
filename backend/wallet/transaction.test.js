const Wallet = require ('.');
const {REWARD_INPUT,MINING_REWARD}=require('../config');
const {verifySignature} = require ('../util/elliptic-key');
const Transaction = require ('./transaction');
describe ('Transaction', () => {
  let senderWallet, amount, recipient, transaction;
  beforeEach (() => {
    senderWallet = new Wallet ();
    amount = 50;
    recipient = 'new-data';
    transaction = new Transaction ({senderWallet, amount, recipient});
  });
  it ('Checking the transaction has id field', () => {
    expect (transaction).toHaveProperty ('id');
  });
  describe ('outputMap', () => {
    it ('has an outputMap', () => {
      expect (transaction).toHaveProperty ('outputMap');
    });
    it ('outputs the amount to recipient', () => {
      expect (transaction.outputMap[recipient]).toEqual (amount);
    });
    it ('outputs the balance to the sender Wallet', () => {
      expect (transaction.outputMap[senderWallet.publicKey]).toEqual (
        senderWallet.balance - amount
      );
    });
  });
  describe ('Input', () => {
    it ('has an input property', () => {
      expect (transaction).toHaveProperty ('input');
    });
    it ('has an timestamp in input', () => {
      expect (transaction.input).toHaveProperty ('timestamp');
    });
    it ('amount mathces the senderwallet balance', () => {
      expect (transaction.input.amount).toEqual (senderWallet.balance);
    });
    it ('sets the address to the senderWallet public key', () => {
      expect (transaction.input.address).toEqual (senderWallet.publicKey);
    });
    it ('signs the input', () => {
      expect (
        verifySignature ({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature,
        })
      ).toBe (true);
    });
  });
  describe ('Validating the transaction', () => {
    describe ('When the transaction is valid', () => {
      it ('return true', () => {
        expect (Transaction.isValidTransaction (transaction)).toBe (true);
      });
    });

    describe ('when the transaction is invalid', () => {
      describe ('When the outputMap data is invalid', () => {
        it ('return false', () => {
          transaction.outputMap[senderWallet.publicKey] = 1000;
          expect (Transaction.isValidTransaction (transaction)).toBe (false);
        });
      });
      describe ('When the signature of the transaction is invalid', () => {
        it ('return false', () => {
          transaction.input.signature = new Wallet ().sign ('data');
          expect (Transaction.isValidTransaction (transaction)).toBe (false);
        });
      });
    });
  });
  describe ('update()', () => {
    let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

    describe ('when the amount is invalid', () => {
      it ('returns false', () => {
        expect (()=>
          transaction.update ({
            senderWallet,
            amount: 99999,
            recipient: 'next-data',
          })
        ).toThrowError('Amount exceeds balance');
      });
    });
    describe ('when the amount is valid', () => {
      beforeEach (() => {
        originalSignature = transaction.input.signature;
        originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
        nextAmount = 50;
        nextRecipient = 'next-data';
        transaction.update ({
          senderWallet,
          amount: nextAmount,
          recipient: nextRecipient,
        });
      });

      it ('outputs the amount to next recipient', () => {
        expect (transaction.outputMap[nextRecipient]).toEqual (nextAmount);
      });
      it ('subtracts the amount from original sender output amount', () => {
        expect (transaction.outputMap[senderWallet.publicKey]).toEqual (
          originalSenderOutput - nextAmount
        );
      });
      it ('maintains the total output that matches the input amount', () => {
        expect (
          Object.values (transaction.outputMap).reduce (
            (total, num) => total + num
          )
        ).toEqual (transaction.input.amount);
      });
      it ('re-assigns the transaction', () => {
        expect (transaction.input.signature).not.toEqual (originalSignature);
      });
      describe ('another update for the same recipient', () => {
        let addedAmount;
        beforeEach (() => {
         addedAmount=80;
          transaction.update ({
            senderWallet,
            amount: addedAmount,
            recipient: nextRecipient,
          });
        });

        it ('adds to the recipient amount', () => {
           
          expect (transaction.outputMap[nextRecipient]).toEqual (
            nextAmount + addedAmount
          );
        });
        it ('subtracts the amount from original sender amount', () => {
          expect (transaction.outputMap[senderWallet.publicKey]).toEqual (
            originalSenderOutput - nextAmount - addedAmount
          );
        });
      });
    });
  });
  describe('rewardTransaction()',()=>{
    let rewardTransaction,minerWallet;
    beforeEach(()=>{
      minerWallet=new Wallet();
      rewardTransaction=Transaction.rewardTransaction({minerWallet});
    });
    it("creates the transaction with reward input",()=>{
      expect(rewardTransaction.input).toEqual(REWARD_INPUT);
    });
    it("creates one transaction for miner with MINER_REWARD",()=>{
      expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
    });
  });
});
