import Web3 from 'web3';

const socketWeb3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

export default socketWeb3;