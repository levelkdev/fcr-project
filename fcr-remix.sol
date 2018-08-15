pragma solidity ^0.4.24;

contract Registry {
    using SafeMath for uint;

    struct Listing {
        uint applicationExpiry; // Expiration date of apply stage
        bool whitelisted;       // Indicates registry status
        address owner;          // Owner of Listing
        uint deposit;           // Number of tokens in the listing not locked in a challenge
        uint challengeID;       // Corresponds to challenge contract in the challenges mapping
        address challenger;     // Address of the challenger
    }

    // Maps challengeID to challenge contract address
    mapping(uint => ChallengeInterface) public challenges;
    // Maps listingHashes to associated listingHash data
    mapping(bytes32 => Listing) public listings;

    // Global Variables
    EIP20Interface public token;
    ChallengeFactoryInterface public challengeFactory;
    Parameterizer public parameterizer;
    string public name;
    uint constant public INITIAL_CHALLENGE_NONCE = 0;
    uint public challengeNonce;

    // --------------------
    // PUBLISHER INTERFACE:
    // --------------------

    function apply(bytes32 _listingHash, uint _amount, string _data) external;
    function deposit(bytes32 _listingHash, uint _amount) external;
    function withdraw(bytes32 _listingHash, uint _amount) external;
    function exit(bytes32 _listingHash) external;

    // -----------------------
    // TOKEN HOLDER INTERFACE:
    // -----------------------
    function createChallenge(bytes32 _listingHash, string _data) external returns (uint challengeID);
    function updateStatus(bytes32 _listingHash) public;

    // --------
    // GETTERS:
    // --------
    function canBeWhitelisted(bytes32 _listingHash) view public returns (bool);
    function isWhitelisted(bytes32 _listingHash) view public returns (bool whitelisted);
    function appWasMade(bytes32 _listingHash) view public returns (bool exists);
}












contract FutarchyOracle {
    using SafeMath for *;

    uint8 public constant LONG = 1;

    /*
     *  Storage
     */
    address creator;
    StandardMarketWithPriceLogger[] public markets;
    CategoricalEvent public categoricalEvent;
    uint public tradingPeriod;
    uint public winningMarketIndex;
    bool public isSet;

    function fund(uint funding) public;


    /// @dev Closes market for winning outcome and redeems winnings and sends all collateral tokens to creator
    function close() public;

    /// @dev Allows to set the oracle outcome based on the market with largest long position
    function setOutcome() public;

    /// @dev Returns if winning outcome is set
    /// @return Is outcome set?
    function isOutcomeSet() public view returns (bool);

    /// @dev Returns winning outcome
    /// @return Outcome
    function getOutcome() public view returns (int);
}





















contract Event {

    EIP20Interface public collateralToken;
    Oracle public oracle;
    bool public isOutcomeSet;
    int public outcome;
    OutcomeToken[] public outcomeTokens;

    /*
     *  Public functions
     */
    /// @dev Buys equal number of tokens of all outcomes, exchanging collateral tokens and sets of outcome tokens 1:1
    /// @param collateralTokenCount Number of collateral tokens
    function buyAllOutcomes(uint collateralTokenCount) public;

    /// @dev Sells equal number of tokens of all outcomes, exchanging collateral tokens and sets of outcome tokens 1:1
    /// @param outcomeTokenCount Number of outcome tokens
    function sellAllOutcomes(uint outcomeTokenCount) public;

    /// @dev Sets winning event outcome
    function setOutcome() public;

    /// @dev Returns outcome count
    /// @return Outcome count
    function getOutcomeCount() public view returns (uint8);

    /// @dev Returns outcome tokens array
    /// @return Outcome tokens
    function getOutcomeTokens() public view returns (OutcomeToken[]);

    /// @dev Returns the amount of outcome tokens held by owner
    /// @return Outcome token distribution
    function getOutcomeTokenDistribution(address owner) public view returns (uint[] outcomeTokenDistribution);

    /// @dev Calculates and returns event hash
    /// @return Event hash
    function getEventHash() public view returns (bytes32);

    /// @dev Exchanges sender's winning outcome tokens for collateral tokens
    /// @return Sender's winnings
    function redeemWinnings() public returns (uint);
}




contract CategoricalEvent is Event {

    /*
     *  Public functions
     */
    /// @dev Exchanges sender's winning outcome tokens for collateral tokens
    /// @return Sender's winnings
    function redeemWinnings() public returns (uint winnings);

    /// @dev Calculates and returns event hash
    /// @return Event hash
    function getEventHash() public view returns (bytes32);
}






