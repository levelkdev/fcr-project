import React, { Component } from 'react'
import ListingsView from './Components/ListingsView'

class Applications extends Component {

  render() {
    return (
      <div>
        <h1>Pending Applications</h1>
        <ListingsView whitelisted={false} deleted={false} />
      </div>
    )
  }

}

export default Applications;
