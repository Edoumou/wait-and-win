// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./ERC20/ERC20.sol";
import "./ERC20/Owned.sol";

/*=================================
 * Written by Samuel Gwlanold Ongala
 */

contract WaitAndWin is ERC20("Wait And Win", "WAW"), Owned {
    struct VPool {
        bool registered;
        string ID;
        uint256 price;
        uint256 prize;
        uint256 numberOfUsers;
        uint256 numberOfVoters;
        uint256 startRegistrationTime;
        uint256 endRegistrationTime;
        uint256 endTime;
        mapping(address => bool) userVoted;
        mapping(address => uint256) userVote;
        mapping(uint256 => address) voterAddresses;
        mapping(address => bool) userWithdrawed;
    }

    struct User {
        address userAddress;
        uint256 numberOfPools;
        string[] userPools;
        uint256[] userVotes;
    }

    struct Stake {
        bool isStaking;
        uint256 startStakingTime;
        uint256 amountStaked;
        uint256 rewards;
        uint256 numberOfStakers;
    }

    mapping(string => VPool) public vPools;
    mapping(address => User) public users;
    mapping(address => Stake) public stakers;

    mapping(address => mapping(string => bool)) public userRegistered;

    uint256 public numberOfRegisteredPools;

    //** ERC20 token */
    uint256 private initialSupply = 500000 ether; // 1 eth = 10^(18) => decimals = 18
    uint256 public rateOfChange = 1000;
    uint256 public raisedAmount;
    uint256 private minInvestment;
    uint256 private maxInvestment;
    address[] listOfInvestors;
    address payable public depositETHAddress;
    address payable private ownerAddress;

    mapping(address => bool) public investors;

    event TokenPayed(address _address);

    enum State {
        Registering,
        Voting,
        End
    }

    mapping(string => State) public poolState;

    //==== constructor and functions ====
    constructor(address payable _depositETHAddress) {
        numberOfRegisteredPools = 0;

        //***token = new ERC20("Rare Platform Token", "RPT");

        depositETHAddress = _depositETHAddress;
        mint(msg.sender, initialSupply);

        minInvestment = 0.01 ether;
        maxInvestment = 10 ether;

        ownerAddress = payable(getOwnerAddress());
    }

    function RegisterOrJoinPool(string memory _poolID, uint256 _token) public {
        require(!vPools[_poolID].registered, "Pool already registered");

        // user balance
        uint256 userBalance = balanceOf(msg.sender);
        require(_token <= userBalance, "Not enough tokens");

        // update pool state
        vPools[_poolID].startRegistrationTime = block.timestamp;
        vPools[_poolID].endRegistrationTime = block.timestamp + 2 minutes;
        vPools[_poolID].endTime = block.timestamp + 5 minutes;
        vPools[_poolID].registered = true;
        vPools[_poolID].ID = _poolID;
        vPools[_poolID].price = _token;
        vPools[_poolID].numberOfUsers++;
        vPools[_poolID].prize += _token;

        numberOfRegisteredPools++;

        // set the pool status to registering
        poolState[_poolID] = State.Registering;

        // rgister the new user
        users[msg.sender].userAddress = msg.sender;
        users[msg.sender].userPools.push(_poolID);
        users[msg.sender].numberOfPools++;
        userRegistered[msg.sender][_poolID] = true;

        // transfert tokens paid buy user to the contract address
        transfer(ownerAddress, _token);
    }

    function joinPool(string memory _poolID, uint256 _token) public {
        require(!userRegistered[msg.sender][_poolID], "Already registered");
        require(vPools[_poolID].registered, "Pool not registered");
        require(
            block.timestamp <= vPools[_poolID].endRegistrationTime,
            "Registration ended"
        );

        // user balance
        uint256 userBalance = balanceOf(msg.sender);
        require(_token <= userBalance, "Not enough tokens");

        // transfert tokens paid buy user to the owner address
        transfer(ownerAddress, _token);

        // set the pool status to registering
        poolState[_poolID] = State.Registering;

        // adding the new user to the pool
        vPools[_poolID].numberOfUsers++;
        vPools[_poolID].prize += _token;

        // rgister the new user
        users[msg.sender].userAddress = msg.sender;
        users[msg.sender].userPools.push(_poolID);
        users[msg.sender].numberOfPools++;
        userRegistered[msg.sender][_poolID] = true;
    }

    function voteForPool(string memory _poolID, uint256 _vote) public {
        require(
            block.timestamp > vPools[_poolID].endRegistrationTime &&
                block.timestamp <= vPools[_poolID].endTime,
            "still Registering or vote over"
        );
        require(userRegistered[msg.sender][_poolID], "Not registered");
        require(vPools[_poolID].registered, "Pool not registered");

        require(vPools[_poolID].numberOfUsers >= 3, "At leat 3 users");
        require(!vPools[_poolID].userVoted[msg.sender], "Already voted");
        require(
            _vote > 0 && _vote <= vPools[_poolID].numberOfUsers,
            "Incorrect vote"
        );

        // set the pool status to Voting
        poolState[_poolID] = State.Voting;

        vPools[_poolID].userVoted[msg.sender] = true;
        vPools[_poolID].userVote[msg.sender] = _vote;
        vPools[_poolID].voterAddresses[vPools[_poolID].numberOfVoters] = msg
            .sender;
        vPools[_poolID].numberOfVoters++;

        users[msg.sender].userVotes.push(_vote);
    }

    function rankDistribution(
        string memory _poolID,
        uint256[] memory _initialTab
    ) public pure returns (uint256[] memory) {
        uint256 p = _initialTab.length;
        uint256 k = _initialTab.length;

        // generate random numbers
        for (uint256 i = 0; i < k; i++) {
            uint256 randNum = (uint256(
                keccak256(abi.encodePacked(_poolID, _initialTab[i]))
            ) % p) + 1;

            uint256 tmp = _initialTab[randNum - 1];
            _initialTab[randNum - 1] = _initialTab[p - 1];
            _initialTab[p - 1] = tmp;
            p = p - 1;
        }

        return _initialTab;
    }

    function winningVotes(string memory _poolID)
        internal
        view
        returns (uint256[] memory)
    {
        // store users vote to a memory array and initialize the array Tab with zeros
        uint256[] memory userVotes;
        uint256[] memory Tab;
        for (uint256 i = 0; i < vPools[_poolID].numberOfVoters; i++) {
            Tab[i] = 0;
            userVotes[i] = vPools[_poolID].userVote[msg.sender];
        }

        for (uint256 i = 0; i < Tab.length; i++) {
            Tab[userVotes[i]]++;
        }

        // get the array of winners (two numbers may have same number of votes)
        uint256 votePosition = 0;
        uint256[] memory _winningVotes;

        for (uint256 i = 1; i < Tab.length; i++) {
            if (Tab[i] >= votePosition) {
                votePosition = i;
            }
        }

        uint256 index = 0;
        for (uint256 i = 1; i < Tab.length; i++) {
            if (Tab[i] == votePosition) {
                _winningVotes[index] = i;
                index++;
            }
        }

        return _winningVotes;
    }

    function withdrawPoolPrize(string memory _poolID, uint256 numberOfWinners)
        public
        payable
    {
        // the pool status must be 'END'
        require(
            block.timestamp > vPools[_poolID].endTime,
            "Still registring or Voting"
        );

        // require that the user has voted
        require(vPools[_poolID].userVoted[msg.sender], "have't voted");
        require(
            !vPools[_poolID].userWithdrawed[msg.sender],
            "Already withdrawed"
        );

        uint256 prize = vPools[_poolID].prize / numberOfWinners;

        vPools[_poolID].userWithdrawed[msg.sender] = true;

        // transfer tokens to the buyer
        _transfer(ownerAddress, msg.sender, prize);
    }

    function ElementOf(uint256 num, uint256[] memory Tab)
        internal
        pure
        returns (bool)
    {
        bool isElement;

        for (uint256 i = 0; i < Tab.length; i++) {
            if (num == Tab[i]) {
                isElement = true;
            }
        }

        return isElement;
    }

    function buyToken() public payable {
        // prevent the contract address to buy tokens
        require(
            msg.sender != ownerAddress,
            "ICO: buy token with contract address"
        );

        // require enough eth to buy tokens
        require(
            msg.value != 0 && msg.value < msg.sender.balance,
            "ICO: not enough eth"
        );

        // prevent buying tokens after all tokens have been sold out.
        require(raisedAmount + msg.value <= initialSupply, "ICO is over");

        // the amount to invest must be in range [minInvestment, maxInvestment]
        require(
            msg.value >= minInvestment && msg.value <= maxInvestment,
            "ICO: change amount"
        );

        // update state variables before calling external function (security).
        // Register the user only if buying the first time
        raisedAmount = add(raisedAmount, msg.value);

        if (!investors[msg.sender]) {
            listOfInvestors.push(msg.sender);
            investors[msg.sender] = true;
        }

        // amount of tokens to buy
        uint256 tokens = msg.value * rateOfChange;

        // send eth to the deposit account of the contract owner,
        // not to the contract address
        depositETHAddress.transfer(msg.value);

        // transfer tokens to the buyer
        _transfer(ownerAddress, msg.sender, tokens);
    }

    function stakeTokens(uint256 _amount) public payable {
        // get the user balance and require it to be greater than
        // the amount of tokens to stake
        uint256 balance = balanceOf(msg.sender);
        require(_amount <= balance, "Not enough tokens");

        if (!stakers[msg.sender].isStaking) {
            stakers[msg.sender].amountStaked = _amount;

            // transfer tokens to the contract
            _transfer(msg.sender, ownerAddress, _amount);

            // store the staking starting time
            stakers[msg.sender].startStakingTime = block.timestamp;

            // update the number of stakers
            stakers[msg.sender].numberOfStakers++;

            // update the user staking status
            stakers[msg.sender].isStaking = true;
        } else {
            //== Store the previous reward ==
            // elaspsed time
            uint256 timeDifference = block.timestamp -
                stakers[msg.sender].startStakingTime;

            // calculate the previous rewards
            uint256 rewards = (stakers[msg.sender].amountStaked) *
                ((0.00000000317 * 1 ether) * timeDifference);
            stakers[msg.sender].rewards = rewards;

            // get the amount of tokens already staked
            uint256 alreadyStaked = stakers[msg.sender].amountStaked;

            // add the new amount of tokens to stake to the amount
            // of tokens already staked
            stakers[msg.sender].amountStaked = alreadyStaked + _amount;

            // transfer tokens to the contract
            _transfer(msg.sender, ownerAddress, _amount);

            // store the staking starting time
            stakers[msg.sender].startStakingTime = block.timestamp;
        }
    }

    function unstakeTokens(uint256 _amount) public payable {
        // get the amount of token staked by the user and reqire it
        // to be greater than or equal to the amount of tokens to unstake
        // (without the rewards)
        uint256 stakedTokens = stakers[msg.sender].amountStaked;
        require(_amount <= stakedTokens, "Less token staked");

        // elapsed time
        uint256 timeDifference = block.timestamp -
            stakers[msg.sender].startStakingTime;

        // calculate the rewards related to the amount of
        // tokens to unstake
        uint256 rewards = _amount *
            ((0.00000000317 * 1 ether) * timeDifference);
        rewards = div(rewards, 1 ether);

        // add the rewards to the amount to unstake
        uint256 amountToUnstake = _amount + rewards;

        // Update the amount of staked tokens
        stakers[msg.sender].amountStaked = stakedTokens - _amount;

        // re-initialize the rewards
        stakers[msg.sender].rewards = 0;

        // if the user unstakes all token update the number of stakers
        if (_amount == stakedTokens) {
            stakers[msg.sender].numberOfStakers--;
            stakers[msg.sender].startStakingTime = 0;
        }

        // Transfer tokens to the user
        _transfer(ownerAddress, msg.sender, amountToUnstake);
    }

    receive() external payable {
        emit TokenPayed(msg.sender);
    }

    fallback() external payable {
        buyToken();
    }

    function getNumberOfVoters(string memory _poolID)
        public
        view
        returns (uint256)
    {
        return vPools[_poolID].numberOfVoters;
    }

    function getUserVote(address _address, string memory _poolID)
        public
        view
        returns (uint256)
    {
        return vPools[_poolID].userVote[_address];
    }

    function getVoterAddress(uint256 _index, string memory _poolID)
        public
        view
        returns (address)
    {
        return vPools[_poolID].voterAddresses[_index];
    }

    function getListOfUsers() public view returns (address[] memory) {
        return listOfInvestors;
    }

    function getOwnerAddress() public view returns (address) {
        return owner;
    }

    function getUserPools() public view returns (string[] memory) {
        return users[msg.sender].userPools;
    }

    function getPoolState(string memory _poolID) public view returns (State) {
        if (block.timestamp <= vPools[_poolID].endRegistrationTime) {
            return State.Registering;
        } else if (block.timestamp <= vPools[_poolID].endTime) {
            return State.Voting;
        } else {
            return State.End;
        }
    }

    function getPoolTimes(string memory _poolID)
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (
            vPools[_poolID].startRegistrationTime,
            vPools[_poolID].endRegistrationTime,
            vPools[_poolID].endTime
        );
    }

    function isUserRegistered(string memory _poolID)
        public
        view
        returns (bool)
    {
        return userRegistered[msg.sender][_poolID];
    }

    function hasUserVoted(string memory _poolID) public view returns (bool) {
        return vPools[_poolID].userVoted[msg.sender];
    }

    function getUserVotes() public view returns (uint256[] memory) {
        return users[msg.sender].userVotes;
    }

    function hasUserWithdrawed(string memory _poolID)
        public
        view
        returns (bool)
    {
        return vPools[_poolID].userWithdrawed[msg.sender];
    }
}
