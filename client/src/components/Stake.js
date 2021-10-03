import React, { Component } from 'react';
import { Grid, Input, Button, Label, Header, Segment, TransitionablePortal } from 'semantic-ui-react';
import Formate from '../img/utils/Formate';
import './ERC20/style/App.css';

class Stake extends Component {
    state = {
        symbol: '',
        stake: null,
        amountToStake: 0,
        rewards: this.props.rewards,
        userTokens: 0,
        userStakedTokens: 0,
        open: false,
        amountToUnstake: 0
    }

    handleOpen = () => this.setState({ open: true });
    handleClose = () => this.setState({ open: false });

    componentDidMount = async () => {
        // symbol
        let symbol = await this.props.WAWContract.methods.symbol().call();

        // get the amount of tokens staked by the user and the time he started staking 
        let stake = await this.props.WAWContract.methods.stakers(this.props.account)
            .call({ from: this.props.account });

        let userStakedTokens = await this.props.web3.utils.fromWei(stake.amountStaked.toString());
        let startStakingTime = stake.startStakingTime;
        let currentTime = String(Date.now()).substring(0, 10);
        let timeDifference = Number(currentTime) - Number(startStakingTime);

        let rewards = Number(userStakedTokens) * (timeDifference * 0.00000000317);

        // get the amount of tokens owned by the user
        let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account).call();
        userTokens = await this.props.web3.utils.fromWei(userTokens.toString());

        console.log("Stake =", stake);

