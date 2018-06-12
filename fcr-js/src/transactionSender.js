
module.exports = function () {

  this.transactions = []

  this.send = async (web3Contract, txFunctionName, inputs = [], options = {}) => {
    const txReceipt = await web3Contract.methods[txFunctionName].apply(
      this,
      inputs
    ).send(options)

    this.add(txReceipt, txFunctionName, web3Contract.options.address)
  }

  this.add = (txReceipt, txFunctionName, contractAddress) => {
    this.transactions.push({
      contract: {
        address: contractAddress
      },
      function: txFunctionName,
      receipt: txReceipt
    })
  }

  this.response = () => {
    return this.transactions
  }

}