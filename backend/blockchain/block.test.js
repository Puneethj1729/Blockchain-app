const Block = require ('./block');
const {GENESIS_DATA, MINE_RATE} = require ('../config');
const cryptoHash = require ('../util/crypto-hash');
const hexToBinary=require('hex-to-binary');
describe ('Block Class testing', () => {
  const timestamp = 2000;
  const hash = 'new-hash';
  const lastHash = 'new-lastHash';
  const data = ['blockchain', 'cryptocurrency'];
  const nonce = 1;
  const difficulty = 1;
  const block = new Block ({
    timestamp: timestamp,
    hash: hash,
    lastHash: lastHash,
    data: data,
    nonce: nonce,
    difficulty: difficulty,
  });
  it ('Whether constructor of class has timestamp,data,hash and lastHash property', () => {
    expect (block.timestamp).toEqual (timestamp);
    expect (block.data).toEqual (data);
    expect (block.lastHash).toEqual (lastHash);
    expect (block.hash).toEqual (hash);
    expect (block.nonce).toEqual (nonce);
    expect (block.difficulty).toEqual (difficulty);
  });
  describe ('Genesis function()', () => {
    const genesisBlock = Block.genesis ();

    it ('Checking the genesis block is instance of Block', () => {
      expect (genesisBlock instanceof Block).toBe (true);
    });
    it ('Checking the data match of Genesis block and config file', () => {
      expect (genesisBlock).toEqual (GENESIS_DATA);
    });
  });
  describe ('Mine block testing', () => {
    const lastBlock = Block.genesis ();
    const data = 'mined data';
    const minedBlock = Block.mineBlock ({data, lastBlock});
    it ('Checking the instance of minedBlock', () => {
      expect (minedBlock instanceof Block).toBe (true);
    });
    it ('Checking the lastHash value to be equal to hash of lastBlock', () => {
      expect (minedBlock.lastHash).toEqual (lastBlock.hash);
    });
    it ('Checking the data is equal or not', () => {
      expect (minedBlock.data).toEqual (data);
    });
    it ('Checking the Timestamp of block', () => {
      expect (minedBlock.timestamp).not.toEqual (undefined);
    });
    it ('Checking the hash of Mined Block', () => {
      expect (minedBlock.hash).toEqual (
        cryptoHash (
          minedBlock.data,
          minedBlock.nonce,
          minedBlock.difficulty,
          minedBlock.lastHash,
          minedBlock.timestamp
        )
      );
    });
    it ('Checking the hash matches diffiulty', () => {
      expect (hexToBinary(minedBlock.hash).substring (0, minedBlock.difficulty)).toEqual (
        '0'.repeat (minedBlock.difficulty)
      );
    });
    it('Checking the difficulty of block',()=>{
     const possibleDifficulties=[lastBlock.difficulty+1,lastBlock.difficulty-1];
     expect(possibleDifficulties.includes(minedBlock.difficulty)).toBe(true);
    })
  });
  describe ('adjustDifficulty()', () => {
    it ('increase the difficulty if mining the block speeds up', () => {
      expect (
        Block.adjustDifficulty ({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE - 100,
        })
      ).toEqual (block.difficulty + 1);
    });
    it ('decrease the difficulty if mining the block is slow down', () => {
      expect (
        Block.adjustDifficulty ({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE + 100,
        })
      ).toEqual (block.difficulty - 1);
    });
    it('Checking lower limit of difficulty',()=>{
      block.difficulty=-1;
      expect(Block.adjustDifficulty({originalBlock:block})).toEqual(1);
    })
  });
});
