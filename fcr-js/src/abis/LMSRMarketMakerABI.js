module.exports = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "market",
        "type": "address"
      },
      {
        "name": "outcomeTokenIndex",
        "type": "uint8"
      },
      {
        "name": "outcomeTokenCount",
        "type": "uint256"
      }
    ],
    "name": "calcProfit",
    "outputs": [
      {
        "name": "profit",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "market",
        "type": "address"
      },
      {
        "name": "outcomeTokenIndex",
        "type": "uint8"
      },
      {
        "name": "outcomeTokenCount",
        "type": "uint256"
      }
    ],
    "name": "calcCost",
    "outputs": [
      {
        "name": "cost",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "market",
        "type": "address"
      },
      {
        "name": "outcomeTokenIndex",
        "type": "uint8"
      }
    ],
    "name": "calcMarginalPrice",
    "outputs": [
      {
        "name": "price",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
