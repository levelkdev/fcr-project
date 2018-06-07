const _ = require('lodash')
const challengeABI = require('./abis/futarchyChallengeABI')

module.exports = (token, web3, address, defaultOptions) => {
  if (!defaultOptions) defaultOptions = {}

  const contract = new web3.eth.Contract(challengeABI, address)

  // TODO: DRY this up
  const watchEvent = (eventName, filter, callback, errCallback) => {
    // TODO: get the `fromBlock` value from fcr-config
    let eventFilterConfig = {
      fromBlock: 0,
      toBlock: 'latest'
    }
    if (filter) {
      eventFilterConfig.filter = filter
    }

    contract.getPastEvents(eventName, eventFilterConfig, async (err, events) => {
      if (err) {
        errCallback(err)
      } else {
        // TODO: calling getPastEvents() before watching for events makes
        //       the `.on('data',...)` handler fire for all past events.
        //       should figure out why, and see if there's a cleaner way to
        //       get these.
        contract.events[eventName](eventFilterConfig)
          .on('data', callback)
          .on('error', errCallback)
      }
    })
  }

  const started = async () => {
    const started = await contract.methods.isStarted().call()
    return started
  }

  const start = async (challenger, lowerBound, upperBound) => {
    const isStarted = await contract.methods.isStarted().call()
    console.log('isStarted: ', isStarted)
    if (isStarted) {
      throw new Error('challenge is already started')
    }

    const stakeAmount = await contract.methods.stakeAmount().call()
    let approvalRes, startRes
    try {
      approvalRes = await token.approve(challenger, address, stakeAmount)
    } catch (err) {
      throw new Error(`token.approval tx failed: ${err}`)
    }

    try {
      startRes = await contract.methods.start(lowerBound, upperBound)
        .send(_.extend({ from: challenger }, defaultOptions))
    } catch (err) {
      throw new Error(`challenge.start tx failed: ${err}`)
    }

    return [ approvalRes, startRes ]
  }

  return {
    start,
    started,
    watchEvent,
    address,
    contract
  }
}