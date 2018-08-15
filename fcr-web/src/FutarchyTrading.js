import React, { Component } from 'react'
import _ from 'lodash'
import web3 from './web3'
import fcr from './fcrjs/fcrWeb3'
import fcrSocket from './fcrjs/fcrSocketWeb3'
import {
  formatWeiNumberString,
  formatShortenedWeiNumberString
} from './formatters'
import ShortAddress from './Components/ShortAddress'

class FutarchyTrading extends Component {

  constructor(props) {
    super(props)
    const { listingHash } = props.match.params
    const listingName = web3.utils.toAscii(listingHash)

    this.state = {
      listingHash,
      listingName,
      challengeID: null,
      loadingChallengeState: false,
      outcomeTokenBalances: {},
      inProgressTrades: {
        ACCEPTED: false,
        DENIED: false
      },
      predictedPrices: {
        ACCEPTED: 0,
        DENIED: 0
      },
      decisionOutcome: null,
      decisions: {
        ACCEPTED: {
          buy: {
            amount: ''
          },
          sell: {
            amount: ''
          }
        },
        DENIED: {
          buy: {
            amount: ''
          },
          sell: {
            amount: ''
          }
        }
      },
      trades: []
    }

    this.handleAmountChangeFn = this.handleAmountChangeFn.bind(this)
    this.executeTokenTradeFn = this.executeTokenTradeFn.bind(this)
    this.handleRedeemWinnings = this.handleRedeemWinnings.bind(this)
  }

  componentWillMount () {
    fcrSocket.registry.watchEvent(
      '_Challenge',
      { listingHash: this.state.listingHash },
      (event) => { 
        this.fetchChallenge(event.returnValues.challengeID)
      },
      console.error
    )
  }

  async fetchChallenge (challengeID) {
    if (!this.challenge) {
      this.challenge = await fcrSocket.registry.getChallenge(challengeID)

      this.challenge.watchStarted(
        {},
        () => { this.setChallengeToState() },
        console.error
      )

      this.challenge.watchFunded(
        {},
        () => { this.setChallengeToState() },
        console.error
      )

      this.challenge.watchOutcomeTokenTrades(
        {},
        (decision, event) => {
          this.addTradeToState(decision, event.returnValues)
          this.setChallengeToState()
        },
        console.error
      )

      this.challenge.watchSetOutcome(
        {},
        () => {
          this.setChallengeToState()
        },
        console.error
      )
    }

    this.setState({ challengeID })
    this.setChallengeToState()
  }

  async setChallengeToState () {
    const { account } = this.props
    if(!this.state.loadingChallengeState) {
      this.setState({ loadingChallengeState: true })
      const fixedPointONE = 2 ** 64

      const upperBound = await this.challenge.contract.methods.upperBound().call()
      const lowerBound = await this.challenge.contract.methods.lowerBound().call()

      const shortAcceptedMarginalPrice =
        await this.challenge.calculateOutcomeMarginalPrice(fcr.outcomes.SHORT_ACCEPTED)
      const longAcceptedMarginalPrice =
        await this.challenge.calculateOutcomeMarginalPrice(fcr.outcomes.LONG_ACCEPTED)
      const shortDeniedMarginalPrice =
        await this.challenge.calculateOutcomeMarginalPrice(fcr.outcomes.SHORT_DENIED)
      const longDeniedMarginalPrice =
        await this.challenge.calculateOutcomeMarginalPrice(fcr.outcomes.LONG_DENIED)

      const shortAcceptedBalance =
        await this.challenge.getOutcomeTokenBalance(account, fcr.outcomes.SHORT_ACCEPTED)
      const longAcceptedBalance =
        await this.challenge.getOutcomeTokenBalance(account, fcr.outcomes.LONG_ACCEPTED)
      const shortDeniedBalance =
        await this.challenge.getOutcomeTokenBalance(account, fcr.outcomes.SHORT_DENIED)
      const longDeniedBalance =
        await this.challenge.getOutcomeTokenBalance(account, fcr.outcomes.LONG_DENIED)

      const decisionOutcome = await this.challenge.getDecisionOutcome('ACCEPTED')

      this.setState({
        loadingChallengeState: false,
        outcomeMarginalPrices: {
          LONG_ACCEPTED: longAcceptedMarginalPrice / (fixedPointONE / 10 ** 18),
          SHORT_ACCEPTED: shortAcceptedMarginalPrice / (fixedPointONE / 10 ** 18),
          LONG_DENIED: longDeniedMarginalPrice / (fixedPointONE / 10 ** 18),
          SHORT_DENIED: shortDeniedMarginalPrice / (fixedPointONE / 10 ** 18),
        },
        outcomeTokenBalances: {
          LONG_ACCEPTED: longAcceptedBalance,
          SHORT_ACCEPTED: shortAcceptedBalance,
          LONG_DENIED: longDeniedBalance,
          SHORT_DENIED: shortDeniedBalance
        },
        upperBound,
        lowerBound,
        decisionOutcome,
        predictedPrices: {
          ACCEPTED: calcPredictedPrice(
            longAcceptedMarginalPrice, shortAcceptedMarginalPrice, upperBound, lowerBound
          ),
          DENIED: calcPredictedPrice(
            longDeniedMarginalPrice, shortDeniedMarginalPrice, upperBound, lowerBound
          )
        }
      })
    }
  }

  async addTradeToState (decision, tradeData) {
    tradeData = _.extend({ decisionMarket: decision }, tradeData)

    const outcomeTokenIndex = parseInt(tradeData.outcomeTokenAmounts[0]) == 0 ? 1 : 0
    tradeData.outcomeTokenCount = tradeData.outcomeTokenAmounts[outcomeTokenIndex]
    tradeData.outcomeTokenIndex = outcomeTokenIndex

    this.setState({
      trades: _.concat(this.state.trades, [tradeData])
    })
  }

