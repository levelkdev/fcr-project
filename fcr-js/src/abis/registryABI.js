module.exports = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "INITIAL_CHALLENGE_NONCE",
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
    "name": "challengeFactory",
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
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "challenges",
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
    "inputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "listings",
    "outputs": [
      {
        "name": "applicationExpiry",
        "type": "uint256"
      },
      {
        "name": "whitelisted",
        "type": "bool"
      },
      {
        "name": "owner",
        "type": "address"
      },
      {
        "name": "deposit",
        "type": "uint256"
      },
      {
        "name": "challengeID",
        "type": "uint256"
      },
      {
        "name": "challenger",
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
    "name": "challengeNonce",
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
    "name": "parameterizer",
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
        "name": "_challengeFactoryAddr",
        "type": "address"
      },
      {
        "name": "_paramsAddr",
        "type": "address"
      },
      {
        "name": "_name",
        "type": "string"
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
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "deposit",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "appEndDate",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "data",
        "type": "string"
      },
      {
        "indexed": true,
        "name": "applicant",
        "type": "address"
      }
    ],
    "name": "_Application",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "challengeID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "challengeAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "data",
        "type": "string"
      },
      {
        "indexed": true,
        "name": "challenger",
        "type": "address"
      }
    ],
    "name": "_Challenge",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "challengeID",
        "type": "uint256"
      }
    ],
    "name": "_ChallengeStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "added",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "newTotal",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "_Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "withdrew",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "newTotal",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "_Withdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      }
    ],
    "name": "_ApplicationWhitelisted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      }
    ],
    "name": "_ApplicationRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      }
    ],
    "name": "_ListingRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      }
    ],
    "name": "_ListingWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      }
    ],
    "name": "_TouchAndRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "name": "challengeID",
        "type": "uint256"
      }
    ],
    "name": "_ChallengeFailed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "listingHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "name": "challengeID",
        "type": "uint256"
      }
    ],
    "name": "_ChallengeSucceeded",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_listingHash",
        "type": "bytes32"
      },
      {
        "name": "_amount",
        "type": "uint256"
      },
      {
        "name": "_data",
        "type": "string"
      }
    ],
    "name": "apply",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_listingHash",
        "type": "bytes32"
      },
      {
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_listingHash",
        "type": "bytes32"
      },
      {
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_listingHash",
        "type": "bytes32"
      }
    ],
    "name": "exit",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_listingHash",
        "type": "bytes32"
      },
      {
        "name": "_data",
        "type": "string"
      }
    ],
    "name": "createChallenge",
    "outputs": [
      {
        "name": "challengeID",
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
        "name": "_listingHash",
        "type": "bytes32"
      }
    ],
    "name": "updateStatus",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_listingHash",
        "type": "bytes32"
      }
    ],
    "name": "canBeWhitelisted",
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
    "inputs": [
      {
        "name": "_listingHash",
        "type": "bytes32"
      }
    ],
    "name": "isWhitelisted",
    "outputs": [
      {
        "name": "whitelisted",
        "type": "bool"
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
        "name": "_listingHash",
        "type": "bytes32"
      }
    ],
    "name": "appWasMade",
    "outputs": [
      {
        "name": "exists",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
