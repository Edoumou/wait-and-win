import ImageNFT from "./contracts/ImageNFT.json";

const ERC721Contract = async (web3) => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = ImageNFT.networks[networkId];

    return new web3.eth.Contract(
        ImageNFT.abi,
        deployedNetwork && deployedNetwork.address
    );
}

export default ERC721Contract;