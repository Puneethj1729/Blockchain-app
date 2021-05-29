const express = require ('express');
const request = require ('request');
const Blockchain = require ('./blockchain/index');
const PubSub = require ('./app/pubsub');
const TransactionPool = require ('./wallet/transaction-pool');
const Wallet = require ('./wallet/index');
const TransactionMiner = require ('./app/transaction-miner');
const app = express ();
app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
      next();
    });
app.use (express.urlencoded ({extended: true}));
app.use (express.json ());
const blockChain = new Blockchain ();
const transactionPool = new TransactionPool ();
const wallet = new Wallet ();
const pubsub = new PubSub ({blockChain, transactionPool, wallet});
const transactionMiner = new TransactionMiner ({
  blockChain,
  transactionPool,
  wallet,
  pubsub,
});
const DEFAULT_PORT = 4000;
const ROOT_NODE_ADDRESS = 'http://localhost:' + DEFAULT_PORT;

app.get ('/api/blocks', (req, res) => {
  res.json (blockChain.chain);
});
app.post ('/api/mine', (req, res) => {
  const data = req.body.data;

  blockChain.addblock ({data});
  pubsub.broadcastChain ();
  res.redirect ('/api/blocks');
});
app.post ('/api/transact', (req, res) => {
  let {amount, recipient} = req.body;
  amount=Number(amount);
  
  let transaction = transactionPool.existingTransaction ({
    inputAddress: wallet.publicKey,
  });
  try {
    if (transaction) {
      transaction.update ({
        senderWallet: wallet,
        recipient,
        amount,
      });
    } else {
      transaction = wallet.createTransaction ({
        amount,
        recipient,
        chain: blockChain.chain,
      });
    }
  } catch (error) {
    return res.status (400).json ({type: 'error', message: error.message});
  }
  
  transactionPool.setTransaction (transaction);
  pubsub.broadcastTransaction (transaction);
  res.json ({transaction});
});
app.get ('/api/transaction-pool-map', (req, res) => {
  res.json (transactionPool.transactionMap);
});
app.get ('/api/mine-transactions', (req, res) => {
  transactionMiner.mineTransactions ();
  res.redirect ('/api/blocks');
});
app.get ('/api/wallet-info', (req, res) => {
  res.json ({
    address: wallet.publicKey,
    balance: Wallet.calculateBalance ({
      chain: blockChain.chain,
      address: wallet.publicKey,
    })
  });
});
app.get('/api/known-address',(req,res)=>{
  const addressMap={};
  for(let block of blockChain.chain){
    for(let transaction of block.data){
      const recipients=Object.keys(transaction.outputMap);
      recipients.forEach(recipient=>addressMap[recipient]=recipient)
    }
  }
  res.json(Object.keys(addressMap));
});
const syncWithRootState = () => {
  request (
    {url: ROOT_NODE_ADDRESS + '/api/blocks'},
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse (body);
        console.log ('Replacing with root chain ', rootChain);
        blockChain.replaceChain (rootChain);
      }
    }
  );
  request (
    {url: ROOT_NODE_ADDRESS + '/api/transaction-pool-map'},
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse (body);
        console.log (
          'Replace the transaction pool map with',
          rootTransactionPoolMap
        );
        transactionPool.setMap (rootTransactionPoolMap);
      }
    }
  );
};

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil (Math.random () * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen (PORT, err => {
  if (!err) {
    console.log ('Server started succesfully at ' + PORT);
  }
  if (PORT !== DEFAULT_PORT) {
    syncWithRootState ();
  }
});
