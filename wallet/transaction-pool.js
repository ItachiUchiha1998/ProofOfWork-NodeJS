/**
 * TransactionPool Class : collection of all transaction in a pool
 *  - constructor : transaction pool array init
 *  - updateOrAddTransaction : update or add a new transaction
 *  - validTransaction : check validity of each transaction in pool
 *  - clear : clear transaction pool
 */
const Transaction = require('./transaction');

class TransactionPool {
    
    constructor() {
        this.transactions = [];
    }
    
    updateOrAddTransaction(transaction){
        let transactionWithId = this.transactions.find(t => t.id === transaction.id);

        if(transactionWithId) this.transactions[this.transactions.
                                                indexOf(transactionWithId)] = transaction;
        else this.transactions.push(transaction);

    }

    existingTransaction(address){
        return this.transactions.find(t => t.input.address === address);
    }

    validTransactions(){
        /**
         * valid transactions are the one whose total output amounts to the input
         * and whose signatures are same
         */
        return this.transactions.filter((transaction)=>{
           
            const outputTotal = transaction.outputs.reduce((total,output)=>{
                return total + output.amount;
            },0)
            
            if( transaction.input.amount !== outputTotal ){
                console.log(`Invalid transaction from ${transaction.input.address}`);
                return;
            }

            if(!Transaction.verifyTransaction(transaction)){
                console.log(`Invalid signature from ${transaction.input.address}`);
                return;
            }

            return transaction;
        })
    }

    clear(){
        this.transactions = [];
    }
    
};

module.exports = TransactionPool;