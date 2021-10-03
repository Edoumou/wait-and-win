const FormateAddress = (address) => {
    let front = address.substr(0, 6);
    let end = address.substr(address.length - 4, address.length - 1);

    return `${front}...${end}`;
}

export default FormateAddress;