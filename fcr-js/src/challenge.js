const _ = require('lodash')
const challengeABI = require('./abis/futarchyChallengeABI')
const futarchyOracleABI = require('./abis/futarchyOracleABI')
const categoricalEventABI = require('./abis/categoricalEventABI')
const scalarEventABI = require('./abis/scalarEventABI')
const standardMarketWithPriceLoggerABI = require('./abis/standardMarketWithPriceLoggerABI')
const centralizedTimedOracleABI = require('./abis/centralizedTimedOracleABI')
const TransactionSender = require('./transactionSender')
const decisions = require('./enums/decisions')
const outcomes = require('./enums/outcomes')
const challengeStatuses = require('./enums/challengeStatuses')
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

async function getBlockTime(web3) {
  const blockNumber = await web3.eth.getBlockNumber()
  const block = await web3.eth.getBlock(blockNumber)
  return block.timestamp
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

module.exports = (fcrToken, LMSR, web3, id, address, defaultOptions) => {
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

  const ended = async () => {
    const isEnded = await contract.methods.ended().call()
    return isEnded
  }

  const passed = async () => {
    const isPassed = await contract.methods.passed().call()
    return isPassed
  }

  const status = async () => {
    const isEnded = await ended()
    if (!isEnded) {
      return challengeStatuses[0] // ACTIVE
    } else {
      const isPassed = await passed()
      return challengeStatuses[isPassed ? 1 : 2] // PASSED || FAILED
    }
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
    const timedOracle = await getPriceOracle()
  }

  const conditionalTradingResolutionDate = async () => {
    const timedOracle = await getPriceOracle()
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
      totalOutcomeCost * 2
    )
    transactionSender.add(
      approveDecisionTokenTxResp[0].receipt,
      'approve',
      decisionToken.address
    )

    let outcomeTokenAmounts = [0, 0]
    outcomeTokenAmounts[outcomeIndex] = amount

    const collateralLimit = 0

    await transactionSender.send(
      decisionMarket,
      'trade',
      [ outcomeTokenAmounts, collateralLimit ],
      _.extend({ from: buyer }, defaultOptions)
    )

    return transactionSender.response()
  }

  const sellOutcome = async (seller, outcome, amount) => {
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

    const decision = decisionForOutcome(outcome)
    const decisionMarket = await getDecisionMarket(decision)
    
    const outcomeToken = await getOutcomeToken(outcome)
    const outcomeTokenBalance = await outcomeToken.getBalance(seller)

    if (parseInt(outcomeTokenBalance) < parseInt(amount)) {
      throw new Error(`Account ${seller} does not have enough funds. Account balance is ${outcomeTokenBalance} but requested to sell ${amount}`)
    }

    const approveDecisionTokenTxResp = await outcomeToken.approve(
      seller,
      decisionMarket.options.address,
      outcomeTokenBalance
    )
    transactionSender.add(
      approveDecisionTokenTxResp[0].receipt,
      'approve',
      outcomeToken.address
    )

    let outcomeTokenAmounts = [0, 0]

    // Market.trade() function executes a sell when amount is negative
    outcomeTokenAmounts[outcomeIndex] = parseInt(amount) * -1

    const collateralLimit = 0

    // TODO: check if seller has enough token balance to execute sell

    await transactionSender.send(
      decisionMarket,
      'trade',
      [ outcomeTokenAmounts, collateralLimit ],
      _.extend({ from: seller }, defaultOptions)
    )

    const categoricalEvent = await getCategoricalEvent()
    const decisionToken = await getDecisionToken(decision)
    const decisionTokenBalance = await decisionToken.getBalance(seller)    

    await transactionSender.send(
      categoricalEvent,
      'sellAllOutcomes',
      [ decisionTokenBalance ],
      _.extend({ from: seller }, defaultOptions)
    )

    return transactionSender.response()
  }

  const setOutcome = async (sender) => {
    const transactionSender = new TransactionSender()

    const futarchyOracle = await getFutarchyOracle()
    const isOutcomeSet = await futarchyOracle.methods.isOutcomeSet().call()
    if (isOutcomeSet) {
      throw new Error('challenge outcome has already been set')
    }

    // TEMP: remove for workshop
    //
    // const resolutionDate = await futarchyTradingResolutionDate()
    // const blockTime = await getBlockTime(web3)
    // if (blockTime < resolutionDate) {
    //   throw new Error('challenge decision period is still active')
    // }

    await transactionSender.send(
      futarchyOracle,
      'setOutcome',
      [],
      _.extend({ from: sender }, defaultOptions)
    )

    return transactionSender.response()
  }

  const resolveDecisionMarkets = async (sender, price) => {
    const priceOracle = await getPriceOracle()

    const transactionSender = new TransactionSender()

    await transactionSender.send(
      priceOracle,
      'setOutcome',
      [ price ],
      _.extend({ from: sender }, defaultOptions)
    )

    const acceptedEvent = await getDecisionEvent('ACCEPTED')
    const deniedEvent = await getDecisionEvent('DENIED')
    const categoricalEvent = await getCategoricalEvent()

    await transactionSender.send(
      acceptedEvent,
      'setOutcome',
      [],
      _.extend({ from: sender }, defaultOptions)
    )

    await transactionSender.send(
      deniedEvent,
      'setOutcome',
      [],
      _.extend({ from: sender }, defaultOptions)
    )

    await transactionSender.send(
      categoricalEvent,
      'setOutcome',
      [],
      _.extend({ from: sender }, defaultOptions)
    )

    return transactionSender.response()
  }

  const redeemAllWinnings = async (sender) => {
    const acceptedEvent = await getDecisionEvent('ACCEPTED')
    const deniedEvent = await getDecisionEvent('DENIED')
    const categoricalEvent = await getCategoricalEvent()

    const transactionSender = new TransactionSender()

    await transactionSender.send(
      acceptedEvent,
      'redeemWinnings',
      [ ],
      _.extend({ from: sender }, defaultOptions)
    )

    await transactionSender.send(
      deniedEvent,
      'redeemWinnings',
      [ ],
      _.extend({ from: sender }, defaultOptions)
    )

    await transactionSender.send(
      categoricalEvent,
      'redeemWinnings',
      [ ],
      _.extend({ from: sender }, defaultOptions)
    )

    return transactionSender.response()
  }

  const isOutcomeSet = async () => {
    const futarchyOracle = await getFutarchyOracle()
    const outcomeSet = await futarchyOracle.methods.isOutcomeSet().call()
    return outcomeSet
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

  const getOutcomeToken = async (outcome) => {
    validateOutcome(outcome)

    const outcomeIndex = indexForOutcome(outcome)
    const decision = decisionForOutcome(outcome)
    const decisionEvent = await getDecisionEvent(decision)
    const outcomeTokenAddress = await decisionEvent.methods.outcomeTokens(outcomeIndex).call()
    return token(web3, outcomeTokenAddress, defaultOptions)
  }

  const getOutcomeTokenBalance = async (tokenHolder, outcome) => {
    const outcomeToken = await getOutcomeToken(outcome)
    const balance = await outcomeToken.getBalance(tokenHolder)
    return balance
  }

  const getPriceOracle = async () => {
    const decisionEvent = await getDecisionEvent('ACCEPTED')
    const oracleAddress = await decisionEvent.methods.oracle().call()
    return new web3.eth.Contract(centralizedTimedOracleABI, oracleAddress)
  }

  const getDecisionOutcome = async (decision) => {
    const decisionEvent = await getDecisionEvent(decision)
    const isOutcomeSet = await decisionEvent.methods.isOutcomeSet().call()
    if (isOutcomeSet) {
      const outcomeValue = await decisionEvent.methods.outcome().call()
      return outcomeValue
    } else {
      return null
    }
  }

  const calculateOutcomeCost = async (outcome, amount) => {
    validateOutcome(outcome)

    const outcomeTokenIndex = indexForOutcome(outcome)

    const decisionMarket = await getDecisionMarket(
      decisionForOutcome(outcome)
    )

    let outcomeTokenAmounts = [0, 0]
    outcomeTokenAmounts[outcomeTokenIndex] = amount

    const outcomeCost = await LMSR.methods.calcNetCost(
      decisionMarket.options.address,
      outcomeTokenAmounts
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

  const watchOutcomeTokenTrades = async (filter, callback, errCallback) => {
    const acceptedDecisionMarket = await getDecisionMarket('ACCEPTED')
    const deniedDecisionMarket = await getDecisionMarket('DENIED')

    watchEventFn(acceptedDecisionMarket, 'OutcomeTokenTrade')(
      filter,
      function () { callback.apply(this, _.concat(['ACCEPTED'], arguments)) },
      function () { errCallback.apply(this, _.concat(['ACCEPTED'], arguments)) }
    )
    watchEventFn(deniedDecisionMarket, 'OutcomeTokenTrade')(
      filter,
      function () { callback.apply(this, _.concat(['DENIED'], arguments)) },
      function () { errCallback.apply(this, _.concat(['DENIED'], arguments)) }
    )
  }

  const watchSetOutcome = async (filter, callback, errCallback) => {
    const futarchyOracle = await getFutarchyOracle()
    watchEventFn(futarchyOracle, 'OutcomeAssignment')(
      filter,
      callback,
      errCallback
    )
  }

  return {
    ID: id,
    start,
    started,
    fund,
    funded,
    ended,
    passed,
    status,
    futarchyOutcome,
    futarchyTradingPeriod,
    futarchyTradingResolutionDate,
    conditionalTradingPeriod,
    conditionalTradingResolutionDate,
    buyOutcome,
    sellOutcome,
    setOutcome,
    isOutcomeSet,
    resolveDecisionMarkets,
    redeemAllWinnings,
    getFutarchyOracle,
    getCategoricalEvent,
    getDecisionMarket,
    getDecisionEvent,
    getDecisionToken,
    getOutcomeToken,
    getOutcomeTokenBalance,
    getPriceOracle,
    getDecisionOutcome,
    calculateOutcomeCost,
    calculateOutcomeMarginalPrice,
    calculateOutcomeFee,
    getAverageOutcomePrice,
    watchStarted: watchEventFn(contract, '_Started'),
    watchFunded: watchEventFn(contract, '_Funded'),
    watchOutcomeTokenTrades,
    watchSetOutcome,
    address,
    contract
  }
}