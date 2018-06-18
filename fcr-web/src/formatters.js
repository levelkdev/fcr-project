import moment from 'moment'
import Decimal from 'decimal.js'

export function formatBool (val) {
  return val ? 'true' : 'false'
}

export function formatWeiNumberString (numStr) {
  if (numStr) {
    const d = new Decimal(numStr).div(10 ** 18)
    Decimal.set({ toExpNeg: -32, toExpPos: 32 })
    return d.toString()
  } else {
    return '0'
  }
}

export function formatTimestamp (timestampInSeconds) {
  const unixTimestamp = parseInt(timestampInSeconds) * 1000
  return moment(unixTimestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")
}
