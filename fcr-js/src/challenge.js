const _ = require('lodash')
const challengeABI = require('./abis/futarchyChallengeABI')
const futarchyOracleABI = require('./abis/futarchyOracleABI')
const categoricalEventABI = require('./abis/categoricalEventABI')
const scalarEventABI = require('./abis/scalarEventABI')
const standardMarketWithPriceLoggerABI = require('./abis/standardMarketWithPriceLoggerABI')
const timedOracleABI = require('./abis/timedOracleABI')
const TransactionSender = require('./transactionSender')
const decisions = require('./enums/decisions')
const outcomes = require('./enums/outcomes')
const token = require('./token')

function decisionForOutcome (outcome) {
  return outcome.indexOf('ACCEPTED') > -1 ? 'ACCEPTED' : 'DENIED'
}

function indexForOutcome (outcome) {
  return outcome.indexOf('SHORT') > -1 ? 0 : 1
}

function decisionMarketIndex (decision) {
  const marketIndex = parseInt(decisions[decision])
  if (isNaN(marketIndex)) {
    throw new Error(`'${decision}' is not a valid decision`)
  }
  return marketIndex
}

function validateOutcome (outcome) {
  if (!outcomes[outcome]) {
    throw new Error(`'${outcome}' is not a valid outcome`)
  }
}

