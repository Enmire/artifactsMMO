// Actions to be used by other scripts.
import 'dotenv/config'
import * as requests from './requests.js'

function getCharInfo(character) {
  const url = `/characters/${character}`

  console.log(`Getting character info for ${character}.`)
  return requests.getRequest(url)
}

function getItemInfo(itemCode) {
  const url = `/items/${itemCode}`

  console.log(`Getting item info for ${itemCode}.`)
  return requests.getRequest(url)
}

function getAllMaps(contentCode,  contentType) {
  if(!contentCode && !contentType)
    throw new Error("getAllMaps must be passed contentCode or contentType.");

  let url = `/maps/?page=1&size=100`

  if(contentCode)
    url += `&content_code=${contentCode}`
  if(contentType)
    url += `&content_type=${contentType}`

  return requests.getRequest(url)
}

async function getClosestTile(command, x, y) {
  const data = await getAllMaps(command)
  let closestIndex
  let currentDistance
  let highestDistance = 17

  for(let i = 0; i < data.length; i++) {
    currentDistance = Math.max(Math.abs(x - data[i].x),Math.abs( y - data[i].y))
    if(currentDistance < highestDistance) {
      closestIndex = i
    }
  }

  return data[closestIndex]
}

async function move(character, x, y) {
  const action = "move"
  const logString = `Move to ${x}, ${y}`
  const body = `{"x":${x},"y":${y}}`

  return await requests.postRequest(character, action, logString, body)
}

async function gather(character) {
  const action = "gathering"
  const logString = "Gathering"

  return await requests.postRequest(character, action, logString)
}

async function craft(character, code, quantity) {
  if(!code && !quantity)
    throw new Error("Craft must be passed code and quantity.");

  const action = "crafting"
  const logString = "Crafting"
  const body = `{"code": "${code}", "quantity": ${quantity}}`

  return await requests.postRequest(character, action, logString, body)
}

async function fight(character) {
    const action = "fight"
    const logString = "Fighting"

    return await requests.postRequest(character, action, logString)
}

async function deposit(character, item, quantity) {
    const action = "bank/deposit";
    const logString = `Deposit of ${quantity} ${item}`
    const body = `{"code":"${item}","quantity":${quantity}}`

    return await requests.postRequest(character, action, logString, body)
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

async function withdraw(character, item, quantity) {
    const action = "bank/withdraw"
    const logString = `Withdrawal of ${quantity} ${item}`
    const body = `{"code":"${item}","quantity":${quantity}}`

    return await requests.postRequest(character, action, logString, body)
}

async function withdrawAll(character, itemArray) {
    for(const item of itemArray) {
      await withdraw(character, item.code, item.quantity)
    }
}

export {getCharInfo, getItemInfo, getAllMaps, getClosestTile, move, gather, craft, fight, deposit, depositAll, withdrawAll}