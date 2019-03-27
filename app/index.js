const express = require('express');
const bodyParser = require('body-parser');

const Blockchain = require('../blockchain');
const P2pserver = require('./p2p-server.js');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3000;

const app  = express();

app.use(bodyParser.json());

const blockchain = new Blockchain(); // create new blockchain instance
const transactionPool = new TransactionPool(); // transaction instance
const wallet = new Wallet(); // wallet inst
const p2pserver = new P2pserver(blockchain,transactionPool); // p2p inst
const miner = new Miner(blockchain,transactionPool,wallet,p2pserver); // miner instance

app.get('/blocks',(req,res) => { // returns blockchain
    res.json(blockchain.chain);
});

app.post('/mine',(req,res) => { // add block
    const block = blockchain.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);
    p2pserver.syncChain(); // to synchronise blockchain after new block is added
    res.redirect('/blocks');
})

app.get('/mine-transactions',(req,res)=>{ // start mining
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    res.redirect('/blocks');
})

app.get('/transactions',(req,res)=>{ // view transactions in transaction pool
    res.json(transactionPool.transactions);
});

app.post('/transact',(req,res)=>{ // create transaction
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient,amount,blockchain,transactionPool);
    p2pserver.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.get('/public-key',(req,res)=>{ // get public key 
    res.json({publicKey: wallet.publicKey});
})

app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})

p2pserver.listen(); // p2p server config   


