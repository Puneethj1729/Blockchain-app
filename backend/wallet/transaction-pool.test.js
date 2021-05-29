const TransactionPool=require('./transaction-pool');
const Transaction=require('./transaction');
const Wallet=require('./index');
const Blockchain=require('../blockchain/index');
describe("Transaction Pool",()=>{
    let transactionPool,transaction,senderWallet;
    beforeEach(()=>{
        transactionPool=new TransactionPool();
        senderWallet=new Wallet();
        transaction=new Transaction({
            senderWallet,
            recipient:'next-data',
            amount:50
        });
    });
    describe("Set Transactions",()=>{
        it("Adds the transaction",()=>{
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });
    describe("existing Transaction()",()=>{
        it("returns an existing transaction given an input address",()=>{
            transactionPool.setTransaction(transaction);
            expect(transactionPool.existingTransaction({inputAddress:senderWallet.publicKey})).toBe(transaction);
        });
    });
    describe("validTransactions()",()=>{
        let validTransactions;
        beforeEach(()=>{
            validTransactions=[];
            for (let i=0;i<10;i++){
                transaction=new Transaction({
                    senderWallet,
                    recipient:'new-data',
                    amount:50
                });
                if(i%3===0){
                    transaction.input.amount=99999;
                }
                else if(i%3===1){
                    transaction.input.signature=new Wallet().sign('data');
                }
                else{
                    validTransactions.push(transaction);
                }
                transactionPool.setTransaction(transaction);
            }
        });
        it("returns valid transactions",()=>{
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });
    });
    describe("clear()",()=>{
        it('clears thr transaction pool',()=>{
            transactionPool.clear();
            expect(transactionPool.transactionMap).toEqual({});
        });
    });
    describe('clearBlockchainTransactions()',()=>{
        it("clears the pool of any existing blockchain transactions",()=>{
            const blockChain=new Blockchain();
            const expectedTransactionMap={};
            for(let i=0;i<6;i++){
                const transaction=new Wallet().createTransaction({recipient:'new-data',amount:30});
                transactionPool.setTransaction(transaction);
                if(i%2===0){
                blockChain.addblock({data:[transaction]});
            }
            else{
                expectedTransactionMap[transaction.id]=transaction;
            }
            }
            transactionPool.clearBlockchainTransactions({chain:blockChain.chain});
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
});