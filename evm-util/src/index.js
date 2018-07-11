const yargs = require('yargs')
const moment = require('moment')
const web3 = require('./web3')

web3.extend({
  property: 'ganache',
  methods: [{
    name: 'snapshot',
    call: 'evm_snapshot'
  }, {
    name: 'revert',
    call: 'evm_revert',
    params: 1
  }, {
    name: 'increaseTime',
    call: 'evm_increaseTime',
    params: 1
  }, {
    name: 'mine',
    call: 'evm_mine'
  }]
});

yargs

  .command(
    'snapshot',
    'takes a snapshot of the current EVM state',
    {},
    async () => {
      const snapshotId = await snapshot()
      console.log(`snapshot ${snapshotId} created`)
    }
  )

  .command(
    'revert <snapshotId>',
    'reverts to a snapshot and mine a block',
    {
      snapshotId: {
        required: true
      }
    },
    async (argv) => {
      await revert(argv.snapshotId)
      console.log(`reverted to ${argv.snapshotId}`)
    }
  )

  .command(
    'increaseTime <seconds>',
    'increase the time and mines a block',
    {
      seconds: {
        require: true
      }
    },
    async (argv) => {
      const seconds = parseInt(argv.seconds)
      const totalTimeAdjustment = await increaseTime(seconds)
      console.log(`time increased: ${seconds} seconds`)
      console.log(`total time adjustment: ${totalTimeAdjustment} seconds`)
    }
  )

  .command(
    'mine',
    'mines a block',
    {},
    async () => {
      await web3.ganache.mine()
      const blockNum = await web3.eth.getBlockNumber()
      console.log(`block #${blockNum} mined`)
    }
  )

  .scriptName('evm')
  .help()
  .showHelpOnFail(false)
  .argv

function snapshot() {
  return new Promise((resolve, reject) => {
    web3.ganache.snapshot((err, snapshotId) => {
      if (!err) {
        resolve(snapshotId)
      } else {
        reject(err)
      }
    })
  })
}

function revert(snapshotId) {
  return new Promise((resolve, reject) => {
    web3.ganache.revert(snapshotId, async (err) => {
      if (!err) {
        try {
          await mine()
          resolve()
        } catch (mineErr) { reject(mineErr) }
      } else {
        reject(err)
      }
    })
  })
}

function increaseTime(duration) {
  return new Promise((resolve, reject) => {
    web3.ganache.increaseTime(duration, async (err, totalTimeAdjustment) => {
      if (!err) {
        try {
          await mine()
          resolve(totalTimeAdjustment)
        } catch (mineErr) { reject (mineErr) }
      } else {
        reject(err)
      }
    })
  })
}

function mine() {
  return new Promise((resolve, reject) => {
    web3.ganache.mine((err) => {
      if (!err) {
        resolve()
      } else {
        reject(err)
      }
    })
  })
}
