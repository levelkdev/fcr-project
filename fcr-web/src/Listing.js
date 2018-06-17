import _ from 'lodash'
import moment from 'moment'
import web3 from './socketWeb3'
import React, { Component } from 'react'
import config from 'fcr-config'
import fcrjs from 'fcr-js/src'

const BN = web3.utils.BN

// TODO add config to the CLI to switch envs (local, ropsten, etc)
const fcr = fcrjs(web3, config.local)

class Listing extends Component {
  constructor(props) {
    super(props)

    const { listingHash } = props.match.params
    const listingName = web3.utils.toAscii(listingHash)

    this.state = {
      listingHash,
      listingName,
      listingLoaded: false,
      challenge: {
        outcomeAveragePrices: {}
      }
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
          this.setChallengeToState()
        },
        console.error
      )
    }

    this.setState({ challengeID })
    this.setChallengeToState()
  }

  async getAverageOutcomePrice (outcome) {
    const avgPrice = await this.challenge.getAverageOutcomePrice(outcome)
    return Math.round(avgPrice / 10 ** 14) / 10 ** 6
  }

  async setChallengeToState () {
    const challengeStarted = await this.challenge.started()
    const challengeFunded = await this.challenge.funded()
    const challenger = await this.challenge.contract.methods.challenger().call()
    const stakeAmount = await this.challenge.contract.methods.stakeAmount().call()
    const upperBound = await this.challenge.contract.methods.upperBound().call()
    const lowerBound = await this.challenge.contract.methods.lowerBound().call()

    const longAcceptedPrice = await this.getAverageOutcomePrice(fcr.outcomes.LONG_ACCEPTED)
    const shortAcceptedPrice = await this.getAverageOutcomePrice(fcr.outcomes.SHORT_ACCEPTED)
    const longDeniedPrice = await this.getAverageOutcomePrice(fcr.outcomes.LONG_DENIED)
    const shortDeniedPrice = await this.getAverageOutcomePrice(fcr.outcomes.SHORT_DENIED)

    this.setState({
      challenge: {
        started: challengeStarted,
        funded: challengeFunded,
        challenger,
        stakeAmount,
        lowerBound,
        upperBound,
        outcomeAveragePrices: {
          LONG_ACCEPTED: longAcceptedPrice,
          SHORT_ACCEPTED: shortAcceptedPrice,
          LONG_DENIED: longDeniedPrice,
          SHORT_DENIED: shortDeniedPrice,
        }
      }
    })
  }

  renderDecisionMarketData () {
    return (
      <div>
        <h3>Decision Markets</h3>
        <table>
          <tbody>
            <tr>
              <td colSpan="2">ACCEPTED</td>
            </tr>
            <tr>
              <td className={'shady'}>LONG_ACCEPTED</td>
              <td>{this.state.challenge.outcomeAveragePrices.LONG_ACCEPTED}</td>
            </tr>
            <tr>
              <td className={'shady'}>SHORT_ACCEPTED</td>
              <td>{this.state.challenge.outcomeAveragePrices.SHORT_ACCEPTED}</td>
            </tr>
          </tbody>
        </table>

        <br /><br />

        <table>
          <tbody>
            <tr>
              <td colSpan="2">DENIED</td>
            </tr>
            <tr>
              <td className={'shady'}>LONG_DENIED</td>
              <td>{this.state.challenge.outcomeAveragePrices.LONG_DENIED}</td>
            </tr>
            <tr>
              <td className={'shady'}>SHORT_DENIED</td>
              <td>{this.state.challenge.outcomeAveragePrices.SHORT_DENIED}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  renderChallengeData () {
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
        </tbody>
      </table>
    )
  }

  renderChallenge () {
    if (this.state.listingLoaded) {
      let challengeStatusElem = this.state.challengeID > 0 ? (
        <div>
          {this.renderChallengeData()}
          <br /><br />
          {this.renderDecisionMarketData()}
        </div>
      ) : <div>No challenge</div>
  
      return (
        <div>
          <h2>Challenge Status</h2>
          {challengeStatusElem}
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
            <td>{this.state.deposit}</td>
          </tr>
          <tr>
            <td className={'shady'}>Expires</td>
            <td>{getFormattedDate(this.state.applicationExpiry)}</td>
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

function formatBool (val) {
  return val ? 'true' : 'false'
}

function formatWeiNumberString (numStr) {
  if (numStr) {
    return new BN(numStr).div(new BN('1000000000000000000')).toString()
  } else {
    return '0'
  }
}

function getFormattedDate (timestampInSeconds) {
  const unixTimestamp = parseInt(timestampInSeconds) * 1000
  return moment(unixTimestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")
}

export default Listing
