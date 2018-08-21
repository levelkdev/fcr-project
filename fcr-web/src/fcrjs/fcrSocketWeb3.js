import web3 from '../socketWeb3'
import config from '../config'
import fcrjs from 'fcr-js'

export default fcrjs(web3, config.local)
