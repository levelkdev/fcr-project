import React, { Component } from 'react'
import fcr from './fcrjs/fcrWeb3'
import { formatWeiNumberString } from './formatters'

class TokenMinting extends Component {

  constructor (props) {
    super(props)

    this.executeGimmeTokens = this.executeGimmeTokens.bind(this)
    
    this.state = {
      gimmeTokensExecuting: false
    }
  }

  async executeGimmeTokens () {
    if (!this.state.gimmeTokensExecuting) {
      this.setState({ gimmeTokensExecuting: true })
      const tx = await fcr.token.gimmeTokens(this.props.account, 'Betsy')
      this.setState({ gimmeTokensExecuting: false })
    }
  }

  render() {
    const getTokenElem = this.state.gimmeTokensExecuting ?
      <div>Getting token...</div> : 
      <div className="button" onClick={this.executeGimmeTokens}>Get Tokens</div>

    const tokenInfoView = parseInt(this.props.balance) > 0 ?
      <div>Your Token Balance: {formatWeiNumberString(this.props.balance)}</div> :
      getTokenElem

    return (
      <div>
        <h1>FCR Token</h1>
        {tokenInfoView}
      </div>
    )
  }

}

export default TokenMinting