// TODO: DRY this up
function watchEventFn (contract, eventName) {
  return (filter, callback, errCallback) => {
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
}

module.exports = (fcrToken, LMSR, web3, address, defaultOptions) => {
  if (!defaultOptions) defaultOptions = {}

  const contract = new web3.eth.Contract(challengeABI, address)

  const started = async () => {
    const started = await contract.methods.isStarted().call()
    return started
  }

  const funded = async () => {
    const funded = await contract.methods.isFunded().call()
    return funded
  }

  const futarchyOutcome = async () => {
    const futarchyOracle = await getFutarchyOracle()
    const isOutcomeSet = await futarchyOracle.methods.isOutcomeSet().call()
    if (isOutcomeSet) {
      const outcome = await futarchyOracle.methods.getOutcome().call()
      return outcome
    } else {
      return null
    }
  }

  const futarchyTradingPeriod = async () => {
    const futarchyOracle = await getFutarchyOracle()
    const tradingPeriod = await futarchyOracle.methods.tradingPeriod().call()
    return tradingPeriod
  }

  const futarchyTradingResolutionDate = async () => {
    const tradingPeriod = await futarchyTradingPeriod()
    const acceptedMarket = await getDecisionMarket('ACCEPTED')
    const marketStartDate = await acceptedMarket.methods.startDate().call()
    return parseInt(tradingPeriod) + parseInt(marketStartDate)
  }

  const conditionalTradingPeriod = async () => {
    const timedOracle = await getTimedOracle()
  }

  const conditionalTradingResolutionDate = async () => {
    const timedOracle = await getTimedOracle()
    const resolutionDate = await timedOracle.methods.resolutionDate().call()
    return resolutionDate
  }

  const start = async (challenger) => {
    const isStarted = await contract.methods.isStarted().call()
    if (isStarted) {
      throw new Error('challenge is already started')
    }

    const transactionSender = new TransactionSender()
    await transactionSender.send(
      contract,
      'start',
      null,
      _.extend({ from: challenger }, defaultOptions)
    )

    return transactionSender.response()
  }

  const fund = async (challenger) => {
    const isFunded = await contract.methods.isFunded().call()
    if (isFunded) {
      throw new Error('challenge is already funded')
    }

    const transactionSender = new TransactionSender()

    const stakeAmount = await contract.methods.stakeAmount().call()

    const approveTxResp = await fcrToken.approve(challenger, address, stakeAmount)
    transactionSender.add(approveTxResp[0].receipt, 'approve', fcrToken.address)

    await transactionSender.send(
      contract,
      'fund',
      [],
      _.extend({ from: challenger }, defaultOptions)
    )

    return transactionSender.response()
  }

  const buyOutcome = async (buyer, outcome, amount) => {
    validateOutcome(outcome)
    const outcomeIndex = indexForOutcome(outcome)

    const transactionSender = new TransactionSender()

    const isStarted = await contract.methods.isStarted().call()
    if (!isStarted) {
      throw new Error('challenge has not been started')
    }

    const isFunded = await contract.methods.isFunded().call()
    if (!isFunded) {
      throw new Error('challenge markets have not been funded')
    }

    const categoricalEvent = await getCategoricalEvent()

    const approveTxResp = await fcrToken.approve(
      buyer,
      categoricalEvent.options.address,
      amount
    )
    transactionSender.add(approveTxResp[0].receipt, 'approve', fcrToken.address)

    await transactionSender.send(
      categoricalEvent,
      'buyAllOutcomes',
      [ amount ],
      _.extend({ from: buyer }, defaultOptions)
    )

    const decision = decisionForOutcome(outcome)
    const decisionMarket = await getDecisionMarket(decision)
    const outcomeCost = await calculateOutcomeCost(outcome, amount)
    const outcomeFee = await calculateOutcomeFee(outcome, amount)
    const totalOutcomeCost = outcomeCost + outcomeFee

    const decisionToken = await getDecisionToken(decision)
    
    const approveDecisionTokenTxResp = await decisionToken.approve(
      buyer,
      decisionMarket.options.address,
      totalOutcomeCost
    )
    transactionSender.add(
      approveDecisionTokenTxResp[0].receipt,
      'approve',
      decisionToken.address
    )

    await transactionSender.send(
      decisionMarket,
      'buy',
      [ outcomeIndex, amount, totalOutcomeCost ],
      _.extend({ from: buyer }, defaultOptions)
    )

    return transactionSender.response()
  }

  const getFutarchyOracle = async () => {
    const futarchyOracleAddress = await contract.methods.futarchyOracle().call()
    return new web3.eth.Contract(futarchyOracleABI, futarchyOracleAddress)
  }

  const getCategoricalEvent = async () => {
    const futarchyOracle = await getFutarchyOracle()
    const categoricalEventAddress = await futarchyOracle.methods.categoricalEvent().call()
    return new web3.eth.Contract(categoricalEventABI, categoricalEventAddress)
  }

  const getDecisionMarket = async (decision) => {
    const futarchyOracle = await getFutarchyOracle()
    const standardMarketAddress = await futarchyOracle.methods.markets(
      decisionMarketIndex(decision)
    ).call()
    return new web3.eth.Contract(standardMarketWithPriceLoggerABI, standardMarketAddress)
  }

  const getDecisionEvent = async (decision) => {
    const decisionMarket = await getDecisionMarket(decision)
    const decisionEventAddress = await decisionMarket.methods.eventContract().call()
    return new web3.eth.Contract(scalarEventABI, decisionEventAddress)
  }

  const getDecisionToken = async (decision) => {
    const decisionEvent = await getDecisionEvent(decision)
    const decisionTokenAddress = await decisionEvent.methods.collateralToken().call()
    return token(web3, decisionTokenAddress, defaultOptions)
  }

  const getTimedOracle = async () => {
    const decisionEvent = await getDecisionEvent('ACCEPTED')
    const timedOracleAddress = await decisionEvent.methods.oracle().call()
    return new web3.eth.Contract(timedOracleABI, timedOracleAddress)
  }

  const calculateOutcomeCost = async (outcome, amount) => {
    validateOutcome(outcome)

    const outcomeTokenIndex = indexForOutcome(outcome)

    const decisionMarket = await getDecisionMarket(
      decisionForOutcome(outcome)
    )

    const outcomeCost = await LMSR.methods.calcCost(
      decisionMarket.options.address,
      outcomeTokenIndex,
      amount
    ).call()

    return outcomeCost
  }

  const calculateOutcomeMarginalPrice = async (outcome) => {
    validateOutcome(outcome)

    const outcomeTokenIndex = indexForOutcome(outcome)

    const decisionMarket = await getDecisionMarket(
      decisionForOutcome(outcome)
    )

    const outcomeMarginalPrice = await LMSR.methods.calcMarginalPrice(
      decisionMarket.options.address,
      outcomeTokenIndex
    ).call()

    return outcomeMarginalPrice
  }

  const calculateOutcomeFee = async (outcome, amount) => {
    const decision = decisionForOutcome(outcome)
    const outcomeCost = await calculateOutcomeCost(outcome, amount)
    const decisionMarket = await getDecisionMarket(decision)
    const fee = await decisionMarket.methods.calcMarketFee(outcomeCost).call()
    return fee
  }

  const getAverageOutcomePrice = async (outcome) => {
    const decision = decisionForOutcome(outcome)
    const decisionMarket = await getDecisionMarket(decision)
    const averageLongPrice = await decisionMarket.methods.getAvgPrice().call()

    return indexForOutcome(outcome) == 1 ? 
      averageLongPrice :
      (2 ** 64) - averageLongPrice
  }

  const watchOutcomeTokenPurchases = async (filter, callback, errCallback) => {
    const acceptedDecisionMarket = await getDecisionMarket('ACCEPTED')
    const deniedDecisionMarket = await getDecisionMarket('DENIED')
    watchEventFn(acceptedDecisionMarket, 'OutcomeTokenPurchase')(
      filter,
      callback,
      errCallback
    )
    watchEventFn(deniedDecisionMarket, 'OutcomeTokenPurchase')(
      filter,
      callback,
      errCallback
    )
  }

  return {
    start,
    started,
    fund,
    funded,
    futarchyOutcome,
    futarchyTradingPeriod,
    futarchyTradingResolutionDate,
    conditionalTradingPeriod,
    conditionalTradingResolutionDate,
    buyOutcome,
    getFutarchyOracle,
    getCategoricalEvent,
    getDecisionMarket,
    getDecisionEvent,
    getDecisionToken,
    getTimedOracle,
    calculateOutcomeCost,
    calculateOutcomeMarginalPrice,
    calculateOutcomeFee,
    getAverageOutcomePrice,
    watchStarted: watchEventFn(contract, '_Started'),
    watchFunded: watchEventFn(contract, '_Funded'),
    watchOutcomeTokenPurchases,
    address,
    contract
  }
}