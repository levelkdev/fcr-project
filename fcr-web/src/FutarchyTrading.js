import React, { Component } from 'react'
import web3 from './socketWeb3'

class FutarchyTrading extends Component {

  constructor(props) {
    super(props)
    const { listingHash } = props.match.params
    const listingName = web3.utils.toAscii(listingHash)

    this.state = {
      listingHash,
      listingName
    }
  }

  render() {
    return (
      <div>
        <h1>Trade Some Futarchies for {this.state.listingName}</h1>
      </div>
    )
  }

}

export default FutarchyTrading
