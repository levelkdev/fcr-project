module.exports = [
  {
    "constant": true,
    "inputs": [],
    "name": "centralizedOracleFactory",
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
    "name": "ended",
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
    "name": "futarchyOracle",
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
    "name": "challenger",
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
    "name": "isStarted",
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
    "name": "stakeAmount",
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
    "name": "futarchyOracleFactory",
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
        "name": "_lowerBound",
        "type": "int256"
      },
      {
        "name": "_upperBound",
        "type": "int256"
      }
    ],
    "name": "start",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "passed",
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
    "name": "lmsrMarketMaker",
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
    "name": "tokenLockAmount",
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
    "name": "listingOwner",
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
    "constant": true,
    "inputs": [],
    "name": "token",
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
    "inputs": [
      {
        "name": "_tokenAddr",
        "type": "address"
      },
      {
        "name": "_challenger",
        "type": "address"
      },
      {
        "name": "_listingOwner",
        "type": "address"
      },
      {
        "name": "_stakeAmount",
        "type": "uint256"
      },
      {
        "name": "_tradingPeriod",
        "type": "uint256"
      },
      {
        "name": "_futarchyOracleFactory",
        "type": "address"
      },
      {
        "name": "_centralizedOracleFactory",
        "type": "address"
      },
      {
        "name": "_lmsrMarketMaker",
        "type": "address"
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
        "name": "challenger",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "stakeAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "futarchyOracleAddress",
        "type": "address"
      }
    ],
    "name": "_Started",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "futarchyOracleFactory",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "collateralToken",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "oracle",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "outcomeCount",
        "type": "uint8"
      },
      {
        "indexed": false,
        "name": "lowerBound",
        "type": "int256"
      },
      {
        "indexed": false,
        "name": "upperBound",
        "type": "int256"
      },
      {
        "indexed": false,
        "name": "marketMaker",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "fee",
        "type": "uint24"
      },
      {
        "indexed": false,
        "name": "tradingPeriod",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "startDate",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "now",
        "type": "uint256"
      }
    ],
    "name": "_DebugStart",
    "type": "event"
  }
]
