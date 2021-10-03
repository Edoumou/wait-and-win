import React, { Component } from 'react';
import { Grid, Input, Button, Label, Table } from 'semantic-ui-react';
import Formate from '../../img/utils/Formate';
import FormateAddress from '../../utils/FomateAddress';
import './style/App.css';

class BuyTokens extends Component {
    state = {
        account: this.props.account,
        name: '',
        symbole: '',
        totalSupply: 0,
        owner: '',
        tokens: 0,
        userTokens: 0,
        balanceETH: 0,
        balanceRPT: 0,
        contractBalance: 0,
        investors: [],
        investorsBalance: []
    }

    componentDidMount = async () => {
        // token name and symbol
        let name = await this.props.WAWContract.methods.name().call();
        let symbol = await this.props.WAWContract.methods.symbol().call();

        // convert the total supply from wei to eth
        let totalSupply = await this.props.WAWContract.methods.totalSupply().call();
        totalSupply = this.props.web3.utils.fromWei(totalSupply.toString());

        // get the amount of tokens remaining for sale
        let owner = await this.props.WAWContract.methods.getOwnerAddress().call();
        let balanceOfOwner = await this.props.WAWContract.methods.balanceOf(owner).call();
        balanceOfOwner = await this.props.web3.utils.fromWei(balanceOfOwner.toString());

        // get the amount of tokens owned by the currenut user
        let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account).call();
        userTokens = await this.props.web3.utils.fromWei(userTokens.toString());
        this.setState({ userTokens });

        // get eth balance of the user
        await this.props.web3.eth.getBalance(this.props.account, (err, balance) => {
            if (!err) {
                this.setState({
                    balanceETH: Formate(this.props.web3.utils.fromWei(balance, 'ether'))
                });
            }
        });


        // get investors and their balances
        let investors = await this.props.WAWContract.methods.getListOfUsers().call();
        let investorsBalance = []
        for (let i = 0; i < investors.length; i++) {
            let balance = await this.props.WAWContract.methods.balanceOf(investors[i]).call();
            balance = this.props.web3.utils.fromWei(balance.toString());
            investorsBalance.push(Formate(balance));
        }

        this.setState({
            name,
            symbol,
            owner,
            totalSupply: Formate(totalSupply),
            contractBalance: Formate(balanceOfOwner),
            investors,
            investorsBalance
        });

        await this.getAccount();

        this.getAccount();
    }

    getAccount = async () => {
        if (this.props.web3 !== null || this.props.web3 !== undefined) {
            await window.ethereum.on('accountsChanged', async (accounts) => {
                let tokens = await this.props.WAWContract.methods.balanceOf(this.props.account).call();
                tokens = await this.props.web3.utils.fromWei(tokens.toString());
                this.setState({ account: accounts[0], userTokens: Formate(tokens) });
            });
        }
    }

    onButtonClick = async () => {
        // get the rate of change from the contract and convert the amount
        // of WAW to buy to ETH (wei)
        const rateOfChange = await this.props.WAWContract.methods.rateOfChange().call();
        const ethToSend = this.props.web3.utils.toWei((this.state.tokens / rateOfChange).toString());

        await this.props.WAWContract.methods.buyToken()
            .send({ from: this.props.account, value: ethToSend });

        let userTokens = await this.props.WAWContract.methods.balanceOf(this.props.account).call();
        userTokens = await this.props.web3.utils.fromWei(userTokens.toString());

        // get the amount of tokens remaining for sale
        this.setState({ userTokens })

        // call the contract to get the new balance of the owner
        // and send it back to header component to update  the state
        let owner = await this.props.WAWContract.methods.getOwnerAddress().call();
        let balanceOfOwner = await this.props.WAWContract.methods.balanceOf(owner).call();
        balanceOfOwner = await this.props.web3.utils.fromWei(balanceOfOwner.toString());

        // update the list of investors and their balnces
        // get investors and their balances
        let investors = await this.props.WAWContract.methods.getListOfUsers().call();
        let investorsBalance = []
        for (let i = 0; i < investors.length; i++) {
            let balance = await this.props.WAWContract.methods.balanceOf(investors[i]).call();
            balance = this.props.web3.utils.fromWei(balance.toString());
            investorsBalance.push(Formate(balance));
        }

        this.setState({
            contractBalance: Formate(balanceOfOwner),
            investors,
            investorsBalance
        });

        this.setState({ tokens: 0 });
    }

    render() {
        return (
            <div className="ico">
                <div className="token-info">
                    <h1>Welcome to {this.state.name} plateform</h1>
                    <h3>Total Supply: {this.state.totalSupply} </h3>
                    <h3>Token available for sale: {this.state.contractBalance}</h3>
                </div>
                <hr></hr>
                <div className='token-grid'>
                    <Grid columns={3} celled stackable textAlign='left'>
                        <Grid.Row>
                            <Grid.Column width={3}>
                                <h2>Account details</h2>
                                <br></br>
                                {FormateAddress(this.state.account)}
                                <br></br>
                                {this.state.balanceETH} ETH
                                <br></br>
                                {Formate(this.state.userTokens)} {this.state.symbol}
                            </Grid.Column>
                            <Grid.Column textAlign='center' width={5}>
                                <h2>Buy tokens</h2>
                                <br></br>
                                Token price: <strong>0.001 ETH</strong>
                                <br></br>
                                min 10 - 10000 max
                                <br></br>
                                <div className='token-buy-input'>
                                    <Input fluid focus size='small' labelPosition='right' type='text' placeholder='min: 10 - max: 10,000'>
                                        <Label basic>Amount</Label>
                                        <input
                                            value={this.state.tokens}
                                            onChange={e => { this.setState({ tokens: e.target.value }) }}
                                        />
                                        <Label>{this.state.symbol}</Label>
                                    </Input>
                                </div>
                                <br></br>
                                <Button color='orange' onClick={this.onButtonClick}>
                                    Buy
                                </Button>
                            </Grid.Column>
                            <Grid.Column textAlign='center' width={8}>
                                <h2>List of investors</h2>
                                <br></br>
                                <Table celled stackable fixed>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Investor</Table.HeaderCell>
                                            <Table.HeaderCell textAlign='right'>{this.props.symbol} Balance</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {
                                            this.state.investors.map((res, index, arr) =>
                                                <Table.Row key={index}>
                                                    {
                                                        this.state.investors[index] === this.state.account ?
                                                            <Table.Cell positive>{this.state.investors[index]}</Table.Cell>
                                                            :
                                                            <Table.Cell>{this.state.investors[index]}</Table.Cell>
                                                    }
                                                    {
                                                        this.state.investors[index] === this.state.account ?
                                                            <Table.Cell positive textAlign='right'>{this.state.investorsBalance[index]}</Table.Cell>
                                                            :
                                                            <Table.Cell textAlign='right'>{this.state.investorsBalance[index]}</Table.Cell>
                                                    }
                                                </Table.Row>
                                            )
                                        }
                                    </Table.Body>
                                </Table>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>

            </div>
        );
    }
}

export default BuyTokens;