contract StandardMarket {
    using SafeMath for *;

    uint24 public constant FEE_RANGE = 1000000;

    /// @dev Allows to fund the market with collateral tokens converting them into outcome tokens
    /// @param _funding Funding amount
    function fund(uint _funding) public;

    /// @dev Allows market creator to close the markets by transferring all remaining outcome tokens to the creator
    function close() public;

    /// @dev Allows market creator to withdraw fees generated by trades
    /// @return Fee amount
    function withdrawFees() public returns (uint fees);

    /// @dev Allows to trade outcome tokens and collateral with the market maker
    /// @param outcomeTokenAmounts Amounts of each outcome token to buy or sell. If positive, will buy this amount of outcome token from the market. If negative, will sell this amount back to the market instead.
    /// @param collateralLimit If positive, this is the limit for the amount of collateral tokens which will be sent to the market to conduct the trade. If negative, this is the minimum amount of collateral tokens which will be received from the market for the trade. If zero, there is no limit.
    /// @return If positive, the amount of collateral sent to the market. If negative, the amount of collateral received from the market. If zero, no collateral was sent or received.
    function trade(int[] outcomeTokenAmounts, int collateralLimit) public returns (int netCost);

    /// @dev Calculates fee to be paid to market maker
    /// @param outcomeTokenCost Cost for buying outcome tokens
    /// @return Fee for trade
    function calcMarketFee(uint outcomeTokenCost) public view returns (uint);
}







contract StandardMarketWithPriceLogger is StandardMarket {

    uint constant ONE = 0x10000000000000000;
    uint8 public constant LONG = 1;

    uint public startDate;
    uint public endDate;
    uint public lastTradeDate;
    uint public lastTradePrice;
    uint public priceIntegral;

    function trade(int[] outcomeTokenAmounts, int collateralLimit) public returns (int netCost);


    /// @dev Allows market creator to close the markets by transferring all remaining outcome tokens to the creator
    function close() public;

    /// @dev Calculates average price for long tokens based on price integral
    /// @return Average price for long tokens over time
    function getAvgPrice() public view returns (uint);

}









contract ChallengeInterface {
  function ended() public view returns (bool);
  function passed() public view returns (bool);
  function tokenLockAmount() public view returns (uint);
}






contract EIP20Interface {
    uint256 public totalSupply;

    function balanceOf(address _owner) public view returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}






contract ChallengeFactoryInterface {
  function createChallenge(address challenger, address listingOwner) external returns (ChallengeInterface);
}





contract Parameterizer {

  using SafeMath for uint;

  struct ParamProposal {
    uint appExpiry;
    uint challengeID;
    uint deposit;
    string name;
    address owner;
    uint processBy;
    uint value;
  }

  struct Challenge {
    uint rewardPool;        // (remaining) pool of tokens distributed amongst winning voters
    address challenger;     // owner of Challenge
    bool resolved;          // indication of if challenge is resolved
    uint stake;             // number of tokens at risk for either party during challenge
    uint winningTokens;     // (remaining) amount of tokens used for voting by the winning side
    mapping(address => bool) tokenClaims;
  }


  mapping(bytes32 => uint) public params;
  // maps challengeIDs to associated challenge data
  mapping(uint => Challenge) public challenges;
  // maps pollIDs to intended data change if poll passes
  mapping(bytes32 => ParamProposal) public proposals;
  // Global Variables
  EIP20Interface public token;
  uint public PROCESSBY = 604800; // 7 days

  function proposeReparameterization(string _name, uint _value) public returns (bytes32);
  function canBeSet(bytes32 _propID) view public returns (bool);
  function propExists(bytes32 _propID) view public returns (bool);
  function get(string _name) public view returns (uint value);
  function tokenClaims(uint _challengeID, address _voter) public view returns (bool);
}




contract OutcomeToken is EIP20Interface  {
    using SafeMath for *;

    address public eventContract;

    modifier isEventContract () {
        // Only event contract is allowed to proceed
        require(msg.sender == eventContract);
        _;
    }


    /// @dev Events contract issues new tokens for address. Returns success
    /// @param _for Address of receiver
    /// @param outcomeTokenCount Number of tokens to issue
    function issue(address _for, uint outcomeTokenCount) public isEventContract;

    /// @dev Events contract revokes tokens for address. Returns success
    /// @param _for Address of token holder
    /// @param outcomeTokenCount Number of tokens to revoke
    function revoke(address _for, uint outcomeTokenCount) public isEventContract;
}




contract Oracle {

    function isOutcomeSet() public view returns (bool);
    function getOutcome() public view returns (int);
}





  library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a * b;
      assert(a == 0 || c / a == b);
      return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
      // assert(b > 0); // Solidity automatically throws when dividing by 0
      uint256 c = a / b;
      // assert(a == b * c + a % b); // There is no case in which this doesn't hold
      return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
      assert(b <= a);
      return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a + b;
      assert(c >= a);
      return c;
    }
  }
