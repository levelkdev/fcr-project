const _ = require('lodash')
const eip20ABI = require('./abis/eip20ABI')

module.exports = (web3, address, defaultOptions) => {
  if (!defaultOptions) defaultOptions = {}

  const contract = new web3.eth.Contract(eip20ABI, address)

  const getBalance = async (owner) => {
    const bal = await contract.methods.balanceOf(owner).call()
    return bal
  }

  const getAllowance = async (owner, spender) => {
    const allowance = await contract.methods.allowance(owner, spender).call()
    return allowance
  }

  const approve = async (owner, spender, value) => {
    const tx = await contract.methods.approve(spender, value)
      .send(_.extend({ from: owner }, defaultOptions))
    return tx
  }

  return {
    approve,
    getBalance,
    getAllowance,
    contract,
    address
  }
}