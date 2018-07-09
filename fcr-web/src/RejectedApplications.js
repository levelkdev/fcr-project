import React, { Component } from 'react'
import ListingsView from './Components/ListingsView'

class RejectedApplications extends Component {

  render() {
    return (
      <div>
        <h1>Rejected Applications</h1>
        <ListingsView whitelisted={false} deleted={true} />
      </div>
    )
  }

}

export default RejectedApplications;
