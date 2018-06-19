
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import './App.css'
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom"
import web3 from './socketWeb3'
import Home from "./Home"
import Listing from "./Listing"
import getLatestBlock from './eth/getLatestBlock'
import TimeDisplay from './Components/TimeDisplay'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      latestBlockTime: null
    }
  }

  componentWillMount () {
    const $this = this
    web3.eth.subscribe('newBlockHeaders', function(error, result) {
      if (!error) {
        $this.setLatestBlockState(result)
      } else {
        console.error(error)
      }
    })
    this.fetchBlockInfo()
  }

  async fetchBlockInfo () {
    if (!this.state.loadingLatestBlockTime) {
      this.setState({ loadingLatestBlockTime: true })
      const latestBlock = await getLatestBlock(web3)
      this.setLatestBlockState(latestBlock)
      this.setState({
        loadingLatestBlockTime: false
      })
    }
  }

  setLatestBlockState (latestBlock) {
    this.setState({
      latestBlockTime: latestBlock.timestamp,
      latestBlockNumber: latestBlock.number
    })
  }

  render() {

    return (
      <HashRouter>
        <div className="appContainer">

          <div className="topnav">
            <div className="nav-left">
              <NavLink to="/home">Home</NavLink>
            </div>
            <ul className="nav-right">
              <li>
                <TimeDisplay timestamp={this.state.latestBlockTime} />
              </li>
              <li>
                #{this.state.latestBlockNumber}
              </li>
            </ul>
          </div>

          <div className="content">
            <Route exact path="/" component={Home}/>
            <Route exact path="/home" component={Home}/>
            <Route exact path="/listings/:listingHash" render={props => (
              <Listing {...props} blockTime={this.state.latestBlockTime} />
            )}/>
          </div>

        </div>
      </HashRouter>
    )
  }
}

export default App
