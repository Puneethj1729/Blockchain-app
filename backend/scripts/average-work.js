const Blockchain=require('../blockchain/index');
const blockChain=new Blockchain();
let prevTimeStamp,nextTimeStamp,timeDiff,nextBlock;
const times=[];
for (let i=0;i<1000;i++){
    prevTimeStamp=blockChain.chain[blockChain.chain.length-1].timestamp;
    blockChain.addblock({data:'block'+i});
    nextBlock=blockChain.chain[blockChain.chain.length-1];
    nextTimeStamp=nextBlock.timestamp;
    timeDiff=nextTimeStamp-prevTimeStamp;
    times.push(timeDiff);
    average=times.reduce((total,ele)=>(total+ele))/times.length;
    console.log('Mine time for each block is'+timeDiff+'ms. The Difficulty of a block is'+nextBlock.difficulty+' The average time for creation of block is'+average+'ms');

}