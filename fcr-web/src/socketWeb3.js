import Web3 from 'web3';

const socketWeb3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/_ws'))

export default socketWeb3;