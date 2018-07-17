const _ = require('lodash')
const faucetTokenABI = require('./abis/faucetTokenABI')
const TransactionSender = require('./transactionSender')

module.exports = (web3, address, defaultOptions) => {
  if (!defaultOptions) defaultOptions = {}

  const contract = new web3.eth.Contract(faucetTokenABI, address)

  // TODO: this is copied from registry, so DRY this up
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

  const getBalance = async (owner) => {
    const bal = await contract.methods.balanceOf(owner).call()
    return bal
  }

  const getAllowance = async (owner, spender) => {
    const allowance = await contract.methods.allowance(owner, spender).call()
    return allowance
  }

  const approve = async (owner, spender, value) => {
    const transactionSender = new TransactionSender()
    await transactionSender.send(
      contract,
      'approve',
      [ spender, value ],
      _.extend({ from: owner }, defaultOptions)
    )
    return transactionSender.response()
  }

  const gimmeTokens = async (tokenRequestor, data) => {
    const transactionSender = new TransactionSender()
    await transactionSender.send(
      contract,
      'gimmeTokens',
      [ web3.utils.fromAscii(data) ],
      _.extend({ from: tokenRequestor }, defaultOptions)
    )
    return transactionSender.response()
  }

  return {
    watchEvent,
    approve,
    gimmeTokens,
    getBalance,
    getAllowance,
    contract,
    address
  }
}