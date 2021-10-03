async function StakeTokens(balance) {
    if (balance < 0) {
        return null;
    } else {
        return balance * (1.0000000 + 0.0000003);
    }
}

export default StakeTokens;