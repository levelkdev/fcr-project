import _ from 'lodash'
import web3 from './socketWeb3'
import React, { Component } from 'react'
import config from 'fcr-config'
import fcrjs from 'fcr-js/src'
import {
  formatBool,
  formatWeiNumberString,
  formatTimestamp
} from './formatters'
import TimeRemainingDisplay from './Components/TimeRemainingDisplay'

const BN = web3.utils.BN

// TODO add config to the CLI to switch envs (local, ropsten, etc)
const fcr = fcrjs(web3, config.local)

class Listing extends Component {
  constructor(props) {
    super(props)

    const { listingHash } = props.match.params
    const listingName = web3.utils.toAscii(listingHash)

    this.state = {
      loadingChallengeState: false,
      loadedChallengeState: false,
      listingHash,
      listingName,
      listingLoaded: false,
      challenge: {
        outcomeMarginalPrices: {},
        outcomeAveragePrices: {}
      },
      trades: []
    }
    
    this.challenge = null
  }

  componentWillMount () {
    fcr.registry.watchEvent(
      '_Challenge',
      { listingHash: this.state.listingHash },
      (event) => { this.handleChallengeEvent(event) },
      console.error
    )

    this.fetchListing()
  }

  handleChallengeEvent (event) {
    this.fetchChallenge(event.returnValues.challengeID)
  }

  async fetchListing () {
    const listing = await fcr.registry.getListing(this.state.listingName)
    this.setState({
      listingLoaded: true,
      deposit: parseInt(listing.deposit),
      owner: listing.owner,
      applicationExpiry: parseInt(listing.applicationExpiry),
      whitelisted: listing.whitelisted
    })
  }

  async fetchChallenge (challengeID) {
    if (!this.challenge) {
      this.challenge = await fcr.registry.getChallenge(challengeID)

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

      this.challenge.watchOutcomeTokenPurchases(
        {},
        (event) => {
          this.addTradeToState(event.returnValues)
          this.setChallengeToState()
        },
        console.error
      )

      this.challenge.watchSetOutcome(
        {},
        (event) => {
          this.setChallengeToState()
        },
        console.error
      )
    }

    this.setState({ challengeID })
    this.setChallengeToState()
  }

  async addTradeToState (tradeData) {
    this.setState({
      trades: _.concat(this.state.trades, [tradeData])
    })
  }

  async setChallengeToState () {
    if(!this.state.loadingChallengeState) {
      this.setState({ loadingChallengeState: true })
      const fixedPointONE = 2 ** 64

      const challengeStarted = await this.challenge.started()
      const challengeFunded = await this.challenge.funded()
      const challenger = await this.challenge.contract.methods.challenger().call()
      const stakeAmount = await this.challenge.contract.methods.stakeAmount().call()
      const upperBound = await this.challenge.contract.methods.upperBound().call()
      const lowerBound = await this.challenge.contract.methods.lowerBound().call()

      const futarchyTradingResolutionDate = await this.challenge.futarchyTradingResolutionDate()
      const conditionalTradingResolutionDate = await this.challenge.conditionalTradingResolutionDate()
      const futarchyOutcome = await this.challenge.futarchyOutcome()

      const shortAcceptedMarginalPrice =
        await this.challenge.calculateOutcomeMarginalPrice(fcr.outcomes.SHORT_ACCEPTED)
      const longAcceptedMarginalPrice =
        await this.challenge.calculateOutcomeMarginalPrice(fcr.outcomes.LONG_ACCEPTED)
      const shortDeniedMarginalPrice =
        await this.challenge.calculateOutcomeMarginalPrice(fcr.outcomes.SHORT_DENIED)
      const longDeniedMarginalPrice =
        await this.challenge.calculateOutcomeMarginalPrice(fcr.outcomes.LONG_DENIED)

      const longAcceptedPrice = 
        await this.challenge.getAverageOutcomePrice(fcr.outcomes.LONG_ACCEPTED)
      const shortAcceptedPrice = 
        await this.challenge.getAverageOutcomePrice(fcr.outcomes.SHORT_ACCEPTED)
      const longDeniedPrice = 
        await this.challenge.getAverageOutcomePrice(fcr.outcomes.LONG_DENIED)
      const shortDeniedPrice = 
        await this.challenge.getAverageOutcomePrice(fcr.outcomes.SHORT_DENIED)

      this.setState({
        loadingChallengeState: false,
        loadedChallengeState: true,
        challenge: {
          started: challengeStarted,
          funded: challengeFunded,
          challenger,
          stakeAmount,
          lowerBound,
          upperBound,
          futarchyTradingResolutionDate,
          conditionalTradingResolutionDate,
          futarchyOutcome,
          outcomeMarginalPrices: {
            LONG_ACCEPTED: longAcceptedMarginalPrice / (fixedPointONE / 10 ** 18),
            SHORT_ACCEPTED: shortAcceptedMarginalPrice / (fixedPointONE / 10 ** 18),
            LONG_DENIED: longDeniedMarginalPrice / (fixedPointONE / 10 ** 18),
            SHORT_DENIED: shortDeniedMarginalPrice / (fixedPointONE / 10 ** 18),
          },
          outcomeAveragePrices: {
            LONG_ACCEPTED: longAcceptedPrice / (fixedPointONE / 10 ** 18),
            SHORT_ACCEPTED: shortAcceptedPrice / (fixedPointONE / 10 ** 18),
            LONG_DENIED: longDeniedPrice / (fixedPointONE / 10 ** 18),
            SHORT_DENIED: shortDeniedPrice / (fixedPointONE / 10 ** 18),
          }
        }
      })
    }
  }

