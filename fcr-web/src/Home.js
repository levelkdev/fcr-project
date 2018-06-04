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
    super(props);

    this.state = {
      applications: []
    };
  }

  componentWillMount() {
    fcr.registry.watchEvent(
      '_Application',
      (event) => { this.setApplicationEventToState(event) },
      console.error
    )

    setTimeout(() => {
      fcr.registry.watchEvent(
        '_Challenge',
        (event) => { this.setChallengeEventToState(event) },
        console.error
      )
    }, 1000)
  }

  async setApplicationEventToState (event) {
    const vals = event.returnValues
    let application = {
      appEndDate: vals.appEndDate,
      applicant: vals.applicant,
      deposit: vals.deposit,
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

      const challengeLinkElem = application.challengeID > 0 ? 
        <a href={`challenges/${application.challengeID}`}>view challenge</a> :
        null

      return (
        <div key={`listing_${application.listingHash}`}>
          <div>listingHash: {application.listingHash}</div>
          <div>appEndDate: {application.appEndDate}</div>
          <div>applicant: {application.applicant}</div>
          <div>deposit: {application.deposit}</div>
          {challengeLinkElem}
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
