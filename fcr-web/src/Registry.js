import React, { Component } from 'react'
import ListingsView from './Components/ListingsView'

class Registry extends Component {

  render() {
    return (
      <div>
        <h1>Approved for Registry</h1>
        <ListingsView whitelisted={true} deleted={false} />
      </div>
    )
  }

}

export default Registry;
