import * as requests from '../api/requests.js'
import * as utils from '../utilities/utils.js'

async function waitForCooldown(character) {
  const charData = await requests.getCharData(character)
  const cooldown = new Date(charData.cooldown_expiration) - new Date()
  if(cooldown > 0) {
    console.log(`${charData.name} is on cooldown for ${cooldown/1000} seconds.`)
    await utils.delay(cooldown)
  }
}

async function move(character, tile) {
  const charData = await requests.getCharData(character)

  if(charData.x === tile.x && charData.y === tile.y) {
    console.log(`${character} is already at ${tile.x}, ${tile.y}. No move needed.`)
    return
  }

  return await requests.moveRequest(character, action, body)
}

async function completeAndAcceptTask(character) {
  const charData = await requests.getCharData(character)
  const taskMaster = await requests.getFirstTileByCode("monsters")

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
  await requests.completeTask(character)
  await requests.acceptTask(character)
}

async function depositAllItems(character) {
  const charData = await requests.getCharData(character)
    for(const slot of charData.inventory) {
      if(slot.quantity > 0)
        await requests.depositItem(character, slot.code, slot.quantity)
    }
}

async function bankAndDepositAllItems(character) {
  const bank = await requests.getFirstTileByCode("bank")
  await move(character, bank)
  await depositAllItems(character)
}


async function depositAllItemsIfInventoryIsFull(character) {
  const charData = await requests.getCharData(character)
  if(utils.isInventoryFull(charData))
    await bankAndDepositAllItems(character)
}

async function depositAllGold(character) {
  const charData = await requests.getCharData(character)
  if(charData.gold > 0)
    await requests.depositGold(character, charData.gold)
  else
    console.log("No gold to deposit.")
}  

async function withdrawAllItems(character, itemArray) {
  for(const item of itemArray) {
    await requests.withdrawItem(character, item.code, item.quantity)
  }
}

async function withdrawTaskCoins(character) {
  const itemCode = "tasks_coin"
  const charData = await requests.getCharData(character)
  const bankCoinData = await requests.getBankItem(itemCode)

  if(bankCoinData.quantity < 3)
    return true

  if(bankCoinData.quantity < charData.inventory_max_items)
    await requests.withdrawItem(character, itemCode, bankCoinData.quantity - bankCoinData.quantity % 3)
  else
    await requests.withdrawItem(character, itemCode, charData.inventory_max_items - charData.inventory_max_items % 3)
}

async function waitSeconds(timeInSeconds) {
  await utils.delay(timeInSeconds * 1000)
}

export {
  move,
  waitForCooldown,
  completeAndAcceptTask,
  bankAndDepositAllItems,
  depositAllItemsIfInventoryIsFull,
  depositAllGold,
  withdrawAllItems,
  withdrawTaskCoins,
  waitSeconds
}