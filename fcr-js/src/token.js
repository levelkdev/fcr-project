const eip20ABI = require('./abis/eip20ABI')

module.exports = (web3, address) => {
  const contract = new web3.eth.Contract(eip20ABI, address)

  const getBalance = async (owner) => {
    const bal = await contract.methods.balanceOf(owner).call()
    return bal
  }

  const getAllowance = async (owner, spender) => {
    const allowance = await contract.methods.allowance(owner, spender).call()
    return allowance
  }

  return {
    getBalance,
    getAllowance,
    contract,
    address
  }
}