        this.setState({
            userTokens,
            symbol,
            rewards,
            userStakedTokens
        }, this.start);
    }

    start = async () => {
        setInterval(() => {
            // let rewards = this.state.rewards + 0.00000000317;
            let rewards = this.state.rewards + this.state.userStakedTokens * 0.00000000317;

            this.setState({ rewards });
        }, 1000);
    }

    onButtonClick = async () => {
        console.log("Amount to stake =", this.state.amountToStake);
        let amountTostake = this.props.web3.utils.toWei(this.state.amountToStake.toString());

        // stake the amount of tokens input in the form
        await this.props.WAWContract.methods.stakeTokens(amountTostake)
            .send({ from: this.props.account });

        // get the amount of tokens staked by the user
        let stake = await this.props.WAWContract.methods.stakers(this.props.account)
            .call({ from: this.props.account });

        // get the amount of tokens owned by the user
        let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account).call();
        userTokens = await this.props.web3.utils.fromWei(userTokens.toString());

        // start the rewards
        let userStakedTokens = await this.props.web3.utils.fromWei(stake.amountStaked.toString());
        let rewards = this.state.rewards + Number(userStakedTokens) * 0.00000000317;

        this.setState({
            userTokens,
            rewards,
            userStakedTokens,
            amountToStake: ''
        })
    }

    onUnstake = async () => {
        // convert the amount of tokens to unstake to wei
        let amountToUnstake = this.props.web3.utils.toWei(this.state.amountToUnstake.toString());
        console.log("Anmount account =", typeof this.state.amountToUnstake);
        console.log("Anmount account =", this.state.amountToUnstake);

        if (this.state.amountToUnstake === 0) {
            this.setState({
                open: false
            })
        } else {
            // unstake tokens
            await this.props.WAWContract.methods.unstakeTokens(amountToUnstake)
                .send({ from: this.props.account });

            // get the amount of tokens staked by the user and the time he started staking 
            let stake = await this.props.WAWContract.methods.stakers(this.props.account)
                .call({ from: this.props.account });

            let userStakedTokens = await this.props.web3.utils.fromWei(stake.amountStaked.toString());
            let startStakingTime = stake.startStakingTime;
            let currentTime = String(Date.now()).substring(0, 10);
            let timeDifference = Number(currentTime) - Number(startStakingTime);

            let rewards = Number(userStakedTokens) * (timeDifference * 0.00000000317);

            // get the amount of tokens owned by the user
            let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account).call();
            userTokens = await this.props.web3.utils.fromWei(userTokens.toString());


            this.setState({
                rewards,
                userTokens,
                userStakedTokens,
                open: false
            })
        }
    }

    render() {
        const { open } = this.state

        return (
            <div className="ico">
                <div className="token-info">
                    <h1>
                        Stake your
                        <span className='orange-color'>
                            <strong> {this.state.symbol}</strong>
                        </span> and earn rewards
                    </h1>
                    <h3>
                        Annual percentage rate (APR):
                        <span className='orange-color'>
                            <strong> 10% </strong>
                        </span>
                    </h3>
                    <h3>
                        Your balance:
                        <span className='orange-color'>
                            <strong> {Formate(this.state.userTokens)} {this.state.symbol}</strong>
                        </span>
                    </h3>
                </div>
                <hr></hr>
                <div className='stake-grid'>
                    <Grid columns={2} stackable textAlign='left'>
                        <Grid.Row>
                            <Grid.Column width={1}></Grid.Column>
                            <Grid.Column width={7} textAlign='center'>
                                <h2>Amount of {this.state.symbol} staked</h2>
                                <br></br>
                                <strong>
                                    <span className='red-color'>
                                        {Formate(this.state.userStakedTokens)}
                                    </span>
                                </strong>
                            </Grid.Column>
                            <Grid.Column width={7} textAlign='center'>
                                <h2>Your {this.state.symbol} rewards</h2>
                                <br></br>
                                <strong>
                                    <span className='green-color'>
                                        {this.state.rewards.toFixed(9)}
                                    </span>
                                </strong>
                            </Grid.Column>
                            <Grid.Column width={1}></Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
                <div className="stake-h2">
                    <h2>Stake your tokens</h2>
                </div>
                <div className='stake-input'>
                    <Input fluid focus size='small' labelPosition='right' type='text' placeholder='amount to stake'>
                        <Label basic>Amount</Label>
                        <input
                            value={this.state.amountToStake}
                            onChange={e => { this.setState({ amountToStake: e.target.value }) }}
                        />
                        <Label>{this.state.symbol}</Label>
                    </Input>
                </div>
                <br></br>
                <div className='stake-button'>
                    <Button fluid size='large' color='orange' onClick={this.onButtonClick}>
                        Stake
                    </Button>
                </div>
                <h2>Click to UN-STAKE your tokens</h2>
                <div className='unstake-button'>
                    <Grid stackable columns={2}>
                        <Grid.Column>
                            <Button
                                fluid
                                size='large'
                                content='Un-Stake'
                                disabled={open}
                                color='grey'
                                onClick={this.handleOpen}
                                trigger={
                                    <Button
                                        content={open ? 'Close Portal' : 'Open Portal'}
                                        negative={open}
                                        positive={!open}
                                    />
                                }
                            />

                            <TransitionablePortal onClose={this.handleClose} open={open}>
                                <Segment
                                    style={{
                                        left: '40%',
                                        position: 'fixed',
                                        top: '50%',
                                        zIndex: 1000,
                                    }}
                                >
                                    <Header textAlign="center">You are about to Un-stake your tokens</Header>
                                    <Header textAlign="center">
                                        You have
                                        <span className='red-color'>
                                            {Formate(this.state.userStakedTokens)}
                                        </span>
                                        {this.state.symbol} staked
                                    </Header>
                                    <Button
                                        fluid
                                        size='large'
                                        content='Keep staking'
                                        positive
                                        onClick={this.handleClose}
                                    />
                                    <Header textAlign="center">Enter the amount of tokens to Unstake</Header>
                                    <Header></Header>
                                    <Input labelPosition='right' type='text' placeholder='Amount'>
                                        <Label basic>Amount</Label>
                                        <input
                                            onChange={e => this.setState({ amountToUnstake: e.target.value })}
                                        />
                                        <Label>{this.state.symbol}</Label>
                                    </Input>
                                    <Header></Header>
                                    <Button
                                        fluid
                                        size='large'
                                        content='Un-Stake'
                                        negative
                                        onClick={this.onUnstake}
                                    />
                                </Segment>
                            </TransitionablePortal>
                        </Grid.Column>
                    </Grid>
                </div>
            </div>
        );
    }
}

export default Stake;
