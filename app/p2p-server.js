/**
 * P2pserver : create websockets
 *  - constructor : init blockchain and sockets array
 *  - listen : create user server and connect to peers
 *  - connectSocket : push connected socket into sockets array
 *  - connectToPeers : connect to peers
 *  - messageHandler : callback on receiving a message
 *  - sendChain : send chain instance
 *  - syncChain : syncChain whenever new block is added
 */

const WebSocket = require('ws'); // websocket module
const P2P_PORT = process.env.P2P_PORT || 5001; // user port
const peers = process.env.PEERS ? process.env.PEERS.split(',') : []; // array of peers

const MESSAGE_TYPE = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS'
}

class P2pserver {
    
    constructor(blockchain,transactionPool){
        this.blockchain = blockchain;
        this.sockets = [];
        this.transactionPool = transactionPool;
    }   

    listen() {
        const server = new WebSocket.Server({ port: P2P_PORT });
        server.on('connection',socket => this.connectSocket(socket));
        this.connectToPeers();
        console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
    }

    connectSocket(socket){
        this.sockets.push(socket);
        console.log("Socket connected");
        this.messageHandler(socket);
        this.sendChain(socket);
    }

    connectToPeers() {
        peers.forEach(peer => {
            const socket = new WebSocket(peer);
            socket.on('open',() => this.connectSocket(socket)); 
        });
    }

    messageHandler(socket){

       socket.on('message',message =>{
            const data = JSON.parse(message);
            console.log("data ", data);
            
            switch(data.type){
                case MESSAGE_TYPE.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPE.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPE.clear_transactions:
                    this.transactionPool.clear();
                    break;
            }
            
        });
    }

    sendChain(socket){
            socket.send(JSON.stringify({
            type: MESSAGE_TYPE.chain,
            chain: this.blockchain.chain
        }));
    }

    syncChain(){
        this.sockets.forEach(socket =>{
            this.sendChain(socket);
        });
    }

    broadcastTransaction(transaction){
        this.sockets.forEach(socket =>{
            this.sendTransaction(socket,transaction);
        });
    }

    sendTransaction(socket,transaction){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.transaction,
            transaction: transaction
          })
      );
    }

}

module.exports = P2pserver;
