const Wallet = require ('./index');
const Transaction = require ('./transaction');
const Blockchain = require ('../blockchain/index');
const {verifySignature} = require ('../util/elliptic-key');
const {STARTING_BALANCE} = require ('../config');
describe ('Wallet object check', () => {
  let wallet;
  beforeEach (() => {
    wallet = new Wallet ();
  });
  it ('has a balance', () => {
    expect (wallet).toHaveProperty ('balance');
  });
  it ('has a public Key', () => {
    expect (wallet).toHaveProperty ('publicKey');
  });
  describe ('Signing the data', () => {
    const data = 'puneeth';
    it ('Verfiying the data', () => {
      expect (
        verifySignature ({
          data,
          publicKey: wallet.publicKey,
          signature: wallet.sign (data),
        })
      ).toBe (true);
    });
    it ('does not verify the invalid signature', () => {
      expect (
        verifySignature ({
          data,
          publicKey: wallet.publicKey,
          signature: new Wallet ().sign (data),
        })
      ).toBe (false);
    });
  });
  describe ('createTransaction()', () => {
    describe ('When the amount exceeds the balance', () => {
      it ('throws an error', () => {
        expect (() =>
          wallet.createTransaction ({amount: 999999, recipient: 'new-data'})
        ).toThrowError ('Amount exceeds balance');
      });
    });
    describe ('When the amount is valid', () => {
      let amount, recipient, transaction;
      beforeEach (() => {
        amount = 50;
        (recipient = 'new-data'), (transaction = wallet.createTransaction ({
          amount,
          recipient,
        }));
      });
      it ('creates instance of Transaction', () => {
        expect (transaction instanceof Transaction).toBe (true);
      });
      it ('matches the transaction input matches wallet', () => {
        expect (transaction.input.address).toEqual (wallet.publicKey);
      });
      it ('outputs the amount to recipient', () => {
        expect (transaction.outputMap[recipient]).toEqual (amount);
      });
    });
    describe ('When chain is passed', () => {
      it ('calls wallet.calculateBalance()', () => {
        const calculateBalanceMock = jest.fn ();
        const originalCB = Wallet.calculateBalance;
        Wallet.calculateBalance = calculateBalanceMock;
        wallet.createTransaction ({
          recipient: 'new-data',
          amount: 50,
          chain: new Blockchain ().chain,
        });
        expect (calculateBalanceMock).toHaveBeenCalled ();
        Wallet.calculateBalance = originalCB;
      });
    });
  });
  describe ('calcluateBalance()', () => {
    let blockChain;
    beforeEach (() => {
      blockChain = new Blockchain ();
    });
    describe ('no outputs  for the wallet', () => {
      it ('returns the starting balance', () => {
        expect (
          Wallet.calculateBalance ({
            chain: blockChain.chain,
            address: wallet.publicKey,
          })
        ).toEqual (STARTING_BALANCE);
      });
    });
    describe ('have outputs for the wallet', () => {
      let transactionOne, transactionTwo;
      beforeEach (() => {
        transactionOne = new Wallet ().createTransaction ({
          recipient: wallet.publicKey,
          amount: 50,
        });
        transactionTwo = new Wallet ().createTransaction ({
          recipient: wallet.publicKey,
          amount: 60,
        });
        blockChain.addblock ({data: [transactionOne, transactionTwo]});
      });
      it ('adds the outputs to the wallet balance', () => {
        expect (
          Wallet.calculateBalance ({
            chain: blockChain.chain,
            address: wallet.publicKey,
          })
        ).toEqual (
          STARTING_BALANCE +
            transactionOne.outputMap[wallet.publicKey] +
            transactionTwo.outputMap[wallet.publicKey]
        );
      });
      describe ('and the wallet has made a transaction', () => {
        let recentTransaction;
        beforeEach (() => {
          recentTransaction = wallet.createTransaction ({
            recipient: 'foo-bar',
            amount: 50,
          });
          blockChain.addblock ({data: [recentTransaction]});
        });
        it ('returns the output amount of recent transaction', () => {
          expect (
            Wallet.calculateBalance ({
              chain: blockChain.chain,
              address: wallet.publicKey,
            })
          ).toEqual (recentTransaction.outputMap[wallet.publicKey]);
        });
        describe ('and there are outputs next to and after the transaction', () => {
          let sameBlockTransaction, nextBlockTransaction;
          beforeEach (() => {
            recentTransaction = wallet.createTransaction ({
              recipient: 'later-foo-address',
              amount: 60,
            });
            sameBlockTransaction = Transaction.rewardTransaction ({
              minerWallet: wallet,
            });
            blockChain.addblock ({
              data: [recentTransaction, sameBlockTransaction],
            });
            nextBlockTransaction = new Wallet ().createTransaction ({
              recipient: wallet.publicKey,
              amount: 75,
            });
            blockChain.addblock ({data: [nextBlockTransaction]});
          });
          it ('includes the output amount in the returned balance', () => {
            expect (
              Wallet.calculateBalance ({
                chain: blockChain.chain,
                address: wallet.publicKey,
              })
            ).toEqual (
              recentTransaction.outputMap[wallet.publicKey] +
                sameBlockTransaction.outputMap[wallet.publicKey] +
                nextBlockTransaction.outputMap[wallet.publicKey]
            );
          });
        });
      });
    });
  });
});
