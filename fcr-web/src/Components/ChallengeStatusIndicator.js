import React, { Component } from 'react'
import './ChallengeStatusIndicator.css'

const statusDisplayTextMap = {
  active: 'Active',
  passed: 'Passed',
  failed: 'Failed'
}

const statusIconMap = {
  active: 'fa-clock',
  passed: 'fa-check',
  failed: 'fa-times'
}

export default ({ status }) => {
  return (
    <div className={`challenge-status-indicator ${status}`}>
      {statusDisplayTextMap[status]} <span className={`icon fa ${statusIconMap[status]}`} />
    </div>
  )
}
