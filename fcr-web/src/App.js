
import React, { Component } from 'react'
import './fontawesome/css/all.css'
import './App.css'
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom"
import web3 from './socketWeb3'
import Applications from "./Applications"
import Registry from "./Registry"
import TokenMinting from "./TokenMinting"
import FutarchyTrading from "./FutarchyTrading"
import RejectedApplications from "./RejectedApplications"
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
              <NavLink to="/applications">Applications</NavLink>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <NavLink to="/registry">Registry</NavLink>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <NavLink to="/rejected">Rejected</NavLink>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <NavLink to="/token-minting">Token Minting</NavLink>
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
            <Route exact path="/" component={Applications}/>
            <Route exact path="/applications" component={Applications}/>
            <Route exact path="/registry" component={Registry}/>
            <Route exact path="/rejected" component={RejectedApplications}/>
            <Route exact path="/token-minting" component={TokenMinting}/>
            <Route exact path="/listings/:listingHash" render={props => (
              <Listing {...props} blockTime={this.state.latestBlockTime} />
            )}/>
            <Route exact path="/futarchy-trading/:listingHash" render={props => (
              <FutarchyTrading {...props} blockTime={this.state.latestBlockTime} />
            )}/>
          </div>

        </div>
      </HashRouter>
    )
  }
}

export default App
