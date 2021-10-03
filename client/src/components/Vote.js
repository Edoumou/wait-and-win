import React, { Component } from 'react';
import { Form, Button, Input, Grid, Card } from 'semantic-ui-react';
import Formate from '../img/utils/Formate';
import WinningVotes from '../utils/WinnigVotes';
import ElementOf from '../utils/ElementOf';
import './ERC20/style/App.css';

class Vote extends Component {
    state = {
        numberOfPools: 0,
        symbol: '',
        userTokens: 0,
        voted: [],
        vote: "",
        votes: [],
        poolPrice: "",
        poolState: "",
        poolStates: [],
        pools: [],
        voteCount: 0,
        usersAddress: [],
        usersVote: [],
        winningVotes: [],
        rankDistribution: [],
        isElementOf: [],
        withdrawed: [],
        k: 0
    }

    componentDidMount = async () => {
        /* let rankDistribution = await this.props.WAWContract.methods.rankDistribution('001', Date.now(), [1, 2, 3, 4, 5])
            .call({ from: this.props.account });
        console.log("Rank dist =", rankDistribution);
        console.log("Type of Date =", typeof Date.now()); */


        // symbol
        let symbol = await this.props.WAWContract.methods.symbol().call();

        // get the amount of tokens owned by the currenut user
        let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account)
            .call({ from: this.props.account });
        userTokens = await this.props.web3.utils.fromWei(userTokens.toString());

        // get user pools
        let userPools = await this.props.WAWContract.methods.getUserPools()
            .call({ from: this.props.account });

        let pools = [];
        let votes = [];
        let withdrawed = [];
        for (let i = 0; i < Number(userPools.length); i++) {
            // user pool
            let pool = await this.props.WAWContract.methods.vPools(userPools[i])
                .call({ from: this.props.account });
            pools.push(pool);

            // user vote
            let vote = await this.props.WAWContract.methods.getUserVote(this.props.account, userPools[i])
                .call({ from: this.props.account });
            votes.push(vote);

            // check if user withdrawed
            let numStr = String(i + 1);
            let poolID;
            if (numStr.length === 1) {
                poolID = `00${numStr}`;
            } else if (numStr.length === 2) {
                poolID = `0${numStr}`;
            } else {
                poolID = numStr;
            }

            let _withdrawed = await this.props.WAWContract.methods.hasUserWithdrawed(poolID)
                .call({ from: this.props.account });

            withdrawed.push(_withdrawed);
        }

        let numberOfPools = userPools.length;

