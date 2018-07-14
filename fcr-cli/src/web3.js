const Web3 = require('web3')

// TODO get from config
// const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

// TEMP CODE FOR RINKEBY CONFIG
const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');

let secrets;
let mnemonic = '';

if (fs.existsSync('secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
  ({ mnemonic } = secrets);
}

const provider = new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io')
const web3 = new Web3(provider)
//

module.exports = web3
