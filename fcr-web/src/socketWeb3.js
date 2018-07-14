import Web3 from 'web3';

const socketWeb3 = new Web3(new Web3.providers.WebsocketProvider(process.env.REACT_APP_SOCKET_WEB3_URL))

export default socketWeb3;