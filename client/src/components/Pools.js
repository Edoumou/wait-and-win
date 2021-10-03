import React, { Component } from 'react';
import { Form, Button, Grid, Card } from 'semantic-ui-react';
import Formate from '../img/utils/Formate';
import './ERC20/style/App.css';

class Pools extends Component {
    state = {
        numberOfPools: 0,
        symbol: '',
        userTokens: 0,
        poolPrice: "",
        poolState: "",
        pools: [],
        poolStates: []
    }
    componentDidMount = async () => {
        // symbol
        let symbol = await this.props.WAWContract.methods.symbol().call();

        // get the amount of tokens owned by the currenut user
        let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account).call();
        userTokens = await this.props.web3.utils.fromWei(userTokens.toString());

        // get the total number of pools
        let numberOfPools = await this.props.WAWContract.methods.numberOfRegisteredPools()
            .call({ from: this.props.account });

        // get pools from the contract
        let pools = [];
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

            let pool = await this.props.WAWContract.methods.vPools(poolID)
                .call({ from: this.props.account });
            pools.push(pool);
        }

        this.setState({
            symbol,
            pools,
            userTokens,
            numberOfPools
        }, this.start);

        console.log("Pools =", this.state.pools);
    }

    start = async () => {
        setInterval(async () => {
            // check the pool status every 5 seconds;

            // get the total number of pools
            let numberOfPools = await this.props.WAWContract.methods.numberOfRegisteredPools()
                .call({ from: this.props.account });

            // get pools from the contract
            let poolStates = [];
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
                }
            }

            this.setState({
                poolStates
            });

        }, 1000);
    }

    onFormSubmit = async () => {

        // get the total number of pools
        let newNumberOfPools_0 = await this.props.WAWContract.methods.numberOfRegisteredPools()
            .call({ from: this.props.account });


        // get pools from the contract
        let pools_0 = [];
        let poolStates_0 = [];
        for (let i = 0; i < Number(newNumberOfPools_0); i++) {
            let numStr = String(i + 1);
            let poolID;
            if (numStr.length === 1) {
                poolID = `00${numStr}`;
            } else if (numStr.length === 2) {
                poolID = `0${numStr}`;
            } else {
                poolID = numStr;
            }

            let pool = await this.props.WAWContract.methods.vPools(poolID)
                .call({ from: this.props.account });

            pools_0.push(pool);

            // get the starting time for all states
            let poolTimes = await this.props.WAWContract.methods.getPoolTimes(poolID)
                .call({ from: this.props.account });

            // get the current time
            let currentTime = String(Date.now()).substring(0, 10);

            // get the status of the pool
            if (Number(currentTime) <= Number(poolTimes[1])) {
                poolStates_0.push("Registration");
            } else if (Number(currentTime) <= Number(poolTimes[2])) {
                poolStates_0.push("Voting");
            } else {
                poolStates_0.push("End");
            }
        }

        this.setState({ poolStates: poolStates_0 });

        // generate the pool ID from the ID of the last created pool
        let numberOfPools = await this.props.WAWContract.methods.numberOfRegisteredPools()
            .call({ from: this.props.account });
        numberOfPools = Number(numberOfPools) + 1;

        let numStr = String(numberOfPools);
        let poolID;
        if (numStr.length === 1) {
            poolID = `00${numStr}`;
        } else if (numStr.length === 2) {
            poolID = `0${numStr}`;
        } else {
            poolID = numStr;
        }

        // get the rate of change and convert the amount in wei
        //const rateOfChange = await this.props.WAWContract.methods.rateOfChange().call();
        const tokens = this.props.web3.utils.toWei((this.state.poolPrice).toString());

        // register the pool
        await this.props.WAWContract.methods.RegisterOrJoinPool(poolID, tokens)
            .send({ from: this.props.account });


        // get the current user new balance
        let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account)
            .call({ from: this.props.account });
        userTokens = this.props.web3.utils.fromWei(userTokens.toString());

        // updat pools with the new registered one to display it on the screen
        // get the total number of pools
        let newNumberOfPools = await this.props.WAWContract.methods.numberOfRegisteredPools()
            .call({ from: this.props.account });

        // get pools from the contract
        let pools = [];
        let poolStates = [];
        for (let i = 0; i < Number(newNumberOfPools); i++) {
            let numStr = String(i + 1);
            let poolID;
            if (numStr.length === 1) {
                poolID = `00${numStr}`;
            } else if (numStr.length === 2) {
                poolID = `0${numStr}`;
            } else {
                poolID = numStr;
            }

            let pool = await this.props.WAWContract.methods.vPools(poolID)
                .call({ from: this.props.account });

            pools.push(pool);

            // get the starting time for all states
            let poolTimes = await this.props.WAWContract.methods.getPoolTimes(poolID)
                .call({ from: this.props.account });

            // get the current time
            let currentTime = String(Date.now()).substring(0, 10);

            // get the status of the pool
            if (Number(currentTime) <= Number(poolTimes[1])) {
                poolStates.push("Registration");
            } else if (Number(currentTime) <= Number(poolTimes[2])) {
                poolStates.push("Voting");
            } else {
                poolStates.push("End");
            }

        }

        this.setState({
            pools,
            poolStates,
            numberOfPools: newNumberOfPools,
            userTokens: Formate(userTokens),
            poolPrice: ""
        });
    }

    joinPool = async (id, price) => {
        console.log("ID =", id);
        //console.log("PRIZE =", price);

        //============= get the pools state ============
        // get the total number of pools
        let newNumberOfPools_0 = await this.props.WAWContract.methods.numberOfRegisteredPools()
            .call({ from: this.props.account });

        // get pools from the contract
        let pools_0 = [];
        let poolStates_0 = [];
        for (let i = 0; i < Number(newNumberOfPools_0); i++) {
            let numStr = String(i + 1);
            let poolID;
            if (numStr.length === 1) {
                poolID = `00${numStr}`;
            } else if (numStr.length === 2) {
                poolID = `0${numStr}`;
            } else {
                poolID = numStr;
            }

            let pool = await this.props.WAWContract.methods.vPools(poolID)
                .call({ from: this.props.account });

            pools_0.push(pool);

            // get the starting time for all states
            let poolTimes = await this.props.WAWContract.methods.getPoolTimes(poolID)
                .call({ from: this.props.account });

            // get the current time
            let currentTime = String(Date.now()).substring(0, 10);

            // get the status of the pool
            if (Number(currentTime) <= Number(poolTimes[1])) {
                poolStates_0.push("Registration");
            } else if (Number(currentTime) <= Number(poolTimes[2])) {
                poolStates_0.push("Voting");
            } else {
                poolStates_0.push("End");
            }
        }

        this.setState({ poolStates: poolStates_0 });
        //==========================================


        // get the rate of change and convert the amount in wei
        //const rateOfChange = await this.props.WAWContract.methods.rateOfChange().call();
        //const tokens = this.props.web3.utils.toWei((price).toString());
        // register the pool
        await this.props.WAWContract.methods.joinPool(id, price)
            .send({ from: this.props.account });

        // get the current user new balance
        let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account)
            .call({ from: this.props.account });
        userTokens = this.props.web3.utils.fromWei(userTokens.toString());

        // update pools with the new registered one to display it on the screen
        // get the total number of pools
        let newNumberOfPools = await this.props.WAWContract.methods.numberOfRegisteredPools()
            .call({ from: this.props.account });

        // get pools from the contract
        let pools = [];
        let poolStates = [];
        for (let i = 0; i < Number(newNumberOfPools); i++) {
            let numStr = String(i + 1);
            let poolID;
            if (numStr.length === 1) {
                poolID = `00${numStr}`;
            } else if (numStr.length === 2) {
                poolID = `0${numStr}`;
            } else {
                poolID = numStr;
            }

            let pool = await this.props.WAWContract.methods.vPools(poolID)
                .call({ from: this.props.account });

            pools.push(pool);

            // get the starting time for all states
            let poolTimes = await this.props.WAWContract.methods.getPoolTimes(poolID)
                .call({ from: this.props.account });

            // get the current time
            let currentTime = String(Date.now()).substring(0, 10);

            // get the status of the pool
            if (Number(currentTime) <= Number(poolTimes[1])) {
                poolStates.push("Registration");
            } else if (Number(currentTime) <= Number(poolTimes[2])) {
                poolStates.push("Voting");
            } else {
                poolStates.push("End");
            }
        }

        this.setState({
            pools,
            poolStates,
            userTokens: Formate(userTokens)
        });

        console.log("Pool states =", this.state.poolStates);
    }

    render() {
        const web3 = this.props.web3;
        const nb = this.state.numberOfPools;
        let Tab = [];
        Tab = this.state.pools;
        return (
            <div className="ico">
                <h1>Already {this.state.numberOfPools} pools have been created</h1>
                <h3>Create a new pool or <strong>BET</strong> on a running pool</h3>
                <h3>
                    Your balance:
                    <span className='orange-color'>
                        <strong> {Formate(this.state.userTokens)} {this.state.symbol}</strong>
                    </span>
                </h3>
                <hr></hr>
                <div className='token-grid'>
                    <h2>Create a pool</h2>
                    <div className='pool-creation'>
                        <Grid textAlign="center">
                            <Form size='large' unstackable onSubmit={this.onFormSubmit}>
                                <Form.Group>
                                    <Form.Field
                                        placeholder="Pool price in WAW"
                                        control="input"
                                        width="10"
                                        name="pool Price"
                                        value={this.state.poolPrice}
                                        required
                                        onChange={e => this.setState({ poolPrice: e.target.value })}
                                    />
                                    <Button primary>
                                        Create Pool
                                    </Button>
                                </Form.Group>
                            </Form>
                        </Grid>

                    </div>

                </div>

                <div className="pool-cards">
                    {
                        { nb } !== 0 ?
                            <Grid stackable textAlign="center" divided>
                                {
                                    this.state.pools.map((res, index, arr) =>
                                        <div key={index} className="admin-card">
                                            {this.state.poolStates[index] === 'Registration' ?
                                                <Card onClick={() => this.joinPool(Tab[index].ID, Tab[index].price)}>
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
                                                            <span style={{ paddingRight: 5 }}>Pay</span>
                                                            <span style={{ color: 'orange' }}>
                                                                <strong>
                                                                    {
                                                                        Formate(web3.utils.fromWei(Tab[index].price.toString()))
                                                                    }
                                                                </strong>
                                                            </span>

                                                            <span style={{ paddingLeft: 5 }}>{this.state.symbol} to participate</span>
                                                        </Card.Description>
                                                    </Card.Content>
                                                    <Card.Content extra>
                                                        Pool status:
                                                        <strong style={{ paddingLeft: 5, color: 'maroon' }}>{this.state.poolStates[index]}</strong>
                                                    </Card.Content>
                                                </Card>
                                                :
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
                                                            <span style={{ paddingRight: 5 }}>Pay</span>
                                                            <span style={{ color: 'orange' }}>
                                                                <strong>
                                                                    {
                                                                        Formate(web3.utils.fromWei(Tab[index].price.toString()))
                                                                    }
                                                                </strong>
                                                            </span>

                                                            <span style={{ paddingLeft: 5 }}>{this.state.symbol} to participate</span>
                                                        </Card.Description>
                                                    </Card.Content>
                                                    <Card.Content extra>
                                                        Pool status:
                                                        <strong style={{ paddingLeft: 5, color: 'maroon' }}>{this.state.poolStates[index]}</strong>
                                                    </Card.Content>
                                                </Card>
                                            }
                                        </div>
                                    )
                                }
                            </Grid>
                            :
                            console.log("No pools found")
                    }
                </div>
            </div>
        );
    }
}

export default Pools;
