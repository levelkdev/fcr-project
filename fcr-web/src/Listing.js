import _ from 'lodash'
import moment from 'moment'
import web3 from './socketWeb3'
import React, { Component } from 'react'
import config from 'fcr-config'
import fcrjs from 'fcr-js/src'

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
        outcomeCosts: {}
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

      this.challenge.watchEvent(
        '_Started',
        {},
        () => { this.setChallengeToState() },
        console.error
      )

      this.challenge.watchEvent(
        '_Funded',
        {},
        () => { this.setChallengeToState() },
        console.error
      )
    }

    this.setState({ challengeID })
    this.setChallengeToState()
  }

  async getOutcomeCost (outcome) {
    const cost = await this.challenge.calculateOutcomeCost(outcome, 10 ** 18)
    return Math.round(cost / 10 ** 14) / 10 ** 4
  }

  async setChallengeToState () {
    const challengeStarted = await this.challenge.started()
    const challengeFunded = await this.challenge.funded()
    const longAcceptedCost = await this.getOutcomeCost(fcr.outcomes.LONG_ACCEPTED)
    const shortAcceptedCost = await this.getOutcomeCost(fcr.outcomes.SHORT_ACCEPTED)
    const longDeniedCost = await this.getOutcomeCost(fcr.outcomes.LONG_DENIED)
    const shortDeniedCost = await this.getOutcomeCost(fcr.outcomes.SHORT_DENIED)

    this.setState({
      challenge: {
        started: challengeStarted,
        funded: challengeFunded,
        outcomeCosts: {
          LONG_ACCEPTED: longAcceptedCost,
          SHORT_ACCEPTED: shortAcceptedCost,
          LONG_DENIED: longDeniedCost,
          SHORT_DENIED: shortDeniedCost,
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
              <td>{this.state.challenge.outcomeCosts.LONG_ACCEPTED}</td>
            </tr>
            <tr>
              <td className={'shady'}>SHORT_ACCEPTED</td>
              <td>{this.state.challenge.outcomeCosts.SHORT_ACCEPTED}</td>
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
              <td>{this.state.challenge.outcomeCosts.LONG_DENIED}</td>
            </tr>
            <tr>
              <td className={'shady'}>SHORT_DENIED</td>
              <td>{this.state.challenge.outcomeCosts.SHORT_DENIED}</td>
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

function getFormattedDate (timestampInSeconds) {
  const unixTimestamp = parseInt(timestampInSeconds) * 1000
  return moment(unixTimestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")
}

export default Listing