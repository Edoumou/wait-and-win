import WaitAndWin from "./contracts/WaitAndWin.json";

const ERC20Contract = async (web3) => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = WaitAndWin.networks[networkId];

    return new web3.eth.Contract(
        WaitAndWin.abi,
        deployedNetwork && deployedNetwork.address
    );
}

export default ERC20Contract;