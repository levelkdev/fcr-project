import Web3 from 'web3';
import config from './config'

// const socketWeb3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/_ws'))
const socketWeb3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))

export default socketWeb3;
