const Web3 = require('web3')

module.exports = (network) => {
  let web3
  if (network == 'local') {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  } else if (network == 'rinkeby') {
    const HDWalletProvider = require('truffle-hdwallet-provider');
    const fs = require('fs');

    let secrets;
    let mnemonic = '';

    if (fs.existsSync('../secrets.json')) {
      secrets = JSON.parse(fs.readFileSync('../secrets.json', 'utf8'));
      ({ mnemonic } = secrets);
    }

    const provider = new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io')
    web3 = new Web3(provider)
  }
  return web3
}
