const Transaction=require('../wallet/transaction');
class TransactionMiner{
    constructor({blockChain,wallet,transactionPool,pubsub}){
        this.blockChain=blockChain;
        this.wallet=wallet;
        this.transactionPool=transactionPool;
        this.pubsub=pubsub;
    }
    mineTransactions(){
        //get the valid transactions from transaction Pool
        const validTransactions=this.transactionPool.validTransactions();
        
        //Generate Miner Reward
        validTransactions.push(Transaction.rewardTransaction({minerWallet:this.wallet}));
        //Add the transactions to blockchain
        this.blockChain.addblock({data:validTransactions});
        //Broadcast the updated blockchain
        this.pubsub.broadcastChain();
        //Clear the transaction pool
        this.transactionPool.clear();
    }
}
module.exports=TransactionMiner;