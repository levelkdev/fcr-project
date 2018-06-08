module.exports = [
  {
    "constant": false,
    "inputs": [],
    "name": "setOutcome",
    "outputs": [],
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
    "name": "winningMarketIndex",
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
    "name": "getOutcome",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "markets",
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
    "name": "categoricalEvent",
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
    "name": "isSet",
    "outputs": [
      {
        "name": "",
        "type": "bool"
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
        "name": "funding",
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
    "name": "isOutcomeSet",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "tradingPeriod",
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
    "inputs": [
      {
        "name": "_creator",
        "type": "address"
      },
      {
        "name": "eventFactory",
        "type": "address"
      },
      {
        "name": "collateralToken",
        "type": "address"
      },
      {
        "name": "oracle",
        "type": "address"
      },
      {
        "name": "outcomeCount",
        "type": "uint8"
      },
      {
        "name": "lowerBound",
        "type": "int256"
      },
      {
        "name": "upperBound",
        "type": "int256"
      },
      {
        "name": "marketFactory",
        "type": "address"
      },
      {
        "name": "marketMaker",
        "type": "address"
      },
      {
        "name": "fee",
        "type": "uint24"
      },
      {
        "name": "_tradingPeriod",
        "type": "uint256"
      },
      {
        "name": "startDate",
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
    "name": "FutarchyFunding",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "FutarchyClosing",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "winningMarketIndex",
        "type": "uint256"
      }
    ],
    "name": "OutcomeAssignment",
    "type": "event"
  }
]
