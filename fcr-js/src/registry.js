const _ = require('lodash')
const registryABI = require('./abis/registryABI')

module.exports = (web3, address, defaultOptions) => {
  if (!defaultOptions) defaultOptions = {}

  const contract = new web3.eth.Contract(registryABI, address)

  const watchApplicationEvents = (callback, errCallback) => {
    // TODO: get the `fromBlock` value from fcr-config
    const eventFilterConfig = {
      fromBlock: 0,
      toBlock: 'latest'
    }

    contract.getPastEvents('_Application', eventFilterConfig, async (err, events) => {
      if (err) {
        errCallback(err)
      } else {
        // TODO: calling getPastEvents() before watching for events makes
        //       the `.on('data',...)` handler fire for all past events.
        //       should figure out why, and see if there's a cleaner way to
        //       get these.
        contract.events._Application(eventFilterConfig)
          .on('data', callback)
          .on('error', errCallback)
      }
    })
  }

  const apply = async (applicant, listingHash, amount, data) => {
    const existingListing = await getListing(listingHash)
    if (existingListing.applicationExpiry !== '0') {
      throw new Error(`listing '${listingHash}' already exists`)
    }

    const res = await contract.methods.apply(
      web3.utils.fromAscii(listingHash),
      amount,
      data
    ).send(_.extend({ from: applicant }, defaultOptions))
    return res
  }

  const getListing = async (listingHash) => {
    const listingHashBytes32 = web3.utils.fromAscii(listingHash)
    const listing = await contract.methods.listings(listingHashBytes32).call()
    return listing
  }

  const name = async () => {
    const name = await contract.methods.name().call()
    return name
  }

  return {
    watchApplicationEvents,
    apply,
    getListing,
    name,
    contract,
    address
  }
}
