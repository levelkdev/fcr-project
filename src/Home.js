import _ from 'lodash'
import moment from 'moment'
import web3 from './web3'
import React, { Component } from 'react'
import Registry from './web3Contracts/Registry'
import ipfsAPI from 'ipfs-api'

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      applications: []
    };
  }

  componentWillMount() {
    const whiteCardTokenUnits = 10 ** 12 * 10 ** 18
    const defaultTokenBuyAmount = 0.001 * 10 ** 18

    Registry.getPastEvents('_Application', {
      fromBlock: 0,
      toBlock: 'latest'
    }, async (err, events) => {
      let applications = []
      for(var i = 0; i < events.length; i++) {
        const event = events[i]
        const vals = event.returnValues
        const application = {
          appEndDate: vals.appEndDate,
          applicant: vals.applicant,
          deposit: vals.deposit,
          listingHash: web3.utils.toAscii(vals.listingHash)
        }
        applications.push(application)
      }
      this.setState({ applications: applications })
    })
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
