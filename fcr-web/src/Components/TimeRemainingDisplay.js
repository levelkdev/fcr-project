import React, { Component } from 'react'
import { formatDuration } from '../formatters'

export default ({ startTime, endTime }) => {
  return (
    <div className="duration-display">
      {formatDuration(startTime, endTime) || 'None'}
    </div>
  )
}
