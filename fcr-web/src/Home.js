import _ from 'lodash'
import moment from 'moment'
import web3 from './socketWeb3'
import React, { Component } from 'react'
import ipfsAPI from 'ipfs-api'
import config from 'fcr-config'
import fcrjs from 'fcr-js/src'

// TODO add config to the CLI to switch envs (local, ropsten, etc)
const fcr = fcrjs(web3, config.local)

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

class Home extends Component {

  constructor(props) {
    super(props)

    this.state = {
      applications: []
    }
  }

  componentWillMount() {
    fcr.registry.watchEvent(
      '_Application',
      null,
      (event) => { this.setApplicationEventToState(event) },
      console.error
    )

    fcr.registry.watchEvent(
      '_Challenge',
      null,
      (event) => { this.setChallengeEventToState(event) },
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
    application.challengeID = parseInt(listing.challengeID)
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
      this.setState({ applications })
    }
  }

  render() {
    const applicationElems = this.state.applications.map((application) => {

      const challengeIdRowElem = application.challengeID > 0 ? 
        (
          <tr>
            <td className={'shady'}>challengeID</td>
            <td>{application.challengeID}</td>
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
                <td className={'shady'}>appEndDate</td>
                <td>{application.appEndDate}</td>
              </tr>
              <tr>
                <td className={'shady'}>applicant</td>
                <td>{application.applicant}</td>
              </tr>
              <tr>
                <td className={'shady'}>deposit</td>
                <td>{application.deposit}</td>
              </tr>
              {challengeIdRowElem}
            </tbody>
          </table>
          <br /><br />
        </div>
      )
    })
    return (
      <div>
        <h1>Applications</h1>
        {applicationElems}
      </div>
    )
  }
}

export default Home;
