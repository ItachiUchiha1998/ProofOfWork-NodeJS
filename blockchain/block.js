/**
 * Block Class 
 *  Methods
 *  - constructor : block creation
 *  - toString : display block in readable format
 *  - genesis : Genesis block creation | static
 *  - hash : generate hash | static
 *  - mineBlock : block miner function | static
 *  - blockHash : return a given block Hash value | static
 *  - adjustDifficulty : adjust diff according to time taken to mine previous block
 */

const SHA256 = require('crypto-js/sha256'); // sha-256 algorithm
const { DIFFICULTY,MINE_RATE } = require('../config.js');

class Block {

    constructor(timestamp,lastHash,hash,data,nonce,difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString() {
        return `Block -
            TimeStamp : ${this.timestamp}
            LastHash : ${this.lastHash.substring(0,10)}
            Hash : ${this.hash.substring(0,10)}
            Data : ${this.data}
            Nonce     : ${this.nonce}
            Difficulty: ${this.difficulty}
        `;
    }

    static genesis(){
        return new this('Genesis time','----','f1574-h4gh',[],0,DIFFICULTY);
    }

    static hash(timestamp,lastHash,data,nonce,difficulty){
        return SHA256(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    static mineBlock(lastBlock,data) {
        let hash;
        let timestamp;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock,timestamp);
            hash = Block.hash(timestamp,lastHash,data,nonce,difficulty);
        } while(hash.substring(0,difficulty) !== '0'.repeat(difficulty)); // if req no. of zeroes are found
        
        return new this(timestamp,lastHash,hash,data,nonce,difficulty);
    }

    static blockHash(block){
        const { timestamp, lastHash, data, nonce,difficulty } = block;
        return Block.hash(timestamp,lastHash,data,nonce,difficulty);
    }

    static adjustDifficulty(lastBlock,currentTime) {
        let {difficulty} = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1; // if lastblock took lot of time,next block will take less
        return difficulty;
    }

}

module.exports = Block;