  renderDecisionMarketTable (decision) {
    return (
      <table>
        <tbody>
          <tr>
            <td colSpan="2">{decision}</td>
          </tr>
          <tr>
            <td className={'shady'}>{`LONG_${decision}`}</td>
            <td>{formatWeiNumberString(this.state.challenge.outcomeMarginalPrices[`LONG_${decision}`])}</td>
          </tr>
          <tr>
            <td className={'shady'}>{`SHORT_${decision}`}</td>
            <td>{formatWeiNumberString(this.state.challenge.outcomeMarginalPrices[`SHORT_${decision}`])}</td>
          </tr>
          <tr>
            <td className={'shady'}>{`LONG_${decision} Avg.`}</td>
            <td>{formatWeiNumberString(this.state.challenge.outcomeAveragePrices[`LONG_${decision}`])}</td>
          </tr>
          <tr>
            <td className={'shady'}>{`SHORT_${decision} Avg.`}</td>
            <td>{formatWeiNumberString(this.state.challenge.outcomeAveragePrices[`SHORT_${decision}`])}</td>
          </tr>
        </tbody>
      </table>
    )
  }

  renderDecisionMarketData () {
    return (
      <div>
        <h3>Decision Markets</h3>
        {this.renderDecisionMarketTable('ACCEPTED')}
        <br /><br />
        {this.renderDecisionMarketTable('DENIED')}
      </div>
    )
  }

  renderTradeData () {
    let i = 0
    const tradeRows = this.state.trades.map((trade) => {
      i++
      return (
        <tr key={`trade_${i}`}>
          <td>{trade.buyer}</td>
          <td>{trade.outcomeTokenIndex}</td>
          <td>{formatWeiNumberString(trade.outcomeTokenCost)}</td>
          <td>{formatWeiNumberString(trade.outcomeTokenCount)}</td>
          <td>{formatWeiNumberString(trade.marketFees)}</td>
        </tr>
      )
    })
    return (
      <div>
        <h3>Trades</h3>
        <table>
          <tbody>
            <tr>
              <td className={'shady'}>Buyer</td>
              <td className={'shady'}>Outcome Token</td>
              <td className={'shady'}>Cost</td>
              <td className={'shady'}>Count</td>
              <td className={'shady'}>Fees</td>
            </tr>
            {tradeRows}
          </tbody>
        </table>
      </div>
    )
  }

