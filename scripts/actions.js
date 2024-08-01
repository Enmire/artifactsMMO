// Actions to be used by other scripts.
import 'dotenv/config'
import * as helpers from './helpers.js';

const server = 'https://api.artifactsmmo.com';
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Bearer ' + process.env.TOKEN
}

function getAllMaps(contentCode,  contentType) {
    if(!contentCode && !contentType)
      throw new Error("getAllMaps must be passed contentCode or contentType.");

    let url = `${server}/maps/?page=1&size=100`

    if(contentCode)
      url += `&content_code=${contentCode}`
    if(contentType)
      url += `&content_type=${contentType}`

    const options = {
      method: 'GET',
      headers
    }

    return fetch(url, options)
        .then(res => res.json())
        .then(data => data.data)
        .catch((error) => console.log(error))
}

function getCharInfo(character) {
    console.log("Getting character info.")

    const url = `${server}/characters/${character}`
    const options = {
      method: 'GET',
      headers
    }

    return fetch(url, options)
        .then(res => res.json())
        .then(data => data.data)
        .catch((error) => console.log(error))
}

function postAction(character, action, body) {
    const url = `${server}/my/${character}/action/${action}`
    const options = {
      method: 'POST',
      headers,
      body
    };

    return fetch(url, options)
        .catch((error) => console.log(error))
}

async function move(character, x, y) {
    const body = '{"x":' + x + ',"y":' + y + '}'
    let status
    

    await postAction(character, "move", body)
        .then(res => {
          status = res.status
          return res.json()
        })
        .then(async data => {
            console.log(`Moved to ${x}, ${y}. Cooldown: ${data.data.cooldown.totalSeconds}s.`)
            await delay(data.data.cooldown.totalSeconds * 1000)
        })
        .catch((error) => console.log(error))
}

async function gather(character) {
    let status

    await postAction(character, "gathering")
        .then(res => {
            status = res.status
            return res.json()
        })
        .then(async data => await delay(data.data.cooldown.totalSeconds * 1000))
        .catch((error) => console.log(error))


    return status
}

async function deposit(character, item, quantity) {
    const action = "bank/deposit";
    const body = `{"code":"${item}","quantity":${quantity}}`
    let status


    await postAction(character, action, body)
        .then(res => {
          status = res.status
          return res.json()
        })
        .then(async data => {
            console.log(`Deposited ${quantity} ${item}. Cooldown: ${data.data.cooldown.totalSeconds}s.`)
            await delay(data.data.cooldown.totalSeconds * 1000)
        })
        .catch((error) => console.log(error))

    return status
}

async function depositAll(character) {
    const charData = await getCharInfo(character)
    console.log("Character info for depositAll received.\n")

    for(const slot of charData.inventory) {
      if(slot.quantity > 0) {
        console.log(`Depositing ${slot.code}...`)
        await deposit(character, slot.code, slot.quantity)
      }
    }
}

async function getClosestTile(contentCode, x, y) {
    const data = getAllMaps(contentCode)
    let closestIndex
    let currentDistance
    let highestDistance = 17

    for(let i = 0; i < data.length; i++) {
      currentDistance = Math.max(x - data[i].x, y - data[i].y)
      if(currentDistance < highestDistance) {
        closestIndex = i
      }
    }

    return data[closestIndex]
}

function delay(delayInMs) {
    return new Promise(resolve => setTimeout(resolve, delayInMs));
};

function inventoryTotal(charData) {
    return charData.inventory.reduce((acc, slot) => slot.quantity + acc, 0)
}

export {getCharInfo, move, gather, deposit, depositAll, delay, inventoryTotal}