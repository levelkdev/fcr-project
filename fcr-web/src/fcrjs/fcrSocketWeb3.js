import web3 from '../socketWeb3'
import fcrjs from 'fcr-js/src'
import config from 'fcr-config'

export default fcrjs(web3, config.rinkeby)
