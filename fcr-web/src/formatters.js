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

export function formatShortenedWeiNumberString (numStr) {
  if (numStr) {
    const d = new Decimal(numStr).div(10 ** 18).toDecimalPlaces(4, Decimal.ROUND_UP)
    return d.toString()
  } else {
    return '0'
  }
}

export function formatTimestamp (timestampInSeconds) {
  const unixTimestamp = parseInt(timestampInSeconds) * 1000
  return moment(unixTimestamp).format("MMMM Do YYYY, h:mm:ss a")
}

export function formatDuration (startTime, endTime) {
  const duration = (parseInt(startTime) - parseInt(endTime)) * 1000
  if (duration > 0) {
    const dur = moment.duration(duration)
    const d = dur.days()
    const h = dur.hours()
    const m = dur.minutes()
    const s = dur.seconds()
    return `${d} day${d == 1 ? '' : 's'} : ${h} hour${h == 1 ? '' : 's'} : ${dur.minutes()} minute${m == 1 ? '' : 's'} : ${dur.seconds()} second${s == 1 ? '' : 's'}`
  }
}
