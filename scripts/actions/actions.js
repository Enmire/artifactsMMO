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

  returnData = await bankAndDeposit(character, returnData.data.character)

  let itemDataArray = []
  for(const item of itemArray) {
    const data = await requests.getItemData(item)
    itemDataArray.push(data)
  }

  const equipInfo = utils.equipmentToSlotArray(returnData.data.character, itemDataArray)

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

async function equipGatherTool(character, gatherType, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  let toolData = (await requests.getAllItemDataByType("weapon")).filter(item => item.effects.some(effect => effect.name === gatherType))
  toolData = toolData.sort(utils.sortTools(gatherType))
  let bankTools = []

  for(const tool of toolData) {
    const bankTool = await requests.getBankItemByCode(tool.code)
    if (bankTool.quantity > 0)
      bankTools.push(tool)
  }

  const equippedWeaponData = toolData.filter(tool => tool.code === returnData.data.character.weapon_slot)
    
  if(bankTools.length > 0 && (equippedWeaponData.length < 1 || Math.abs(equippedWeaponData[0].effects[1].value) < Math.abs(bankTools[0].effects[1].value)))
    returnData = await equipItemsFromBank(character, [bankTools[0].code], returnData.data.character)

  return returnData
}

async function completeAndAcceptTask(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  const taskMaster = await requests.getFirstTileByCode("monsters")

  // Incomplete Task
  if(returnData.data.character.task !== "" && returnData.data.character.task_progress !== returnData.data.character.task_total) {
    return returnData
  }

  // Complete Task
  if(returnData.data.character.task !== "" && returnData.data.character.task_progress === returnData.data.character.task_total) {
    if(!utils.areSlotsAvailable(returnData.data.character, 2)) {
      returnData = await bankAndDeposit(character)
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

async function bankAndDeposit(character, charData) {
  if(charData === undefined)
    charData = await requests.getCharData(character)
  const bank = await requests.getClosestTile("bank", charData)
  let response = await move(character, bank, charData)
  response = await depositAllGold(character, response.data.character)
  return await depositAllItems(character, response.data.character)
}

async function depositAllItemsIfInventoryIsFull(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  if(utils.isInventoryFull(returnData.data.character)) 
    return await bankAndDeposit(character, returnData.data.character)

  return returnData
}

async function bankAndDepositIfLessSlots(character, slots, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  if(utils.areSlotsAvailable(returnData.data.character, slots))
    return returnData

  console.log(`${character} has less than ${slots} slots remaining. Depositing.`)
  return await bankAndDeposit(character, returnData.data.character)
}

async function depositAllGold(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  if(returnData.data.character.gold > 0)
    return await requests.depositGold(character, charData.gold)
  
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
      throw new Error(`Not enough ${item.code} in bank. Requested: ${item.quantity}. Bank: ${bankItem === null ? 0 : bankItem.quantity}`)
  }

  return returnData
}

async function withdrawTaskCoins(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  const itemCode = "tasks_coin"
  const bankCoinData = await requests.getBankItemByCode(itemCode)

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

  returnData = await bankAndDeposit()

  if(returnData.data.character.ring1_slot !== "")
    returnData = await requests.unequipRequest(character, "ring1_slot")

  if(returnData.data.character.ring2_slot !== "")
    returnData = await requests.unequipRequest(character, "ring2_slot")

  returnData = await bankAndDeposit()

  return returnData
}

async function unequipAndDepositAllConsumables(character, charData) {
  let returnData = {data: {character: charData}}
  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  let currentInventory = utils.inventoryTotal(returnData.data.character)

  if(currentInventory + returnData.data.character.consumable1_slot_quantity > returnData.data.character.inventory_max_items)
    returnData = await bankAndDeposit(character, returnData.data.character)

  if(returnData.data.character.consumable1_slot !== "")
    returnData = await requests.unequipRequest(character, "consumable1")

  currentInventory = utils.inventoryTotal(returnData.data.character)

  if(currentInventory + returnData.data.character.consumable2_slot_quantity > returnData.data.character.inventory_max_items)
    returnData = await bankAndDeposit(character, returnData.data.character)

  if(returnData.data.character.consumable2_slot !== "")
    returnData = await requests.unequipRequest(character, "consumable1")

  returnData = await bankAndDeposit(character, returnData.data.character)

  return returnData
}

async function withdrawAndEquipBassIfNeeded(character, bassAmount, charData) {
  let returnData = {data: {character: charData}}

  if(charData === undefined)
    returnData.data.character = await requests.getCharData(character)

  const slot = utils.consumableSlotEquipped(returnData.data.character, "cooked_bass")

  if(slot !== null && returnData.data.character[`${slot}_slot_quantity`] >= bassAmount)
    return returnData

  returnData = await bankAndDeposit(character, returnData.data.character)

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
  equipGatherTool,
  waitForCooldown,
  completeAndAcceptTask,
  bankAndDeposit,
  depositAllItemsIfInventoryIsFull,
  bankAndDepositIfLessSlots,
  depositAllGold,
  withdrawAllItems,
  withdrawTaskCoins,
  unequipAndDepositRings,
  unequipAndDepositAllConsumables,
  withdrawAndEquipBassIfNeeded,
  waitSeconds
}