const Blockchain = require ('./index');
const Block = require ('./block');
const cryptoHash = require ('../util/crypto-hash');
const Transaction = require ('../wallet/transaction');
const Wallet = require ('../wallet/index');
describe ('Blockchain testing', () => {
  let blockChain;
  let newChain;
  let originalChain;
  beforeEach (() => {
    blockChain = new Blockchain ();
    newChain = new Blockchain ();
    originalChain = blockChain.chain;
  });
  it ('Checking the instance of Chain to be array', () => {
    expect (blockChain.chain instanceof Array).toBe (true);
  });
  it ('Checking the first block to be genesis block', () => {
    expect (blockChain.chain[0]).toEqual (Block.genesis ());
  });
  it ('Checking Addition of newblock function', () => {
    const newData = 'new data';
    blockChain.addblock ({data: newData});
    expect (blockChain.chain[blockChain.chain.length - 1].data).toEqual (
      newData
    );
  });

  describe ('isValidChain()', () => {
    describe ('Blockchain not starting with genesis block', () => {
      it ('returns false', () => {
        blockChain.chain[0] = new Block ({data: 'fake-genesis-data'});
        expect (Blockchain.isValidChain (blockChain.chain)).toBe (false);
      });
    });
    describe ('Blockchain starting with genesis block and contains multiple blocks', () => {
      beforeEach (() => {
        blockChain.addblock ({data: 'puneeth'});
        blockChain.addblock ({data: 'sneha'});
        blockChain.addblock ({data: 'preethu'});
      });
      describe ('When the last refrence was altered', () => {
        it ('return false', () => {
          blockChain.chain[2].lastHash = 'last hash altered';
          expect (Blockchain.isValidChain (blockChain.chain)).toBe (false);
        });
      });
      describe ('when the block contains a invalid data', () => {
        it ('returns false', () => {
          blockChain.chain[1].data = 'some bad evil data';
          expect (Blockchain.isValidChain (blockChain.chain)).toBe (false);
        });
      });
      describe ('When the difficulty of the block jumps', () => {
        it ('return false', () => {
          const lastBlock = blockChain.chain[blockChain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const data = 'sweie';
          const timestamp = Date.now ();
          const nonce = 0;
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash (
            timestamp,
            data,
            nonce,
            difficulty,
            lastHash
          );
          const badBlock = new Block ({
            timestamp,
            data,
            nonce,
            difficulty,
            hash,
            lastHash,
          });
          blockChain.chain.push (badBlock);
          expect (Blockchain.isValidChain (blockChain.chain)).toBe (false);
        });
      });
      describe ("when chain doesn't contain invalid blocks", () => {
        it ('return true', () => {
          expect (Blockchain.isValidChain (blockChain.chain)).toBe (true);
        });
      });
    });
  });
  describe ('replaceChain()', () => {
    describe ('When the new chain is not longer than original chain', () => {
      it ('does not replaces the chain', () => {
        newChain.chain.pop ();
        blockChain.replaceChain (newChain.chain);
        expect (blockChain.chain).toEqual (originalChain);
      });
    });
    describe ('When the new chain is longer', () => {
      beforeEach (() => {
        newChain.addblock ({data: 'puneeth'});
        newChain.addblock ({data: 'sneha'});
        newChain.addblock ({data: 'preethu'});
      });
      describe ('When the chain contains invalid data', () => {
        it ('Does not replaces the chain', () => {
          newChain.chain[2].hash = 'some-fake-hash';
          blockChain.replaceChain (newChain.chain);
          expect (blockChain.chain).toEqual (originalChain);
        });
      });
      describe ('and the chain is valid', () => {
        it ('Replaces the chain', () => {
          blockChain.replaceChain (newChain.chain);
          expect (blockChain.chain).toEqual (newChain.chain);
        });
      });
    });
  });
  describe ('validTransactionData()', () => {
    let transaction, rewardTransaction, wallet;
    beforeEach (() => {
      wallet = new Wallet ();
      transaction = wallet.createTransaction ({
        recipient: 'new-data',
        amount: 60,
      });
      rewardTransaction = Transaction.rewardTransaction ({minerWallet: wallet});
    });
    describe ('and the transaction data is valid', () => {
      it ('returns true', () => {
        newChain.addblock ({data: [transaction, rewardTransaction]});
        expect (
          blockChain.isValidTransactionData ({chain: newChain.chain})
        ).toBe (true);
      });
    });
    describe ('when the transaction data has multiple rewards', () => {
      it ('returns false', () => {
        newChain.addblock ({
          data: [transaction, rewardTransaction, rewardTransaction],
        });
        expect (
          blockChain.isValidTransactionData ({chain: newChain.chain})
        ).toBe (false);
      });
    });
    describe ('and the transaction data has atleast one malfunctioned output', () => {
      describe ('when the transaction is not a reward transaction', () => {
        it ('returns false', () => {
          transaction.outputMap[wallet.publicKey] = 99999;
          newChain.addblock ({data: [transaction, rewardTransaction]});

          expect (
            blockChain.isValidTransactionData ({chain: newChain.chain})
          ).toBe (false);
        });
      });
      describe ('when the transaction is a reward transaction', () => {
        it ('returns false', () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999;
          newChain.addblock ({data: [transaction, rewardTransaction]});
          expect (
            blockChain.isValidTransactionData ({chain: newChain.chain})
          ).toBe (false);
        });
      });
    });
    describe ('and the transaction data has atleast one malfunctioned input', () => {
      it ('returns false', () => {
        wallet.balance = 9000;
        evilOutputMap = {
          [wallet.publicKey]: 8500,
          ['foo-var']: 500,
        };
        input = {
          timestamp: Date.now (),
          address: wallet.publicKey,
          amount: wallet.balance,
          signature: wallet.sign (evilOutputMap),
        };
        const evilTransaction = new Transaction ({
          input,
          outputMap: evilOutputMap,
        });
        newChain.addblock ({data: [evilTransaction, rewardTransaction]});
        expect (
          blockChain.isValidTransactionData ({chain: newChain.chain})
        ).toBe (false);
      });
    });
    describe ('and when the block contains multiple identical transactions', () => {
      it ('returns false', () => {
        newChain.addblock({data:[transaction,transaction,transaction]});
        expect(blockChain.isValidTransactionData({chain:newChain.chain})).toBe(false);
      });
    });
  });
});
