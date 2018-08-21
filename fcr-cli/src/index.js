const _ = require('lodash')
const yargs = require('yargs')
const web3 = require('web3')
const getWeb3 = require('./getWeb3')
const config = require('../../fcr-config/config.json')
const getChallenge = require('./getChallenge')

const BN = web3.utils.BN;

yargs
  .options({
    'v': {
      alias: 'verbose',
      boolean: true,
      default: false,
      describe: 'log verbose output'
    },
    'network': {
      default: 'rinkeby',
      describe: 'network config to use'
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
      const applicant = await getFromAddress(
        getWeb3(argv.network),
        argv.from
      )
      const amount = tryParseIntParam('amount', argv.amount)
      const fcr = getFcr(argv.network)

      await execSenderFunction(
        argv,
        'registry.apply',
        fcr.registry.apply,
        [
          ['applicant', applicant],
          ['listingHash', argv.listingHash],
          ['amount', toWeiUnits(amount)],
          ['data', argv.data]
        ]
      )
      process.exit(1);
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
      const challenger = await getFromAddress(
        getWeb3(argv.network),
        argv.from
      )
      const fcr = getFcr(argv.network)

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
      process.exit(1);
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
      const buyer = await getFromAddress(
        getWeb3(argv.network),
        argv.from
      )
      const fcr = getFcr(argv.network)

      const outcome = fcr.outcomes[argv.outcome]
      if (!outcome) {
        throw new Error(`'${argv.outcome}' is not a valid outcome`)
      }

      const challenge = await getChallenge(fcr, argv.listingHash)
      if (!challenge) {
        console.log(`No challenge for listing '${argv.listingHash}'`)
        return
      }

      await execSenderFunction(
        argv,
        `registry.getChallenge(${challenge.ID}).buyOutcome`,
        challenge.buyOutcome,
        [
          ['buyer', buyer],
          ['outcome', outcome],
          ['amount', toWeiUnits(argv.amount)]
        ]
      )
      process.exit(1);
    }
  )

  .command(
    'close <listingHash>',
    'close the challenge',
    {
      listingHash: {
        require: true
      },
      from: {
        default: '0',
        number: true
      }
    },
    async (argv) => {
      const sender = await getFromAddress(
        getWeb3(argv.network),
        argv.from
      )
      const fcr = getFcr(argv.network)

      const challenge = await getChallenge(fcr, argv.listingHash)
      if (!challenge) {
        console.log(`No challenge for listing '${argv.listingHash}'`)
        return
      }

      const isOutcomeSet = await challenge.isOutcomeSet()
      if (!isOutcomeSet) {
        await execSenderFunction(
          argv,
          `registry.getChallenge(${challenge.ID}).setOutcome`,
          challenge.setOutcome,
          [
            ['sender', sender]
          ]
        )

        // TODO: output the outcome result
        console.log(`Outcome set for challenge on listing '${argv.listingHash}'`)
        console.log('')
      }

      await execSenderFunction(
        argv,
        `registry.updateStatus`,
        fcr.registry.updateStatus,
        [
          ['sender', sender],
          ['listingHash', argv.listingHash],
        ]
      )

      console.log(`Listing '${argv.listingHash} status updated`)
      console.log('')

      process.exit(1);
    }
  )

  .command(
    'resolve <listingHash> <price>',
    'resolve scalar market price oracles for a challenge',
    {
      listingHash: {
        require: true
      },
      price: {
        require: true,
        number: true
      },
      from: {
        default: '0',
        number: true
      }
    },
    async (argv) => {
      const sender = await getFromAddress(
        getWeb3(argv.network),
        argv.from
      )
      const fcr = getFcr(argv.network)

      const challenge = await getChallenge(fcr, argv.listingHash)
      if (!challenge) {
        console.log(`No challenge for listing '${argv.listingHash}'`)
        return
      }

      await execSenderFunction(
        argv,
        `registry.getChallenge(${challenge.ID}).resolveDecisionMarkets`,
        challenge.resolveDecisionMarkets,
        [
          ['sender', sender],
          ['price', argv.price]
        ]
      )

      process.exit(1);
    }
  )

  .command(
    'challengeStatus <listingHash>',
    'outputs the status of a challenge for the given listingHash',
    {
      listingHash: {
        require: true
      }
    },
    async (argv) => {
      const fcr = getFcr(argv.network)
      const challenge = await getChallenge(fcr, argv.listingHash)
      if (!challenge) {
        console.log(`No challenge for listing '${argv.listingHash}'`)
        return
      }
      const status = await challenge.status()
      console.log(status)
      process.exit(1);
    }
  )

  .command({
    command: 'registryName',
    desc: 'get the name of the registry',
    handler: async (argv) => {
      const fcr = getFcr(argv.network)
      const name = await fcr.registry.name()
      console.log(name)
      process.exit(1);
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
      const fcr = getFcr(argv.network)
      const address = await getAccountByIndex(getWeb3(argv.network), argv.address)
      const balance = await fcr.token.getBalance(address)
      console.log(`${address}: ${balance}`)
      process.exit(1);
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
      const fcr = getFcr(argv.network)
      const owner = await getAccountByIndex(getWeb3(argv.network), argv.address)
      const spender = fcr.registry.address
      const allowance = await fcr.token.getAllowance(owner, spender)
      console.log(`${owner}: ${allowance}`)
      process.exit(1);
    }
  )

  .scriptName('fcr')
  .help()
  .showHelpOnFail(false)
  .argv

function getFcr (network) {
  const fcr = require('fcr-js')(
    getWeb3(network),
    config[network]
  )
  return fcr
}

async function getFromAddress (web3Instance, fromParamValue) {
  const fromAccountIndex = tryParseIntParam('from', fromParamValue)
  const address = await getAccountByIndex(web3Instance, fromAccountIndex)
  return address
}

async function getAccountByIndex (web3Instance, indexOrAddress) {
  const accounts = await web3Instance.eth.getAccounts()

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
