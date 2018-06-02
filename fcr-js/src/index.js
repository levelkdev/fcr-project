const token = require('./token')
const registry = require('./registry')

module.exports = (web3, config) => {
  return {
    token: token(web3, config.tokenAddress, config.defaultOptions),
    registry: registry(web3, config.registryAddress, config.defaultOptions)
  }
}
