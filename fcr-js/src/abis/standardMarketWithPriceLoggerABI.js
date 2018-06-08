module.exports = [
  {
    "constant": true,
    "inputs": [],
    "name": "creator",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "startDate",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "marketMaker",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "outcomeTokenIndex",
        "type": "uint8"
      },
      {
        "name": "outcomeTokenCount",
        "type": "uint256"
      },
      {
        "name": "minProfit",
        "type": "uint256"
      }
    ],
    "name": "shortSell",
    "outputs": [
      {
        "name": "cost",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "close",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "outcomeTokenIndex",
        "type": "uint8"
      },
      {
        "name": "outcomeTokenCount",
        "type": "uint256"
      },
      {
        "name": "minProfit",
        "type": "uint256"
      }
    ],
    "name": "sell",
    "outputs": [
      {
        "name": "profit",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "withdrawFees",
    "outputs": [
      {
        "name": "fees",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "LONG",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "createdAtBlock",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "lastTradeDate",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "priceIntegral",
    "outputs": [
      {
        "name": "",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "netOutcomeTokensSold",
    "outputs": [
      {
        "name": "",
        "type": "int256"
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
        "name": "outcomeTokenCost",
        "type": "uint256"
      }
    ],
    "name": "calcMarketFee",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "stage",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "endDate",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_funding",
        "type": "uint256"
      }
    ],
    "name": "fund",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "funding",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "fee",
    "outputs": [
      {
        "name": "",
        "type": "uint24"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "lastTradePrice",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "eventContract",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "getAvgPrice",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "outcomeTokenIndex",
        "type": "uint8"
      },
      {
        "name": "outcomeTokenCount",
        "type": "uint256"
      },
      {
        "name": "maxCost",
        "type": "uint256"
      }
    ],
    "name": "buy",
    "outputs": [
      {
        "name": "cost",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "FEE_RANGE",
    "outputs": [
      {
        "name": "",
        "type": "uint24"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_creator",
        "type": "address"
      },
      {
        "name": "_eventContract",
        "type": "address"
      },
      {
        "name": "_marketMaker",
        "type": "address"
      },
      {
        "name": "_fee",
        "type": "uint24"
      },
      {
        "name": "_startDate",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "funding",
        "type": "uint256"
      }
    ],
    "name": "MarketFunding",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "MarketClosing",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "fees",
        "type": "uint256"
      }
    ],
    "name": "FeeWithdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "outcomeTokenIndex",
        "type": "uint8"
      },
      {
        "indexed": false,
        "name": "outcomeTokenCount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "outcomeTokenCost",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "marketFees",
        "type": "uint256"
      }
    ],
    "name": "OutcomeTokenPurchase",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "outcomeTokenIndex",
        "type": "uint8"
      },
      {
        "indexed": false,
        "name": "outcomeTokenCount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "outcomeTokenProfit",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "marketFees",
        "type": "uint256"
      }
    ],
    "name": "OutcomeTokenSale",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "outcomeTokenIndex",
        "type": "uint8"
      },
      {
        "indexed": false,
        "name": "outcomeTokenCount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "cost",
        "type": "uint256"
      }
    ],
    "name": "OutcomeTokenShortSale",
    "type": "event"
  }
]
