import moment from 'moment'
import web3 from './web3'

const BN = web3.utils.BN

export function formatBool (val) {
  return val ? 'true' : 'false'
}

export function formatWeiNumberString (numStr) {
  if (numStr) {
    return new BN(numStr).div(new BN('1000000000000000000')).toString()
  } else {
    return '0'
  }
}

export function formatTimestamp (timestampInSeconds) {
  const unixTimestamp = parseInt(timestampInSeconds) * 1000
  return moment(unixTimestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")
}
