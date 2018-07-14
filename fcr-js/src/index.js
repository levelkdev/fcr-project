const token = require('./token')
const registry = require('./registry')
const LMSRMarketMakerABI = require('./abis/LMSRMarketMakerABI')
const decisions = require('./enums/decisions')
const outcomes = require('./enums/outcomes')
const outcomeTokens = require('./enums/outcomeTokens')

module.exports = (web3, config) => {
  const tokenInstance = token(web3, config.tokenAddress, config.defaultOptions)
  const LMSRMarketMaker = new web3.eth.Contract(
    LMSRMarketMakerABI,
    config.LMSRMarketMakerAddress
  )
  return {
    token: tokenInstance,
    LMSRMarketMaker,
    registry: registry(
      tokenInstance,
      LMSRMarketMaker,
      web3,
      config.registryAddress,
      config.defaultOptions
    ),
    decisions,
    outcomes,
    outcomeTokens
  }
}