  // TODO: move this to a Component, use in Listing
  renderTradeData () {
    let i = 0
    const tradeTable = this.state.trades.length > 0 ?
      (
        <table>
          <tbody>
            <tr>
              <td className={'shady'}>Trader</td>
              <td className={'shady'}>Outcome Token</td>
              <td className={'shady'}>Cost</td>
              <td className={'shady'}>Count</td>
            </tr>
            {
              this.state.trades.map((trade) => {
                i++
                return (
                  <tr key={`trade_${i}`}>
                    <td>
                      <ShortAddress address={trade.transactor} />
                    </td>
                    <td>
                      {`${fcr.outcomeTokens[trade.outcomeTokenIndex]}_${trade.decisionMarket}`}
                    </td>
                    <td>{formatShortenedWeiNumberString(trade.outcomeTokenNetCost)}</td>
                    <td>{formatWeiNumberString(trade.outcomeTokenCount)}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      ) : <div>None</div>
    return (
      <div>
        <h3>Trades</h3>
        {tradeTable}
      </div>
    )
  }

  executeTokenTradeFn (tradeType, outcome, tokenType) {
    return async () => {
      if (!this.state.inProgressTrades[outcome]) {
        let { inProgressTrades } = this.state
        inProgressTrades[outcome] = true
        this.setState({ inProgressTrades })
        const challenge = await fcr.registry.getChallenge(this.state.challengeID)
        const amount = parseInt(this.state.decisions[outcome][tradeType.toLowerCase()])
        const weiAmount = amount * 10 ** 18

        const challengeFns = {
          'Buy': 'buyOutcome',
          'Sell': 'sellOutcome'
        }
        const outcomeTx = await challenge[challengeFns[tradeType]](
          this.props.account,
          `${tokenType}_${outcome}`,
          weiAmount
        )
        console.log(`${challengeFns[tradeType]} Tx: `, outcomeTx)

        inProgressTrades = this.state.inProgressTrades
        inProgressTrades[outcome] = false
        this.setState({ inProgressTrades })
      }
    }
  }

  handleAmountChangeFn (tradeType, outcome) {
    return (event) => {
      let decisions = this.state.decisions
      decisions[outcome][tradeType.toLowerCase()] = event.target.value
      this.setState({ decisions })
    }
  }

  async handleRedeemWinnings () {
    const challenge = await fcr.registry.getChallenge(this.state.challengeID)
    const tx = await challenge.redeemAllWinnings(this.props.account)
    console.log('WINNINGS REDEEMED TX: ', tx)
  }

  renderTradingForm (tradeType, outcome, tokenType) {
    return (
      <div className="trading-form">
        <div className="form-group">
          <input
            value={this.state.decisions[outcome].tokenBuyAmount}
            onChange={this.handleAmountChangeFn(tradeType, outcome)}
          />
        </div>
        <div className={`button ${tradeType.toLowerCase()}`} onClick={this.executeTokenTradeFn(
          tradeType,
          outcome,
          tokenType
        )}>{tradeType} {tokenType}</div>
      </div>
    )
  }

  renderTradingInputContainer (outcome) {
    return this.state.inProgressTrades[outcome] ?
      <div>Waiting for transactions...</div> :
      (
        <div>
          {this.renderTradingForm('Buy', outcome, 'LONG')}
          {this.renderTradingForm('Buy', outcome, 'SHORT')}
          {this.renderTradingForm('Sell', outcome, 'LONG')}
          {this.renderTradingForm('Sell', outcome, 'SHORT')}
        </div>
      )
  }

  renderMarketResolvedContainer (outcome) {
    return (
      <div>
        <div>
          Market resolved: {formatShortenedWeiNumberString(this.state.decisionOutcome)}
        </div>
        <br /><br />
        <div className="button" onClick={this.handleRedeemWinnings}>
          Redeem Winnings
        </div>
      </div>
    )
  }

  renderDecision (outcomeIndex) {
    const outcome = outcomeIndex == 0 ? 'ACCEPTED' : 'DENIED'

    const formInfo = this.state.decisionOutcome == null ?
      this.renderTradingInputContainer(outcome) : this.renderMarketResolvedContainer(outcome)

    return (
      <div className="futarchy-decision-container">
        <div className="futarchy-decision-question">If <b>{this.state.listingName}</b> is {outcomeIndex == 1 ? 'NOT ' : ' '}added,<br/>what will token price be?</div>
        <br /><br />
        <div>
          Market predicts: {formatShortenedWeiNumberString(this.state.predictedPrices[outcome])}
          <br /><br />
        </div>
        <div>
          <div>
            Your LONG Balance:&nbsp;
            {formatWeiNumberString(this.state.outcomeTokenBalances[`LONG_${outcome}`])}
          </div>
          <div>
            Your SHORT Balance:&nbsp;
            {formatWeiNumberString(this.state.outcomeTokenBalances[`SHORT_${outcome}`])}
          </div>
        </div>
        <br /><br />
        {formInfo}
        <br /><br />
      </div>
    )
  }

  render () {
    return (
      <div>
        <div>
          {this.renderDecision(0)}
          {this.renderDecision(1)}
        </div>
        <br /><br />
        {this.renderTradeData()}
      </div>
    )
  }

}

function calcPredictedPrice(long, short, upper, lower) {
  long = parseInt(long)
  short = parseInt(short)
  upper = parseInt(upper)
  lower = parseInt(lower)
  const range = upper - lower
  const percent = long / (long + short)
  return lower + (range * percent)
}

export default FutarchyTrading
