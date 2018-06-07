const token = require('./token')
const registry = require('./registry')

module.exports = (web3, config) => {
  const tokenInstance = token(web3, config.tokenAddress, config.defaultOptions)
  return {
    tokenInstance,
    registry: registry(
      tokenInstance,
      web3,
      config.registryAddress,
      config.defaultOptions
    )
  }
}
