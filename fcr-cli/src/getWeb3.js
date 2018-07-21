const Web3 = require('web3')
const fcrConfig = require('../../fcr-config')

module.exports = (network) => {
  let web3
  let config = fcrConfig[network]
  if (network == 'local') {
    web3 = new Web3(new Web3.providers.HttpProvider(config.web3Url))
  } else if (network == 'rinkeby') {
    const HDWalletProvider = require('truffle-hdwallet-provider');
    const fs = require('fs');

    let secrets;
    let mnemonic = '';

    if (fs.existsSync('../secrets.json')) {
      secrets = JSON.parse(fs.readFileSync('../secrets.json', 'utf8'));
      ({ mnemonic } = secrets);
    }

    const provider = new HDWalletProvider(mnemonic, config.web3Url)
    web3 = new Web3(provider)
  }
  return web3
}
