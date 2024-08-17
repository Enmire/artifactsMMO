import * as requests from '../api/requests.js'
import * as utils from '../utilities/utils.js'

async function waitForCooldown(character, charData) {
  if(charData === undefined)
    charData = await requests.getCharData(character)
  const cooldown = new Date(charData.cooldown_expiration) - new Date()
  if(cooldown > 0) {
    console.log(`${charData.name} is on cooldown for ${cooldown/1000} seconds.`)
    await utils.delay(cooldown)
  }
  return {data: {character: charData}}
}

async function move(character, tile, charData) {
  if(charData === undefined)
    charData = await requests.getCharData(character)

  if(charData.x === tile.x && charData.y === tile.y)
    return {data: {character: charData}}

  return await requests.moveRequest(character, tile)
}

async function equipItemsFromBank(character, itemArray, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  returnData = await bankAndDepositInventory(character, returnData.data.character)

  let itemDataArray = []
  for(const item of itemArray) {
    const data = await requests.getItemData(item)
    itemDataArray.push(data)
  }

  const equipInfo = utils.equipmentToSlotArray(returnData.data.character, itemDataArray)

  console.log(equipInfo)

  if(equipInfo.filter(item => item.slot.includes("consumable")).length > 0)
    returnData = await unequipAndDepositAllConsumables(character, returnData.data.character)

  for(const item of equipInfo) {
    if(returnData.data.character[`${item.slot}_slot`] !== "") {
      returnData = await requests.unequipRequest(character, item.slot)
      returnData = await depositAllItems(character, returnData.data.character)
    }
    if(item.slot.includes("consumable"))
      returnData = await requests.withdrawItem(character, item.code, returnData.data.character.inventory_max_items)
    else
      returnData = await requests.withdrawItem(character, item.code, 1)
    returnData = await requests.equipRequest(character, item.code, item.slot)
  }

  return returnData
}

async function completeAndAcceptTask(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  const taskMaster = await requests.getFirstTileByCode("monsters")

  // Incomplete Task
  if(returnData.data.character.task !== "" && returnData.data.character.task_progress !== returnData.data.character.task_total) {
    console.log("Task is not complete and can't be turned in.")
    return returnData
  }

  // Complete Task
  if(returnData.data.character.task !== "" && returnData.data.character.task_progress === returnData.data.character.task_total) {
    if(utils.areSlotsAvailable(returnData.data.character, 2)) {
      console.log("Less than two inventory slots available, depositing.")
      returnData = await bankAndDepositInventory(character)
    }
  }

  await move(character, taskMaster, returnData.data.character)
  await requests.completeTask(character)
  return await requests.acceptTask(character)
}

async function depositAllItems(character, charData) {
  let returnData = {data: {character: charData}}

  if(charData === undefined) {
    charData = await requests.getCharData(character)
    returnData.data.character = charData
  }

  for(const slot of charData.inventory) {
    if(slot.quantity > 0)
      returnData = await requests.depositItem(character, slot.code, slot.quantity)
  }

  return returnData
}

async function bankAndDepositInventory(character, charData) {
  if(charData === undefined)
    charData = await requests.getCharData(character)
  const bank = await requests.getFirstTileByCode("bank")
  const response = await move(character, bank, charData)
  return await depositAllItems(character, response.data.character)
}

async function depositAllItemsIfInventoryIsFull(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  if(utils.isInventoryFull(returnData.data.character)) 
    return await bankAndDepositInventory(character, returnData.data.character)

  return returnData
}

async function depositAllGold(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  if(returnData.data.character.gold > 0)
    return await requests.depositGold(character, charData.gold)
  
  console.log("No gold to deposit.")
  return returnData
}  

async function withdrawAllItems(character, itemArray, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  let bankData = await requests.getAllBankItems()

  for(const item of itemArray) {
    const bankItem = utils.firstElement(bankData.filter(bankItem => bankItem.code === item.code))
    if(bankItem !== null && bankItem.quantity >= item.quantity) {
      returnData = await requests.withdrawItem(character, item.code, item.quantity)
      bankData = returnData.data.bank
    }
    else
      console.log(`Not enough ${item.code} in bank. Bank data: ${bankItem}`)
  }

  return returnData
}

async function withdrawTaskCoins(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  const itemCode = "tasks_coin"
  const bankCoinData = await requests.getBankItem(itemCode)

  if(bankCoinData.quantity < 3)
    return true

  if(bankCoinData.quantity < charData.inventory_max_items)
    await requests.withdrawItem(character, itemCode, bankCoinData.quantity - bankCoinData.quantity % 3)
  else
    await requests.withdrawItem(character, itemCode, charData.inventory_max_items - charData.inventory_max_items % 3)
}

async function unequipAndDepositRings(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  returnData = await bankAndDepositInventory()

  if(returnData.data.character.ring1_slot !== "")
    returnData = await requests.unequipRequest(character, "ring1_slot")

  if(returnData.data.character.ring2_slot !== "")
    returnData = await requests.unequipRequest(character, "ring2_slot")

  returnData = await bankAndDepositInventory()

  return returnData
}

async function unequipAndDepositAllConsumables(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  let currentInventory = utils.inventoryTotal(returnData.data.character)

  if(currentInventory + returnData.data.character.consumable1_slot_quantity > returnData.data.character.inventory_max_items)
    returnData = await bankAndDepositInventory(character, returnData.data.character)

  if(returnData.data.character.consumable1_slot !== "")
    returnData = await requests.unequipRequest(character, "consumable1")

  currentInventory = utils.inventoryTotal(returnData.data.character)

  if(currentInventory + returnData.data.character.consumable2_slot_quantity > returnData.data.character.inventory_max_items)
    returnData = await bankAndDepositInventory(character, returnData.data.character)

  if(returnData.data.character.consumable2_slot !== "")
    returnData = await requests.unequipRequest(character, "consumable1")

  returnData = await bankAndDepositInventory(character, returnData.data.character)

  return returnData
}

async function withdrawAndEquipBassIfNeeded(character, bassAmount, charData) {
  let returnData = {data: {character: charData}}

  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  const slot = utils.consumableSlotEquipped(returnData.data.character, "cooked_bass")

  if(slot !== null && returnData.data.character[`${slot}_slot_quantity`] >= bassAmount)
    return returnData

  returnData = await bankAndDepositInventory(character, returnData.data.character)

  returnData = await unequipAndDepositAllConsumables(character, returnData.data.character)

  returnData = await withdrawAllItems(character, [{"code":"cooked_bass","quantity":returnData.data.character.inventory_max_items}], returnData.data.character)
  return await requests.equipRequest(character, "cooked_bass", "consumable1")
}

async function waitSeconds(timeInSeconds) {
  await utils.delay(timeInSeconds * 1000)
}

export {
  move,
  equipItemsFromBank,
  waitForCooldown,
  completeAndAcceptTask,
  bankAndDepositInventory,
  depositAllItemsIfInventoryIsFull,
  depositAllGold,
  withdrawAllItems,
  withdrawTaskCoins,
  unequipAndDepositAllConsumables,
  withdrawAndEquipBassIfNeeded,
  waitSeconds
}