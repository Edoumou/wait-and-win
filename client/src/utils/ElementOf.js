function ElementOf(num, Tab) {
    let isElement = false;

    for (let i = 0; i < Tab.length; i++) {
        if (Number(num) === Number(Tab[i])) {
            isElement = true;
        }
    }

    return isElement;
}

export default ElementOf;