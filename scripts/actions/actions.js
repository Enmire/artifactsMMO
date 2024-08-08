// Actions to be used by other scripts.
import 'dotenv/config'
import * as requests from './requests.js'
import * as utils from '../utilities/utils.js'

async function getCharData(character) {
  const url = `/characters/${character}`

  return await requests.getRequest(url)
}

async function getItemData(itemCode) {
  const url = `/items/${itemCode}`

  return await requests.getRequest(url)
}

async function getBankItem(itemCode) {
  const url = `/my/bank/items?item_code=${itemCode}`

  const responseArray = await requests.getRequest(url)
  if(responseArray === undefined) {
    console.log(`Item ${itemCode} is not in bank.`)
    return {
      "code": itemCode,
      "quantity": 0
    }
  }
  return responseArray[0]
}

async function getAllBankItems() {
  const url = "/my/bank/items"

  console.log(`Getting all bank items.`)
  return await requests.getRequestPaged(url)
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
  let highestDistance = Number.MAX_SAFE_INTEGER

  for(let i = 0; i < data.length; i++) {
    currentDistance = Math.abs(x - data[i].x) + Math.abs(y - data[i].y)
    if(currentDistance < highestDistance) {
      closestIndex = i
      highestDistance = currentDistance
    }
  }

  return data[closestIndex]
}

async function waitForCooldown(charData) {
  const cooldown = new Date(charData.cooldown_expiration) - new Date()
  if(cooldown > 0) {
    console.log(`${charData.name} is on cooldown for ${cooldown/1000} seconds.`)
    await utils.delay(cooldown)
  }
}

async function move(charData, x, y) {
  const action = "move"
  const body = `{"x":${x},"y":${y}}`

  charData = await getCharData(charData.name)

  if(charData.x === x && charData.y === y) {
    console.log(`${charData.name} is already at ${x}, ${y}. No move needed.`)
    return
  }

  return await requests.postRequest(charData.name, action, body)
}

async function gather(charData) {
  const action = "gathering"

  return await requests.postRequest(charData.name, action,)
}

async function craft(charData, code, quantity) {
  if(!code && !quantity)
    throw new Error("Craft must be passed code and quantity.");

  const action = "crafting"
  const body = `{"code": "${code}", "quantity": ${quantity}}`

  return await requests.postRequest(charData.name, action, body)
}

async function fight(charData) {
  const action = "fight"

  return await requests.postRequest(charData.name, action)
}

async function acceptNewTask(charData) {
  const action = "task/new"

  return await requests.postRequest(charData.name, action)
}

async function completeTask(charData) {
  const action = "task/complete"

  return await requests.postRequest(charData.name, action)
}

async function completeAndAcceptTask(charData, bank, taskMaster) {
  // Incomplete Task
  if(charData.task !== "" && charData.task_progress !== charData.task_total) {
    console.log("Task is not complete and can't be turned in.")
    return
  }

  // Complete Task
  if(charData.task !== "" && charData.task_progress === charData.task_total) {
    if(utils.areSlotsAvailable(charData, 2)) {
      console.log("Less than two inventory slots available, depositing.")
      await actions.bankAndDepositAll(charData, bank)
    }
  }

  // Complete and No task
  await move(charData, taskMaster.x, taskMaster.y)
  await completeTask(charData)
  await acceptNewTask(charData)
}

async function exchangeTaskCoins(charData) {
  const action = "task/exchange"

  return await requests.postRequest(charData.name, action)
}

async function deposit(charData, item, quantity) {
    const action = "bank/deposit"
    const body = `{"code":"${item}","quantity":${quantity}}`

    return await requests.postRequest(charData.name, action, body)
}

async function depositGold(charData, quantity) {
  const action = "bank/deposit/gold"
  const body = `{"quantity":${quantity}}`

  if(charData.gold > 0)
    return await requests.postRequest(charData.name, action, body)
  else
    return 200
}

async function depositAll(charData) {
  charData = await getCharData(charData.name)
    for(const slot of charData.inventory) {
      if(slot.quantity > 0)
        await deposit(charData, slot.code, slot.quantity)
    }
}

async function depositAllGold(charData) {
  await depositGold(charData, charData.gold)
}

async function bankAndDepositAll(charData, bank) {
  await move(charData, bank.x, bank.y)
  await depositAll(charData)
  await depositAllGold(charData)
}

async function withdraw(charData, item, quantity) {
    const action = "bank/withdraw"
    const body = `{"code":"${item}","quantity":${quantity}}`

    return await requests.postRequest(charData.name, action, body)
}

async function withdrawAll(charData, itemArray) {
    for(const item of itemArray) {
      await withdraw(charData, item.code, item.quantity)
    }
}

export {
  getCharData,
  getItemData,
  getBankItem,
  getAllBankItems,
  getAllMaps,
  getClosestTile,
  waitForCooldown,
  move,
  gather,
  craft,
  fight,
  completeAndAcceptTask,
  exchangeTaskCoins,
  deposit,
  depositGold,
  depositAll,
  depositAllGold,
  bankAndDepositAll,
  withdraw,
  withdrawAll
}