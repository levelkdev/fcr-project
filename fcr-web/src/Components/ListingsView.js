import _ from 'lodash'
import React, { Component } from 'react'
import fcrSocket from '../fcrjs/fcrSocketWeb3'
import fcr from '../fcrjs/fcrWeb3'
import web3 from '../web3'
import { formatWeiNumberString, formatTimestamp } from '../formatters'
import ShortAddress from './ShortAddress'
import ChallengeStatusIndicator from './ChallengeStatusIndicator'

class ListingsView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      applications: []
    }
  }

  componentWillMount() {
    fcrSocket.registry.watchEvent(
      '_Application',
      null,
      (event) => { this.setApplicationEventToState(event) },
      console.error
    )

    fcrSocket.registry.watchEvent(
      '_Challenge',
      null,
      (event) => { this.setChallengeEventToState(event) },
      console.error
    )

    fcrSocket.registry.watchEvent(
      '_ApplicationWhitelisted',
      null,
      (event) => { this.setListingUpdateToState(event) },
      console.error
    )

    fcrSocket.registry.watchEvent(
      '_ApplicationRemoved',
      null,
      (event) => { this.setListingUpdateToState(event) },
      console.error
    )

    fcrSocket.registry.watchEvent(
      '_ListingRemoved',
      null,
      (event) => { this.setListingUpdateToState(event) },
      console.error
    )
  }

  async setApplicationEventToState (event) {
    const vals = event.returnValues
    let application = {
      appEndDate: vals.appEndDate,
      applicant: vals.applicant,
      deposit: vals.deposit,
      rawListingHash: vals.listingHash,
      listingHash: web3.utils.toAscii(vals.listingHash)
    }
    const listing = await fcr.registry.getListing(application.listingHash)
    application.whitelisted = listing.whitelisted
    application.deleted = parseInt(listing.deposit) == 0

    console.log(`GOT APPLICATION FOR ${application.listingHash}: `)
    console.log(listing)
    console.log('')

    application.challengeID = parseInt(listing.challengeID)
    application = _.extend(
      await this.fetchChallengeData(listing.challengeID), application
    )
    let applications = this.state.applications
    applications.unshift(application)
    this.setState({ applications })
  }

  async setChallengeEventToState (event) {
    const listingHash = web3.utils.toAscii(event.returnValues.listingHash)
    const applications = this.state.applications
    let application = _.find(applications, { listingHash })
    if (application) {
      application.challengeID = event.returnValues.challengeID
      application = _.extend(
        await this.fetchChallengeData(application.challengeID), application
      )
      this.setState({ applications })
    }
  }

  async setListingUpdateToState (event) {
    const rawListingHash = event.returnValues.listingHash
    const listingHash = web3.utils.toAscii(rawListingHash)
    const listing = await fcr.registry.getListing(listingHash)

    console.log('EVENT: ', event)
    console.log('LISTING HASH: ', listingHash)
    console.log('LISTING: ', listing)

    const applications = this.state.applications
    let application = _.find(applications, { listingHash })
    if (application) {
      application.whitelisted = listing.whitelisted
      application.deleted = parseInt(listing.deposit) == 0
      this.setState({ applications })
    }
  }

  async fetchChallengeData (challengeID) {
    if (challengeID > 0) {
      const challenge = await fcr.registry.getChallenge(challengeID)
      const ended = await challenge.ended()
      const futarchyOutcome = await challenge.futarchyOutcome()
      const challengeStatus = ended ? 
        (futarchyOutcome == 0 ? 'failed' : 'passed') : 'active'
      return {
        challengeOutcome: futarchyOutcome,
        challengeEnded: ended,
        challengeStatus
      }
    } else {
      return {}
    }
  }

  render() {
    let applications = _.map(this.state.applications, _.clone);
    _.remove(applications, (app) => {
      return app.whitelisted != this.props.whitelisted || app.deleted != this.props.deleted
    })
    const listingElems = applications.map((application) => {

      const challengeOutcomeRowElem = application.challengeID > 0 ? 
        (
          <tr>
            <td className={'shady'}>Challenge Status</td>
            <td>
              <ChallengeStatusIndicator status={application.challengeStatus} />
            </td>
          </tr>
        ) : null
        
      const challengeIdRowElem = application.challengeID > 0 ?
        (
          <tr>
            <td className={'shady'}>Challenge ID</td>
            <td>{application.challengeID}</td>
          </tr>
        ) : null
        
      const challengeTradeRowElem = application.challengeID > 0 ?
        (
          <tr>
            <td colSpan="2">
              <a href={`/#/futarchy-trading/${application.rawListingHash}`}>Trade</a>
            </td>
          </tr>
        ) : null

      return (
        <div key={`listing_${application.listingHash}`}>
          <table>
            <tbody>
              <tr>
                <td colSpan="2" className={'title-cell'}>
                  <a href={`/#/listings/${application.rawListingHash}`}>{application.listingHash}</a>
                </td>
              </tr>
              <tr>
                <td className={'shady'}>Application End Date</td>
                <td>{formatTimestamp(application.appEndDate)}</td>
              </tr>
              <tr>
                <td className={'shady'}>Applicant</td>
                <td>
                  <ShortAddress address={application.applicant} />
                </td>
              </tr>
              <tr>
                <td className={'shady'}>Deposit</td>
                <td>{formatWeiNumberString(application.deposit)}</td>
              </tr>
              {challengeOutcomeRowElem}
              {challengeIdRowElem}
              {challengeTradeRowElem}
            </tbody>
          </table>
          <br /><br />
        </div>
      )
    })
    return (
      <div>
        {listingElems}
      </div>
    )
  }
}

export default ListingsView;
