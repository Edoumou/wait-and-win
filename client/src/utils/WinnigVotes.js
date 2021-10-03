function WinningVotes(userVotes) {
    if (userVotes.length <= 2) {
        console.log("At least 3 users are needed for the vote to take place.");

        return;
    }

    let Tab = new Array(userVotes.length + 1);

    // initialize Tab with zeros
    for (let i = 0; i < Tab.length; i++) {
        Tab[i] = 0;
    }

    for (let i = 0; i < Tab.length; i++) {
        Tab[userVotes[i]]++;
    }

    // get the array of winners (two numbers may have same number of votes)
    let votePosition = 0;
    let winningVotes = [];

    for (let i = 1; i < Tab.length; i++) {
        if (Tab[i] > votePosition) {
            votePosition = Tab[i];
        }
    }

    for (let i = 1; i < Tab.length; i++) {
        if (Tab[i] === votePosition) {
            winningVotes.push(i);
        }
    }

    return winningVotes;
}

export default WinningVotes;