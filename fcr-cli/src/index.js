const _ = require('lodash')
const yargs = require('yargs')
const web3 = require('./web3')
const config = require('../../fcr-config/config.json')
const BN = web3.utils.BN;

// TODO add config to the CLI to switch envs (local, ropsten, etc)
const fcr = require('../../fcr-js/src')(web3, config.local)

yargs
  .options({
    'v': {
      alias: 'verbose',
      boolean: true,
      default: false,
      describe: 'log verbose output'
    }
  })

  .command(
    'apply <listingHash> <amount> [data]',
    'submit a listing application to the registry',
    {
      listingHash: {
        require: true
      },
      amount: {
        require: true,
        number: true
      },
      data: {
        default: ''
      },
      from: {
        default: '0',
        number: true
      }
    },
    async (argv) => {
      const applicant = await getFromAddress(argv.from)
      const amount = tryParseIntParam('amount', argv.amount)

      await execSenderFunction(
        argv,
        'registry.apply',
        fcr.registry.apply,
        [
          ['applicant', applicant],
          ['listingHash', argv.listingHash],
          ['amount', amount],
          ['data', argv.data]
        ]
      )
    }
  )

  .command(
    'challenge <listingHash> [data]',
    'create a challenge for a listing',
    {
      listingHash: {
        require: true
      },
      data: {
        default: ''
      },
      from: {
        default: '0',
        number: true
      }
    },
    async (argv) => {
      const challenger = await getFromAddress(argv.from)

      console.log(`Creating challenge for ${argv.listingHash}:`)
      
      await execSenderFunction(
        argv,
        'registry.createChallenge',
        fcr.registry.createChallenge,
        [
          ['challenger', challenger],
          ['listingHash', argv.listingHash],
          ['data', argv.data]
        ]
      )

      const listing = await fcr.registry.getListing(argv.listingHash)
      const challenge = await fcr.registry.getChallenge(listing.challengeID)
      console.log(`Challenge ${listing.challengeID} created`)
      console.log('')

      await execSenderFunction(
        argv,
        `registry.getChallenge(${listing.challengeID}).start`,
        challenge.start,
        [
          ['challenger', challenger]
        ]
      )
      console.log(`Challenge ${listing.challengeID} started`)
      console.log('')

      await execSenderFunction(
        argv,
        `registry.getChallenge(${listing.challengeID}).fund`,
        challenge.fund,
        [
          ['challenger', challenger]
        ]
      )
      console.log(`Challenge ${listing.challengeID} funded`)
      console.log('')
    }
  )

  .command(
    'buy <listingHash> <outcome> <amount>',
    `buys outcome token on the given listing's challenge market`,
    {
      listingHash: {
        require: true
      },
      outcome: {
        required: true
      },
      amount: {
        require: true,
        number: true
      },
      from: {
        default: '0',
        number: true
      }
    },
    async (argv) => {
      const buyer = await getFromAddress(argv.from)

      const outcome = fcr.outcomes[argv.outcome]
      if (!outcome) {
        throw new Error(`'${argv.outcome}' is not a valid outcome`)
      }

      const listing = await fcr.registry.getListing(argv.listingHash)
      if (parseInt(listing.challengeID) == 0) {
        console.log(`No challenge for listing '${argv.listingHash}'`)
        return
      }

      const challenge = await fcr.registry.getChallenge(listing.challengeID)

      await execSenderFunction(
        argv,
        `registry.getChallenge(${listing.challengeID}).buyOutcome`,
        challenge.buyOutcome,
        [
          ['buyer', buyer],
          ['outcome', outcome],
          ['amount', toWeiUnits(argv.amount)]
        ]
      )
    }
  )

  .command({
    command: 'registryName',
    desc: 'get the name of the registry',
    handler: async () => {
      const name = await fcr.registry.name()
      console.log(name)
    }
  })

  .command(
    'tokenBalance <address>',
    'gets the amount of FCR token held by the given address',
    {
      address: {
        required: true
      }
    },
    async (argv) => {
      const address = await getAccountByIndex(argv.address)
      const balance = await fcr.token.getBalance(address)
      console.log(`${address}: ${balance}`)
    }
  )

  .command(
    'registryAllowance <address>',
    'gets the amount of token the registry contract can spend on behalf of the given address',
    {
      address: {
        required: true
      }
    },
    async (argv) => {
      const owner = await getAccountByIndex(argv.address)
      const spender = fcr.registry.address
      const allowance = await fcr.token.getAllowance(owner, spender)
      console.log(`${owner}: ${allowance}`)
    }
  )

  .help()
  .argv

async function getFromAddress (fromParamValue) {
  const fromAccountIndex = tryParseIntParam('from', fromParamValue)
  const address = await getAccountByIndex(fromAccountIndex)
  return address
}

async function getAccountByIndex (indexOrAddress) {
  const accounts = await web3.eth.getAccounts()

  // check if given param is an address or an index
  const address = parseInt(indexOrAddress) > 10 ** 18 ? 
    indexOrAddress : accounts[indexOrAddress]

  return address
}

function tryParseIntParam (paramName, intString) {
  const int = parseInt(intString)
  if (isNaN(int)) {
    throw new Error(`value for '${paramName}' is not a number`)
  }
  return int
}

function toWeiUnits(amount) {
  return new BN(amount).mul(new BN('1000000000000000000')).toString()
}

async function execSenderFunction(argv, fnName, fn, fnArgs) {
  console.log('')
  console.log(`${fnName}({`)
  _.forEach(fnArgs, (arg, i) => {
    console.log(`  ${arg[0]}: '${arg[1]}'${i != fnArgs.length - 1 ? ',' : ''}`)
  })
  console.log(`})`)
  console.log('')
  const args = _.map(fnArgs, (arg) => {
    return arg[1]
  })
  const txReceipts = await fn.apply(null, args)

  for (const i in txReceipts) {
    const txReceipt = txReceipts[i]
    const txOutput = `${txReceipt.function}: ${txReceipt.receipt.transactionHash}`
    console.log(txOutput)
    if (argv.v) {
      const txReceiptOutput = _.merge(
        _.omit(txReceipt, 'receipt'),
        {
          receipt: _.omit(txReceipt.receipt, ['events'])
        }
      )
      console.log('  transaction: ', txReceiptOutput)
      console.log('  events: ', txReceipt.receipt.events)
    }
    console.log('')
  }
}
