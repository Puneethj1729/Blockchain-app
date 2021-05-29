const PubNub = require ('pubnub');
const credentials = {
  publishKey: 'pub-c-963c7b77-dbc6-4384-8009-556dbeac8105',
  subscribeKey: 'sub-c-cce079f8-bb28-11eb-9c3c-fe487e55b6a4',
  secretKey: 'sec - c - Y2Q3MGZkM2YtNDRlZS00ZTQxLThmZDItZWE1YmYyMjNhYzQy',
};
const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
};
class PubSub {
  constructor({blockChain, transactionPool, wallet}) {
    this.blockChain = blockChain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubnub = new PubNub (credentials);
    this.pubnub.subscribe ({
      channels: Object.values (CHANNELS),
    });
    this.pubnub.addListener ({
      message: event => {
        

        const parsedMessage = JSON.parse (event.message);
        switch (event.channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockChain.replaceChain (parsedMessage, true ,()=>{
              this.transactionPool.clearBlockchainTransactions({chain:parsedMessage});
            });
            break;
          case CHANNELS.TRANSACTION:
            //Checking the transaction is not self one
            if (parsedMessage.input.address !== this.wallet.publicKey) {
              this.transactionPool.setTransaction(parsedMessage);
            }
            break;
          default:
            return;
        }
      },
    });
  }
  publish({channel, message}) {
    this.pubnub.publish ({channel, message});
  }
  broadcastChain () {
    this.publish ({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify (this.blockChain.chain),
    });
  }
  broadcastTransaction (transaction) {
    this.publish ({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify (transaction),
    });
  }
}

module.exports = PubSub;
