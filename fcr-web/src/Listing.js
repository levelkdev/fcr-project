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
      challenge: {}
    }
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
      deposit: parseInt(listing.deposit),
      owner: listing.owner,
      applicationExpiry: parseInt(listing.applicationExpiry),
      whitelisted: listing.whitelisted
    })
  }

  async fetchChallenge (challengeID) {
    const challenge = await fcr.registry.getChallenge(challengeID)
    const challengeStarted = await challenge.started()
    this.setState({
      challengeID,
      challenge: {
        started: challengeStarted
      }
    })
  }

  renderChallenge () {
    if(this.state.challengeID > 0) {
      return (
        <div>
          CHALLENGE ID: {this.state.challengeID}
          <div>Started: {formatBool(this.state.challenge.started)}</div>
        </div>
      )
    } else {
      return (
        <div>No challenge</div>
      )
    }
  }

  render () {
    return (
      <div>
        <h1>{this.state.listingName}</h1>
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
        <br /><br />

        <h2>Challenge Status</h2>
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
