
module.exports = function () {

  this.transactions = []

  this.send = async (web3Contract, txFunctionName, inputs = [], options = {}) => {
    let txReceipt
    try {
      txReceipt = await web3Contract.methods[txFunctionName].apply(
        this,
        inputs
      ).send(options)
    } catch (err) {
      throw new Error(`
        ${txFunctionName} tx error: ${err}
          inputs: ${inputs}
          options: ${JSON.stringify(options)}
      `)
    }

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