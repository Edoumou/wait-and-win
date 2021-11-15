import React, { Component } from "react";
import web3Connection from './web3Connection';
import AuthenticationContract from "./AuthenticationContract";
import ERC20Contract from './ERC20Contract';
import ERC721Contract from "./ERC721Contract";
import Formate from './utils/Formate';
import 'semantic-ui-css/semantic.min.css';
import { Menu, Divider, Label } from "semantic-ui-react";
import { BrowserRouter, Switch, Route, Link, Redirect } from 'react-router-dom';
import Home from './components/Home';
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn"
import SignOut from "./components/SignOut";
import UserAccount from './components/UserAccount';
import BuyTokens from "./components/ERC20/BuyTokens";
import BuyNFT from "./components/NFT/BuyNFT";
import NftAuction from "./components/NFT/NftAuction";
import Stake from "./components/Stake";
import Pools from "./components/Pools";
import Vote from "./components/Vote";
import FormateAddress from "./utils/FomateAddress";
import "./App.css";

class App extends Component {
  state = {
    web3: null,
    account: null,
    AuthContract: null,
    WAWContract: null,
    NFTContract: null,
    balance: null,
    activeItem: 'home',
    signedUp: false,
    loggedIn: false,
    username: '',
    imageName: '',
    imageSymbol: '',
    numberOfMintedImages: 0
  };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name, color: 'teal' })

  componentDidMount = async () => {
    try {
      // web3
      const web3 = await web3Connection();
      // contracts
      const AuthContract = await AuthenticationContract(web3);
      const WAWContract = await ERC20Contract(web3);
      const NFTContract = await ERC721Contract(web3);

      console.log("NFT contract", NFTContract);

      const accounts = await web3.eth.getAccounts();

      // get the amount of tokens staked by the user
      let stake = await WAWContract.methods.stakers(accounts[0])
        .call({ from: accounts[0] });

      this.setState({
        web3,
        AuthContract,
        WAWContract,
        NFTContract,
        account: accounts[0],
        rewards: Number(await web3.utils.fromWei(stake.rewards.toString()))
      },
        this.start
      );
    } catch (error) {
      alert(
        `Failed to load web3`,
      );
      console.error(error);
    }

    await this.getAccount();
  };

  start = async () => {
    await this.getAccount();
    const { web3, account, contract, NFTContract } = this.state;

    this.setState({
      imageName: await NFTContract.methods.name().call(),
      imageSymbol: await NFTContract.methods.symbol().call(),
      numberOfMintedImages: await NFTContract.methods.counter().call()
    })

    console.log("web3 =", web3);
    console.log("Contract =", contract);
    console.log("Acoount =", account);
  };

  getAccount = async () => {
    if (this.state.web3 !== null || this.state.web3 !== undefined) {
      await window.ethereum.on('accountsChanged', async (accounts) => {
        this.setState({
          account: accounts[0],
          loggedIn: false
        });

        this.state.web3.eth.getBalance(accounts[0], (err, balance) => {
          if (!err) {
            this.setState({ balance: Formate(this.state.web3.utils.fromWei(balance, 'ether')) });
          }
        });
      });
    }
  }

  accountCreated = async (signedUp) => {
    this.setState({ signedUp });
  }

  userSignedIn = async (loggedIn, username) => {
    this.setState({ loggedIn, username });
  }

  loggedOut = async (loggedIn) => {
    this.setState({ loggedIn });
  }

  render() {
    const { activeItem, color } = this.state;

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="main-page">
          <BrowserRouter>
            <div className="home-nav">
              <Menu stackable inverted secondary size='large'>
                <Menu.Item
                  name='home'
                  color={color}
                  active={activeItem === 'home'}
                  onClick={this.handleItemClick}
                  as={Link}
                  to='/'
                />
                <Menu.Item
                  name='help'
                  color={color}
                  active={activeItem === 'help'}
                  onClick={this.handleItemClick}
                  as={Link}
                  to='/help'
                />
                {
                  this.state.loggedIn ?
                    <Menu.Item
                      position='right'
                      name='user account'
                      color={color}
                      active={activeItem === 'user account'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/user-account'
                    />
                    :
                    console.log('')
                }
                {
                  !this.state.loggedIn ?
                    <Menu.Item
                      position='right'
                      name='sign in'
                      color={color}
                      active={activeItem === 'sign in'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/sign-in'
                    />
                    :
                    console.log('')
                }

                {
                  this.state.loggedIn ?
                    <Menu.Item
                      name='buy tokens'
                      color={color}
                      active={activeItem === 'buy tokens'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/buy-tokens'
                    />
                    :
                    console.log('')
                }

                {
                  this.state.loggedIn ?
                    <Menu.Item
                      name='stake'
                      color={color}
                      active={activeItem === 'stake'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/stake'
                    />
                    :
                    console.log('')
                }

                {
                  this.state.loggedIn ?
                    <Menu.Item
                      name='NFT'
                      color={color}
                      active={activeItem === 'NFT'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/buy-nft'
                    />
                    :
                    console.log('')
                }

                {
                  this.state.loggedIn ?
                    <Menu.Item
                      name='NFT Auction'
                      color={color}
                      active={activeItem === 'NFT Auction'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/nft-auction'
                    />
                    :
                    console.log('')
                }

                {
                  this.state.loggedIn ?
                    <Menu.Item
                      name='pools'
                      color={color}
                      active={activeItem === 'pools'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/pools'
                    />
                    :
                    console.log('')
                }

                {
                  this.state.loggedIn ?
                    <Menu.Item
                      name='vote'
                      color={color}
                      active={activeItem === 'vote'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/vote'
                    />
                    :
                    console.log('')
                }

                {
                  this.state.loggedIn ?
                    <Menu.Item
                      name='sign out'
                      color='red'
                      active={activeItem === 'sign out'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/sign-out'
                    />
                    :
                    <Menu.Item
                      name='sign up'
                      color={color}
                      active={activeItem === 'sign up'}
                      onClick={this.handleItemClick}
                      as={Link}
                      to='/sign-up'
                    />
                }
                {
                  this.state.loggedIn ?
                    <Menu.Item>
                      <Label size='large' color='purple' horizontal>
                        @{this.state.username}: {FormateAddress(this.state.account)}
                      </Label>
                    </Menu.Item>
                    :
                    console.log('')
                }
              </Menu>
            </div>
            <Divider inverted />

            <Switch>
              <Route exact path='/' >
                <Home />
              </Route>
              <Route path='/help' >
                Help page
              </Route>
              {
                this.state.loggedIn ?
                  <Route path='/user-account' >
                    <UserAccount
                      web3={this.state.web3}
                      account={this.state.account}
                      username={this.state.username}
                      WAWContract={this.state.WAWContract}
                    />
                  </Route>
                  :
                  <Route path='/user-account'>
                    You have been logged out
                  </Route>
              }
              {
                <Route path='/sign-in' >
                  {
                    this.state.loggedIn ?
                      <Redirect to='/user-account' />
                      :
                      <SignIn
                        web3={this.state.web3}
                        contract={this.state.AuthContract}
                        account={this.state.account}
                        signedUp={this.state.signedUp}
                        userSignedIn={this.userSignedIn}
                      />
                  }
                </Route>
              }

              {
                this.state.loggedIn ?
                  <Route path='/buy-tokens' >
                    <BuyTokens
                      web3={this.state.web3}
                      account={this.state.account}
                      username={this.state.username}
                      WAWContract={this.state.WAWContract}
                    />
                  </Route>
                  :
                  <Route path='/user-account'>
                    You have been logged out
                  </Route>
              }

              {
                this.state.loggedIn ?
                  <Route path='/stake' >
                    <Stake
                      web3={this.state.web3}
                      account={this.state.account}
                      rewards={this.state.rewards}
                      username={this.state.username}
                      WAWContract={this.state.WAWContract}
                    />
                  </Route>
                  :
                  <Route path='/user-account'>
                    You have been logged out
                  </Route>
              }

              {
                this.state.loggedIn ?
                  <Route path='/buy-nft' >
                    <BuyNFT
                      web3={this.state.web3}
                      account={this.state.account}
                      username={this.state.username}
                      imageName={this.state.imageName}
                      imageSymbol={this.state.imageSymbol}
                      numberOfMintedImages={this.state.numberOfMintedImages}
                      NFTContract={this.state.NFTContract}
                    />
                  </Route>
                  :
                  <Route path='/user-account'>
                    You have been logged out
                  </Route>
              }

              {
                this.state.loggedIn ?
                  <Route path='/nft-auction' >
                    <NftAuction
                      web3={this.state.web3}
                      account={this.state.account}
                      username={this.state.username}
                      imageName={this.state.imageName}
                      imageSymbol={this.state.imageSymbol}
                      numberOfMintedImages={this.state.numberOfMintedImages}
                      NFTContract={this.state.NFTContract}
                    />
                  </Route>
                  :
                  <Route path='/user-account'>
                    You have been logged out
                  </Route>
              }

              {
                this.state.loggedIn ?
                  <Route path='/pools' >
                    <Pools
                      web3={this.state.web3}
                      account={this.state.account}
                      username={this.state.username}
                      WAWContract={this.state.WAWContract}
                    />
                  </Route>
                  :
                  <Route path='/user-account'>
                    You have been logged out
                  </Route>
              }

              {
                this.state.loggedIn ?
                  <Route path='/vote' >
                    <Vote
                      web3={this.state.web3}
                      account={this.state.account}
                      username={this.state.username}
                      WAWContract={this.state.WAWContract}
                    />
                  </Route>
                  :
                  <Route path='/user-account'>
                    You have been logged out
                  </Route>
              }

              {
                this.state.loggedIn ?
                  <Route path='/sign-out'>
                    <SignOut
                      loggedOut={this.loggedOut}
                    />
                    You've been logged out
                    <br></br>
                    Thank you
                  </Route>
                  :
                  <Route path='/sign-up' >
                    <SignUp
                      web3={this.state.web3}
                      contract={this.state.AuthContract}
                      WAWContract={this.state.WAWContract}
                      account={this.state.account}
                      accountCreated={this.accountCreated}
                    />
                  </Route>
              }
            </Switch>
          </BrowserRouter>
        </div>
      </div>
    );
  }
}

export default App;