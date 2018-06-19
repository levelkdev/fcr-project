import React, { Component } from 'react'
import { formatTimestamp } from '../formatters'

export default ({ timestamp }) => {
  return <div className="time-display">{formatTimestamp(timestamp)}</div>
}
