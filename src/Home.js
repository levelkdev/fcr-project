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

    this.state = {};
  }

  componentWillMount() {
    const whiteCardTokenUnits = 10 ** 12 * 10 ** 18
    const defaultTokenBuyAmount = 0.001 * 10 ** 18

    Registry.getPastEvents('_Application', {
      fromBlock: 0,
      toBlock: 'latest'
    }, async (err, events) => {
      for(var i = 0; i < events.length; i++) {
        let event = events[i]
        console.log('EVENT: ', event)
      }
    })
  }

  render() {
    return (
      <div>HELLO FCR</div>
    )
  }
}

export default Home;
