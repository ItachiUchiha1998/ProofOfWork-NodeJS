/**
 * Blockchain Class
 * Methods
 *  - constructor : adds genesis block to chain
 *  - addBlock : create a new block and push to blockchain
 *  - isValidChain : check if chain is valid or not
 *  - replaceChain : replace a chain if its Valid and longest
 */
const Block = require('./block');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock(data) {
        const block = Block.mineBlock(this.chain[this.chain.length - 1],data);
        this.chain.push(block);
        return block;
    }

    isValidChain(chain) {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        for(let i=1;i<chain.length;i++) {
            const block = chain[i];
            const lastBlock =  chain[i-1];
            if( (block.lastHash !== lastBlock.hash) || block.hash !== Block.blockHash(block)  ) return false;
        }

        return true;
    }

    replaceChain(newChain) {

        if(newChain.length <= this.chain.length) {
            console.log("Chain is not longer than the current chain received!");
            return;
        } else if(!this.isValidChain(newChain)){
            console.log("Recieved chain is invalid");
            return;
        }

        console.log("Replacing the current chain with new chain");
        this.chain = newChain;

    }

}

module.exports = Blockchain;