  renderChallengeData () {
    let futarchyOutcome
    if (this.state.challenge.futarchyOutcome == 0) {
      futarchyOutcome = 'Passed'
    } else if (this.state.challenge.futarchyOutcome == 1) {
      futarchyOutcome = 'Failed'
    } else {
      futarchyOutcome = 'None'
    }
    return (
      <table>
        <tbody>
          <tr>
            <td className={'shady'}>ChallengeID</td>
            <td>{this.state.challengeID}</td>
          </tr>
          <tr>
            <td className={'shady'}>Started</td>
            <td>{formatBool(this.state.challenge.started)}</td>
          </tr>
          <tr>
            <td className={'shady'}>Funded</td>
            <td>{formatBool(this.state.challenge.funded)}</td>
          </tr>
          <tr>
            <td className={'shady'}>Futarchy: Resolution</td>
            <td>{formatTimestamp(this.state.challenge.futarchyTradingResolutionDate)}</td>
          </tr>
          <tr>
            <td className={'shady'}>Futarchy: Time Remaining</td>
            <td>
              <TimeRemainingDisplay
                startTime={this.state.challenge.futarchyTradingResolutionDate}
                endTime={this.props.blockTime}
              />
            </td>
          </tr>
          <tr>
            <td className={'shady'}>Conditional: Resolution</td>
            <td>{formatTimestamp(this.state.challenge.conditionalTradingResolutionDate)}</td>
          </tr>
          <tr>
            <td className={'shady'}>Conditional: Time Remaining</td>
            <td>
              <TimeRemainingDisplay
                startTime={this.state.challenge.conditionalTradingResolutionDate}
                endTime={this.props.blockTime}
              />
            </td>
          </tr>
          <tr>
            <td className={'shady'}>Challenger</td>
            <td>{this.state.challenge.challenger}</td>
          </tr>
          <tr>
            <td className={'shady'}>Stake</td>
            <td>{formatWeiNumberString(this.state.challenge.stakeAmount)}</td>
          </tr>
          <tr>
            <td className={'shady'}>Upper Bound</td>
            <td>{formatWeiNumberString(this.state.challenge.upperBound)}</td>
          </tr>
          <tr>
            <td className={'shady'}>Lower Bound</td>
            <td>{formatWeiNumberString(this.state.challenge.lowerBound)}</td>
          </tr>
          <tr>
            <td className={'shady'}>Futarchy Outcome</td>
            <td>{futarchyOutcome}</td>
          </tr>
        </tbody>
      </table>
    )
  }

  renderChallengeStatus () {
    const { challenge } = this.state
    const { outcomeAveragePrices } = challenge
    const decisionPeriodStatus = challenge.futarchyTradingResolutionDate > this.props.blockTime ?
      'ACTIVE' : 'CLOSED'
    const challengePassing = outcomeAveragePrices.LONG_ACCEPTED > outcomeAveragePrices.LONG_DENIED
    const outcomeStatus = decisionPeriodStatus == 'ACTIVE' ? 
      (challengePassing ? 'PASSING' : 'FAILING') :
      (challengePassing ? 'PASSED' : 'FAILED')
    return (
      <table>
        <tbody>
          <tr>
            <td className={'shady'}>Status</td>
            <td>{outcomeStatus}</td>
          </tr>
          <tr>
            <td className={'shady'}>Decision Period</td>
            <td>{decisionPeriodStatus}</td>
          </tr>
        </tbody>
      </table>
    )
  }

  renderChallenge () {
    if (this.state.listingLoaded) {
      let challengeElem
      if (this.state.challengeID > 0) {
        if (this.state.loadedChallengeState) {
          challengeElem = (
            <div>
              <div>
                {this.renderChallengeStatus()}
              </div>
              <br />
              <h3>Challenge Data</h3>
              {this.renderChallengeData()}
              <br /><br />
              {this.renderDecisionMarketData()}
              <br /><br />
              {this.renderTradeData()}
            </div>
          )
        } else {
          challengeElem = <div>Loading...</div>
        }
      } else {
        challengeElem = <div>No challenge</div>
      }
  
      return (
        <div>
          <h2>Challenge State</h2>
          {challengeElem}
        </div>
      )
    }
  }

  renderListing () {
    if (!this.state.listingLoaded) {
      return <div>Loading...</div>
    }
    return (
      <table>
        <tbody>
          <tr>
            <td className={'shady'}>Owner</td>
            <td>{this.state.owner}</td>
          </tr>
          <tr>
            <td className={'shady'}>Deposit</td>
            <td>{formatWeiNumberString(this.state.deposit)}</td>
          </tr>
          <tr>
            <td className={'shady'}>Expires</td>
            <td>{formatTimestamp(this.state.applicationExpiry)}</td>
          </tr>
        </tbody>
      </table>
    )
  }

  render () {
    return (
      <div>
        <h1>{this.state.listingName}</h1>
        {this.renderListing()}
        <br /><br />

        {this.renderChallenge()}
      </div>
    )
  }
}

export default Listing
