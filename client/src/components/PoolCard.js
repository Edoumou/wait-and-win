import React, { Component } from 'react';
import { Card, Popup } from "semantic-ui-react";;

class PoolCard extends Component {
    state = {
        poolState: ''
    }
    componentDidMount = async () => {
        this.setState({
            poolState: await this.props.WAWContract.methods.getPoolState(this.props.pool.ID)
                .call({ from: this.props.account })
        })
    }

    joinPool = async () => {
    }

    render() {
        let obj = {};
        obj = this.props.pool;
        console.log("OBJ =", obj);
        return (
            <Popup>
                trigger={
                    <Card onClick={this.joinPool}>
                        <Card.Content textAlign="center">
                            <Card.Header>
                                {obj.prize} {this.props.symbol} to win
                            </Card.Header>
                            <Card.Meta>
                                {obj.numberOfUsers} users
                            </Card.Meta>
                            <Card.Description>
                                <strong>
                                    POOL - {obj.ID}
                                </strong>
                                Pay {obj.price} {this.props.symbol}
                            </Card.Description>
                            <Card.Content extra>
                                {this.props.poolState}
                            </Card.Content>
                        </Card.Content>
                    </Card>
                }
                <Popup.Header>Click to participate</Popup.Header>
                <Popup.Content>
                    Come back later to vote
                </Popup.Content>
            </Popup>
        );
    }
}

export default PoolCard;