        this.setState({
            symbol,
            userTokens,
            pools,
            votes,
            numberOfPools,
            withdrawed
        }, this.start);
    }

    start = async () => {
        //setInterval(async () => {
        // check the pool status every 5 seconds;

        // get the total number of pools
        let numberOfPools = await this.props.WAWContract.methods.numberOfRegisteredPools()
            .call({ from: this.props.account });

        // get pools from the contract
        let poolStates = [];
        let usersAddress = [];
        let winningVotes = [];
        let rankDistribution_0 = [];
        let rankDistribution = [];
        let rankDistribution_tmp = [];
        let isElementOf = [];
        //let k = [];
        for (let i = 0; i < Number(numberOfPools); i++) {
            let numStr = String(i + 1);
            let poolID;
            if (numStr.length === 1) {
                poolID = `00${numStr}`;
            } else if (numStr.length === 2) {
                poolID = `0${numStr}`;
            } else {
                poolID = numStr;
            }

            // get the starting time for all states
            let poolTimes = await this.props.WAWContract.methods.getPoolTimes(poolID)
                .call({ from: this.props.account });

            // get the current time
            let currentTime = String(Date.now()).substring(0, 10);

            if (Number(currentTime) <= Number(poolTimes[1])) {
                poolStates.push("Registration");
            } else if (Number(currentTime) <= Number(poolTimes[2])) {
                poolStates.push("Voting");
            } else {
                poolStates.push("End");

                // get the number of voters
                let numberOfVoters = await this.props.WAWContract.methods.getNumberOfVoters(poolID)
                    .call({ from: this.props.account });

                let usersVote = [];

                // get voters address and their vote
                for (let j = 0; j < numberOfVoters; j++) {
                    let address = await this.props.WAWContract.methods.getVoterAddress(j, poolID)
                        .call({ from: this.props.account });

                    let vote = await this.props.WAWContract.methods.getUserVote(address, poolID)
                        .call({ from: this.props.account });

                    usersAddress.push(address);
                    usersVote.push(vote);

                    rankDistribution_0.push(j + 1);
                }

                let winningVote = WinningVotes(usersVote);
                winningVotes.push(winningVote);

                rankDistribution_tmp = await this.props.WAWContract.methods
                    .rankDistribution(poolID, rankDistribution_0)
                    .call({ from: this.props.account });

                // reinitialize the array rankDistribution_0
                rankDistribution_0 = [];
            }

            // get users rank generated randomly
            currentTime = String(Date.now()).substring(0, 10);
            if (Number(currentTime) > Number(poolTimes[2])) {
                // get the number of voters
                let numberOfVoters = await this.props.WAWContract.methods.getNumberOfVoters(poolID)
                    .call({ from: this.props.account });

                for (let k = 0; k < numberOfVoters; k++) {
                    if (usersAddress[k] === this.props.account) {
                        rankDistribution.push(rankDistribution_tmp[k]);
                    }
                }
            }

            if (Number(currentTime) > Number(poolTimes[2]) && winningVotes[i] !== undefined) {
                // check if the user rank is equal to one of the winning votes
                let isWinningVote = ElementOf(rankDistribution[i], winningVotes[i]);
                isElementOf.push(isWinningVote);
            }

        }

        this.setState({
            poolStates,
            usersAddress,
            winningVotes,
            rankDistribution,
            isElementOf
        });

        //}, 1000);
    }

    Vote = async (index, id, price) => {
        console.log("INDEX =", index);
        console.log("ID =", id);
        console.log("PRICE =", price);
        console.log("VOTE =", this.state.vote);

        // vote for the pool `id`
        await this.props.WAWContract.methods.voteForPool(id, this.state.vote)
            .send({ from: this.props.account });

        // get user pools
        let userPools = await this.props.WAWContract.methods.getUserPools()
            .call({ from: this.props.account });

        let pools = [];
        let votes = [];
        let poolStates = [];
        for (let i = 0; i < Number(userPools.length); i++) {
            // user pool
            let pool = await this.props.WAWContract.methods.vPools(userPools[i])
                .call({ from: this.props.account });
            pools.push(pool);

            // user vote
            let vote = await this.props.WAWContract.methods.getUserVote(this.props.account, userPools[i])
                .call({ from: this.props.account });
            votes.push(vote);

            // pool state
            let poolState = await this.props.WAWContract.methods.getPoolState(userPools[i])
                .call({ from: this.props.account });

            if (poolState === '0') {
                poolStates.push("Registration");
            } else if (poolState === '1') {
                poolStates.push("Voting");
            } else {
                poolStates.push("End");
            }
        }

        this.setState({
            pools,
            votes,
            poolStates
        });
    }

    Withdraw = async (id, winningVotes) => {
        console.log("ID =", id);
        let numberOfWinners = winningVotes.length;
        console.log("Number of winners =", numberOfWinners);

        await this.props.WAWContract.methods.withdrawPoolPrize(id, numberOfWinners)
            .send({ from: this.props.account });

        // get the amount of tokens owned by the currenut user
        let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account)
            .call({ from: this.props.account });
        userTokens = await this.props.web3.utils.fromWei(userTokens.toString());

        // get user pools
        let userPools = await this.props.WAWContract.methods.getUserPools()
            .call({ from: this.props.account });

        let withdrawed = [];
        for (let i = 0; i < Number(userPools.length); i++) {
            let numStr = String(i + 1);
            let poolID;
            if (numStr.length === 1) {
                poolID = `00${numStr}`;
            } else if (numStr.length === 2) {
                poolID = `0${numStr}`;
            } else {
                poolID = numStr;
            }

            let _withdrawed = await this.props.WAWContract.methods.hasUserWithdrawed(poolID)
                .call({ from: this.props.account });

            withdrawed.push(_withdrawed);
        }

        this.setState({
            userTokens,
            withdrawed
        });
    }

    render() {
        const web3 = this.props.web3;
        const nb = this.state.numberOfPools;
        let Tab = [];
        Tab = this.state.pools;
        return (
            <div className="ico">
                <h1>You are enrolled to {this.state.numberOfPools} pools</h1>
                <h3>Your vote must be a number from 1 to the total number of users in the pool</h3>
                <h3>
                    Your balance:
                    <span className='orange-color'>
                        <strong> {Formate(this.state.userTokens)} {this.state.symbol}</strong>
                    </span>
                </h3>
                <hr></hr>

                <div className="pool-cards">
                    {
                        { nb } !== 0 ?
                            <Grid stackable textAlign="center" divided>
                                {
                                    this.state.pools.map((res, index, arr) =>
                                        <div key={index} className="admin-card">
                                            <Card>
                                                <Card.Content textAlign="center">
                                                    <Card.Header>

                                                        <span style={{ color: 'red' }}>
                                                            {
                                                                Formate(web3.utils.fromWei(Tab[index].prize.toString()))
                                                            }
                                                        </span>

                                                        <span style={{ paddingLeft: 5 }}>{this.state.symbol}</span>
                                                    </Card.Header>
                                                    <Card.Meta>
                                                        {Tab[index].numberOfUsers} users
                                                    </Card.Meta>
                                                    <Card.Description>
                                                        <strong>
                                                            POOL - {Tab[index].ID}
                                                        </strong>
                                                        <br></br>
                                                        <br></br>
                                                        {
                                                            this.state.poolStates[index] === 'End' ?
                                                                <div>
                                                                    Your vote: <span style={{ color: 'green' }}><strong>{this.state.votes[index]}</strong></span>
                                                                    <br></br>
                                                                    Your rank:
                                                                    <span style={{ color: 'blue', paddingLeft: 5 }}>
                                                                        <strong>
                                                                            {this.state.rankDistribution[index]}
                                                                        </strong>
                                                                    </span>
                                                                    <br></br>
                                                                    Winning votes:
                                                                    <br></br>
                                                                    <span style={{ color: 'red' }}>
                                                                        {
                                                                            this.state.winningVotes[index] !== undefined ?
                                                                                <strong>
                                                                                    {this.state.winningVotes[index].join(', ')}
                                                                                </strong>
                                                                                :
                                                                                <strong>
                                                                                    0
                                                                                </strong>
                                                                        }

                                                                    </span>
                                                                </div>
                                                                :
                                                                <div>
                                                                    <span style={{ paddingRight: 5 }}>You paid</span>
                                                                    <span style={{ color: 'orange' }}>
                                                                        <strong>
                                                                            {
                                                                                Formate(web3.utils.fromWei(Tab[index].price.toString()))
                                                                            }
                                                                        </strong>
                                                                    </span>
                                                                    <span style={{ paddingLeft: 5 }}>{this.state.symbol} </span>
                                                                    <br></br>
                                                                    Already voted: <span style={{ color: 'black' }}>
                                                                        <strong>
                                                                            {Tab[index].numberOfVoters}
                                                                        </strong>
                                                                    </span>
                                                                    <br></br>
                                                                    <br></br>
                                                                    Your vote: <span style={{ color: 'green' }}><strong>{this.state.votes[index]}</strong></span>
                                                                </div>
                                                        }
                                                    </Card.Description>
                                                </Card.Content>
                                                <Card.Content extra>
                                                    <div className='pool-creation'>
                                                        <Grid textAlign="center">
                                                            {
                                                                this.state.poolStates[index] === 'Registration' || this.state.poolStates[index] === 'Voting' ?
                                                                    <Form size='large' unstackable>
                                                                        <Form.Group unstackable>
                                                                            <Input size='small' type='text' placeholder='your vote'>
                                                                                <input
                                                                                    value={this.state.vote}
                                                                                    onChange={e => { this.setState({ vote: e.target.value }) }}
                                                                                />
                                                                            </Input>
                                                                            <span style={{ paddingLeft: 5 }}>
                                                                                <Button size='large' color='pink' fluid onClick={() => this.Vote(index, Tab[index].ID, Tab[index].price)}>
                                                                                    Vote
                                                                                </Button>
                                                                            </span>
                                                                        </Form.Group>
                                                                    </Form>
                                                                    :

                                                                    this.state.isElementOf[index] ?
                                                                        <Form size='large' unstackable>
                                                                            <Form.Group>
                                                                                {
                                                                                    this.state.withdrawed[index] ?
                                                                                        <Button disabled positive fluid size='large' primary>
                                                                                            Withdraw successful
                                                                                        </Button>
                                                                                        :
                                                                                        <Button positive fluid size='large' primary onClick={() => this.Withdraw(Tab[index].ID, this.state.winningVotes[index])}>
                                                                                            Withdraw your <span style={{ paddingLeft: 5 }}>{this.state.symbol}</span>
                                                                                        </Button>
                                                                                }
                                                                            </Form.Group>
                                                                        </Form>
                                                                        :
                                                                        <Form size='large' unstackable>
                                                                            <Form.Group>
                                                                                <Button disabled negative fluid size='large'>
                                                                                    You didn't win this time
                                                                                </Button>
                                                                            </Form.Group>
                                                                        </Form>

                                                            }
                                                        </Grid>
                                                    </div>
                                                </Card.Content>
                                            </Card>
                                        </div>
                                    )
                                }
                            </Grid>
                            :
                            console.log("No pools found")
                    }
                </div>
            </div >
        );
    }
}

export default Vote;
