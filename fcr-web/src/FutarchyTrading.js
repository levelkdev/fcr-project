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
      predictedPrices: {
        ACCEPTED: 0,
        DENIED: 0
      },
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
      this.setState({
        loadingChallengeState: false,
        outcomeMarginalPrices: {
          LONG_ACCEPTED: longAcceptedMarginalPrice / (fixedPointONE / 10 ** 18),
          SHORT_ACCEPTED: shortAcceptedMarginalPrice / (fixedPointONE / 10 ** 18),
          LONG_DENIED: longDeniedMarginalPrice / (fixedPointONE / 10 ** 18),
          SHORT_DENIED: shortDeniedMarginalPrice / (fixedPointONE / 10 ** 18),
        },
        upperBound,
        lowerBound,
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
      const challenge = await fcr.registry.getChallenge(this.state.challengeID)
      const amount = parseInt(this.state.decisions[outcome][tradeType.toLowerCase()])
      const weiAmount = amount * 10 ** 18
      const buyOutcomeTx = await challenge.buyOutcome(
        this.props.account,
        `${tokenType}_${outcome}`,
        weiAmount
      )
      console.log('buyOutcomeTx: ', buyOutcomeTx)
    }
  }

  handleAmountChangeFn (tradeType, outcome) {
    return (event) => {
      let decisions = this.state.decisions
      decisions[outcome][tradeType.toLowerCase()] = event.target.value
      this.setState({ decisions })
    }
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
        <div className="button" onClick={this.executeTokenTradeFn(
          tradeType,
          outcome,
          tokenType
        )}>{tradeType} {tokenType}</div>
      </div>
    )
  }

  renderDecision (outcomeIndex) {
    const outcome = outcomeIndex == 0 ? 'ACCEPTED' : 'DENIED'
    return (
      <div className="futarchy-decision-container">
        <div className="futarchy-decision-question">If <b>{this.state.listingName}</b> is {outcomeIndex == 1 ? 'NOT ' : ' '}added,<br/>what will token price be?</div>
        <br /><br />
        <div>
          Market predicts: {formatShortenedWeiNumberString(this.state.predictedPrices[outcome])}
        </div>
        <br /><br />
        <div>
          {this.renderTradingForm('Buy', outcome, 'LONG')}
          {this.renderTradingForm('Buy', outcome, 'SHORT')}
          {this.renderTradingForm('Sell', outcome, 'LONG')}
          {this.renderTradingForm('Sell', outcome, 'SHORT')}
        </div>
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
