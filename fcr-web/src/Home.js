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
    this.fetchApplicationEvents()
  }

  fetchApplicationEvents () {
    fcr.registry.watchApplicationEvents((event) => {
      this.setApplicationEventToState(event)
    }, (err) => console.error)
  }

  setApplicationEventToState (event) {
    const vals = event.returnValues
    const application = {
      appEndDate: vals.appEndDate,
      applicant: vals.applicant,
      deposit: vals.deposit,
      listingHash: web3.utils.toAscii(vals.listingHash)
    }
    let applications = this.state.applications
    applications.unshift(application)
    this.setState({ applications })
  }

  render() {
    const applicationElems = this.state.applications.map((application) => {
      return (
        <div key={`listing_${application.listingHash}`}>
          <div>listingHash: {application.listingHash}</div>
          <div>appEndDate: {application.appEndDate}</div>
          <div>applicant: {application.applicant}</div>
          <div>deposit: {application.deposit}</div>
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
