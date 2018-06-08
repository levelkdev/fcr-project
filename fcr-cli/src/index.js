const yargs = require('yargs')
const web3 = require('./web3')
const config = require('../../fcr-config/config.json')

// TODO add config to the CLI to switch envs (local, ropsten, etc)
const fcr = require('../../fcr-js/src')(web3, config.local)

yargs
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

      console.log('')
      console.log(`sending 'apply' transaction:`)
      console.log(`  listingHash: ${argv.listingHash}`)
      console.log(`  amount: ${amount}`)
      console.log(`  data: ${argv.data}`)
      console.log(`  applicant (sender): ${applicant}`)
      console.log('')

      const tx = await fcr.registry.apply(applicant, argv.listingHash, amount, argv.data)
      console.log(tx)
      console.log('')
    }
  )

  .command(
    'challenge <listingHash> <lowerBound> <upperBound> [data]',
    'create a challenge for a listing',
    {
      listingHash: {
        require: true
      },
      lowerBound: {
        require: true,
        number: true
      },
      upperBound: {
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
      const challenger = await getFromAddress(argv.from)

      console.log(`Creating challenge for ${argv.listingHash}:`)
      console.log(`  challenger (sender): ${challenger}`)

      console.log('')
      console.log(`registry.createChallenge({`)
      console.log(`  listingHash: ${argv.listingHash},`)
      console.log(`  data: ${argv.data},`)
      console.log('})')
      console.log('')

      const createChallengeTxReceipt = await fcr.registry.createChallenge(
        challenger,
        argv.listingHash,
        argv.data
      )
      console.log(createChallengeTxReceipt)
      console.log('')

      const listing = await fcr.registry.getListing(argv.listingHash)
      const challenge = await fcr.registry.getChallenge(listing.challengeID)
      console.log(`Challenge created: ChallengeID=${listing.challengeID}`)
      console.log('')
  
      console.log(`challenge.start({`)
      console.log(`  lowerBound: ${argv.lowerBound},`)
      console.log(`  upperBound: ${argv.upperBound}`)
      console.log('})')
      const startTxReceipt = await challenge.start(
        challenger,
        argv.lowerBound,
        argv.upperBound
      )
      console.log(startTxReceipt)
      console.log('')
      console.log('Challenge started')
      console.log('')

      console.log('challenge.fund()')
      console.log('')
  
      const fundTxReceipt = await challenge.fund(challenger)
      console.log(fundTxReceipt)
      console.log('')
      console.log('Challenge funded')
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

      const buyOutcomeTxs = await challenge.buyOutcome(
        buyer,
        outcome,
        argv.amount
      )
      console.log(buyOutcomeTxs)
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
