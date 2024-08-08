import * as data from './data.js'
import * as requests from './requests.js'
import * as utils from '../utilities/utils.js'

async function waitForCooldown(charData) {
  const cooldown = new Date(charData.cooldown_expiration) - new Date()
  if(cooldown > 0) {
    console.log(`${charData.name} is on cooldown for ${cooldown/1000} seconds.`)
    await utils.delay(cooldown)
  }
}

async function move(charData, tile) {
  const action = "move"
  const body = `{"x":${tile.x},"y":${tile.y}}`

  charData = await data.getCharData(charData.name)

  if(charData.x === tile.x && charData.y === tile.y) {
    console.log(`${charData.name} is already at ${tile.x}, ${tile.y}. No move needed.`)
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
  await move(charData, taskMaster)
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
  charData = await data.getCharData(charData.name)
    for(const slot of charData.inventory) {
      if(slot.quantity > 0)
        await deposit(charData, slot.code, slot.quantity)
    }
}

async function depositAllGold(charData) {
  await depositGold(charData, charData.gold)
}

async function bankAndDepositAll(charData, bank) {
  await move(charData, bank)
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