const _ = require('lodash')
const challengeABI = require('./abis/futarchyChallengeABI')

module.exports = (web3, address, defaultOptions) => {
  if (!defaultOptions) defaultOptions = {}

  const contract = new web3.eth.Contract(challengeABI, address)

  const started = async () => {
    const started = await contract.methods.isStarted().call()
    return started
  }

  return {
    started,
    address,
    contract
  }
}