import Formatter from './Formatter';

const Formate = (value) => {
    let newVal = Formatter().format(value).slice(1);

    if (newVal[0] === '0') {
        return newVal.substr(1);
    } else {
        return newVal;
    }
}

export default Formate;