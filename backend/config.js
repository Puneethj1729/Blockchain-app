const MINE_RATE=1000;
const INITIAL_DIFFICULTY=3;
const GENESIS_DATA={

    timestamp:1
,
    hash:'35636sagshdjdajjskdweyjerieregkrer73dyhjfquyiuw',
    lastHash:'2465314873950932928374891923879303u22281923827rhesjgdhsshgakhahddhdsjadhjakdhfj',
    data:[],
    nonce:0,
    difficulty:INITIAL_DIFFICULTY
}
const STARTING_BALANCE=1000;
const REWARD_INPUT={address:'*authorized-reward*'};
const MINING_REWARD=50;
module.exports={REWARD_INPUT,MINING_REWARD, GENESIS_DATA,MINE_RATE,STARTING_BALANCE};