const Transaction=require('./transaction');
class TransactionPool{
    constructor(){
        this.transactionMap={};
    }
    setTransaction(transaction){
        this.transactionMap[transaction.id]=transaction;
    }
    setMap(transactionMap){
        this.transactionMap=transactionMap;
    }
    existingTransaction({inputAddress}){
        const transactions=Object.values(this.transactionMap);
        return transactions.find((transaction)=>transaction.input.address===inputAddress);
    }

    validTransactions(){
        const transactions=Object.values(this.transactionMap);
        
        let valid=[];
        for (let i=0;i<transactions.length;i++){
            if(Transaction.isValidTransaction(transactions[i])){
                valid.push(transactions[i]);
            }
        }
        return valid;    
    }
    clear(){
        this.transactionMap={};
    }
    clearBlockchainTransactions({chain}){
        for (let i=1;i<chain.length;i++){
          for (let transaction of chain[i].data){
            if(this.transactionMap[transaction.id]){
                delete this.transactionMap[transaction.id];
            }}
        }
    }

}
module.exports=TransactionPool;