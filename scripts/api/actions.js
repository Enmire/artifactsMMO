import * as data from './data.js'
import * as requests from './requests.js'
import * as utils from '../utilities/utils.js'

async function waitForCooldown(character) {
  const charData = await data.getCharData(character)
  const cooldown = new Date(charData.cooldown_expiration) - new Date()
  if(cooldown > 0) {
    console.log(`${charData.name} is on cooldown for ${cooldown/1000} seconds.`)
    await utils.delay(cooldown)
  }
}

async function move(character, tile) {
  const action = "move"
  const body = `{"x":${tile.x},"y":${tile.y}}`

  const charData = await data.getCharData(character)

  if(charData.x === tile.x && charData.y === tile.y) {
    console.log(`${character} is already at ${tile.x}, ${tile.y}. No move needed.`)
    return
  }

  return await requests.postRequest(character, action, body)
}

async function gather(character) {
  const action = "gathering"

  return await requests.postRequest(character, action,)
}

async function craft(character, code, quantity) {
  if(!code && !quantity)
    throw new Error("Craft must be passed code and quantity.");

  const action = "crafting"
  const body = `{"code": "${code}", "quantity": ${quantity}}`

  return await requests.postRequest(character, action, body)
}

async function recycle(character, code, quantity) {
  if(!code && !quantity)
    throw new Error("Recycle must be passed code and quantity.");

  const action = "recycling"
  const body = `{"code": "${code}", "quantity": ${quantity}}`

  return await requests.postRequest(character, action, body)
}

async function fight(character) {
  const action = "fight"

  return await requests.postRequest(character, action)
}

async function acceptNewTask(character) {
  const action = "task/new"

  return await requests.postRequest(character, action)
}

async function completeTask(character) {
  const action = "task/complete"

  return await requests.postRequest(character, action)
}

async function completeAndAcceptTask(character) {
  const charData = await data.getCharData(character)
  const taskMaster = await data.getClosestTile("monsters",  {"x": 0, "y":0})

  // Incomplete Task
  if(charData.task !== "" && charData.task_progress !== charData.task_total) {
    console.log("Task is not complete and can't be turned in.")
    return
  }

  // Complete Task
  if(charData.task !== "" && charData.task_progress === charData.task_total) {
    if(utils.areSlotsAvailable(charData, 2)) {
      console.log("Less than two inventory slots available, depositing.")
      await bankAndDepositAllItems(character)
    }
  }

  await move(character, taskMaster)
  await completeTask(character)
  await acceptNewTask(character)
}

async function exchangeTaskCoins(character) {
  const action = "task/exchange"

  return await requests.postRequest(character, action)
}

async function deposit(character, item, quantity) {
    const action = "bank/deposit"
    const body = `{"code":"${item}","quantity":${quantity}}`

    return await requests.postRequest(character, action, body)
}

async function depositAllItems(character) {
  const charData = await data.getCharData(character)
    for(const slot of charData.inventory) {
      if(slot.quantity > 0)
        await deposit(character, slot.code, slot.quantity)
    }
}

async function bankAndDepositAllItems(character) {
  const bank = await data.getClosestTile("bank", {"x": 0, "y":0})
  await move(character, bank)
  await depositAllItems(character)
}

async function depositAllItemsIfInventoryIsFull(character) {
  const charData = await data.getCharData(character)
  if(utils.isInventoryFull(charData))
    await bankAndDepositAllItems(character)
}

async function depositGold(character, quantity) {
  const action = "bank/deposit/gold"
  const body = `{"quantity":${quantity}}`

  return await requests.postRequest(character, action, body)
}

async function depositAllGold(character) {
  const charData = await data.getCharData(character)
  if(charData.gold > 0)
    await depositGold(character, charData.gold)
  else
    console.log("No gold to deposit.")
}

async function withdrawItem(character, item, quantity) {
    const action = "bank/withdraw"
    const body = `{"code":"${item}","quantity":${quantity}}`

    return await requests.postRequest(character, action, body)
}

async function withdrawAllItems(character, itemArray) {
    for(const item of itemArray) {
      await withdrawItem(character, item.code, item.quantity)
    }
}

async function withdrawTaskCoins(character) {
  const itemCode = "tasks_coin"
  const charData = await data.getCharData(character)
  const bankCoinData = await data.getBankItem(itemCode)

  if(bankCoinData.quantity < 3)
    return true

  if(bankCoinData.quantity < charData.inventory_max_items)
    await withdrawItem(character, itemCode, bankCoinData.quantity - bankCoinData.quantity % 3)
  else
    await withdrawItem(character, itemCode, charData.inventory_max_items - charData.inventory_max_items % 3)
}

async function waitSeconds(timeInSeconds) {
  await utils.delay(timeInSeconds * 1000)
}

export {
  waitForCooldown,
  move,
  gather,
  craft,
  recycle,
  fight,
  completeAndAcceptTask,
  exchangeTaskCoins,
  deposit,
  depositAllItems,
  bankAndDepositAllItems,
  depositAllItemsIfInventoryIsFull,
  depositGold,
  depositAllGold,
  withdrawItem,
  withdrawAllItems,
  withdrawTaskCoins,
  waitSeconds
}