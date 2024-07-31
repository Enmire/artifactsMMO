// Actions to be used by other scripts.
export {getCharInfo, move, gather, deposit,  delay, inventoryTotal}
import 'dotenv/config'

const server = 'https://api.artifactsmmo.com';
const token = process.env.TOKEN

async function getCharInfo(character) {
    const url = `${server}/characters/${character}`

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token
      },
    }

    return fetch(url, options)
        .then(res => res.json())
        .then(data => data.data)
}

async function postAction(character, action, body) {
    const url = `${server}/my/${character}/action/${action}`
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token
      },
      body
    };

    return fetch(url, options)
}

async function move(character, x, y) {
    const action = "move";
    const body = '{"x":' + x + ',"y":' + y + '}'
    
    try {
        await postAction(character, action, body)
            .then(res => res.json())
            .then(async data => {
                console.log(`Moved to ${x}, ${y}. Cooldown: ${data.data.cooldown.totalSeconds}s.`)
                await delay(data.data.cooldown.totalSeconds * 1000)
            })
    } catch (error) {
      console.log(error);
    }
}

async function gather(character) {
    const action = "gathering";
    let status

    try {
        await postAction(character, action)
            .then(res => {
                status = res.status
                return res.json()
            })
            .then(async data => {
                await delay(data.data.cooldown.totalSeconds * 1000)
            })
    } catch (error) {
      console.log(error);
    }

    return status
}

async function deposit(character, item, quantity) {
    const action = "bank/deposit";
    const body = `{"code":"${item}","quantity":${quantity}}`

    try {
        await postAction(character, action, body)
            .then(res => res.json())
            .then(async data => {
                console.log(`Deposited ${quantity} ${item}. Cooldown: ${data.data.cooldown.totalSeconds}s.`)
                await delay(data.data.cooldown.totalSeconds * 1000)
            })
    } catch (error) {
      console.log(error);
    }
}

function delay(delayInMs) {
    return new Promise(resolve => setTimeout(resolve, delayInMs));
};

function inventoryTotal(charData) {
    return charData.inventory.reduce((acc, slot) => slot.quantity + acc, 0)
}

