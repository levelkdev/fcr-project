
import React, { Component } from 'react'
import './fontawesome/css/all.css'
import './App.css'
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom"
import socketWeb3 from './socketWeb3'
import web3 from './web3'
import fcr from './fcrjs/fcrSocketWeb3'
import Applications from "./Applications"
import Registry from "./Registry"
import TokenMinting from "./TokenMinting"
import FutarchyTrading from "./FutarchyTrading"
import RejectedApplications from "./RejectedApplications"
import Listing from "./Listing"
import getLatestBlock from './eth/getLatestBlock'
import TimeDisplay from './Components/TimeDisplay'
import ShortAddress from './Components/ShortAddress'
import { formatWeiNumberString } from './formatters'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: null,
      ethBalance: null,
      fcrTokenBalance: null,
      latestBlockTime: null
    }
  }

  componentWillMount () {
    const $this = this

    socketWeb3.eth.subscribe('newBlockHeaders', function(error, result) {
      if (!error) {
        $this.setLatestBlockState(result)
      } else {
        console.error(error)
      }
    })

    web3.eth.getAccounts((error, accounts) => {
      if (!error) {
        $this.setState({ account: accounts[0] })
        $this.fetchFCRTokenBalance(accounts[0])
        $this.fetchETHBalance(accounts[0])

        fcr.token.watchEvent(
          'Mint',
          null,
          (event) => { this.fetchFCRTokenBalance(accounts[0]) },
          console.error
        )

        fcr.token.watchEvent(
          'Transfer',
          null,
          (event) => { this.fetchFCRTokenBalance(accounts[0]) },
          console.error
        )

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

  async fetchFCRTokenBalance (account) {
    const balance = await fcr.token.getBalance(account)
    this.setState({ fcrTokenBalance: balance })
  }

  async fetchETHBalance (account) {
    const balance = await web3.eth.getBalance(account)
    this.setState({ ethBalance: balance })
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
            <div className="nav-right">
              <div className="block-info">
                <TimeDisplay timestamp={this.state.latestBlockTime} />
                <div className="block-number">Block #{this.state.latestBlockNumber}</div>
              </div>
              <ShortAddress address={this.state.account} />
              <div className="balance-info">
                <div className="fcr-balance">
                  FCR: {formatWeiNumberString(this.state.fcrTokenBalance)}
                </div>
                <div className="eth-balance">
                  ETH: {formatWeiNumberString(this.state.ethBalance)}
                </div>
              </div>
            </div>
          </div>

          <div className="content">
            <Route exact path="/" component={Applications}/>
            <Route exact path="/applications" component={Applications}/>
            <Route exact path="/registry" component={Registry}/>
            <Route exact path="/rejected" component={RejectedApplications}/>
            <Route exact path="/token-minting" render={props => (
              <TokenMinting {...props}
                account={this.state.account}
                balance={this.state.fcrTokenBalance}
              />
            )}/>
            <Route exact path="/listings/:listingHash" render={props => (
              <Listing {...props} blockTime={this.state.latestBlockTime} />
            )}/>
            <Route exact path="/futarchy-trading/:listingHash" render={props => (
              <FutarchyTrading {...props}
                account={this.state.account}
                blockTime={this.state.latestBlockTime}
              />
            )}/>
          </div>

        </div>
      </HashRouter>
    )
  }
}

export default App
