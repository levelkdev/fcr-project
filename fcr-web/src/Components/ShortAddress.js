import React, { Component } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default ({ address }) => {
  let shortAddress = address ? `${address.substr(0, 16)}...` : ''
  return (
    <div className={'short-address'}>
      <div className={'tooltip'}>
        {shortAddress}
        <span className={'tooltiptext'}>{address}</span>
      </div>&nbsp;
      <CopyToClipboard text={address}>
        <span className={'copy-btn far fa-copy'} />
      </CopyToClipboard>
    </div>
  )
}
