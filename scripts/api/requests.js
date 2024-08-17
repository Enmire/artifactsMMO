import * as controller from './requestcontroller.js'

async function getCharData(character) {
  const url = `/characters/${character}`

  return await controller.getRequest(url)
}

async function getItemData(itemCode) {
  const url = `/items/${itemCode}`

  return await controller.getRequest(url)
}

async function getAllItemData() {
  const url = "/items"

  console.log("Getting all item requests.")
  return await controller.getRequestPaged(url)
}

async function getResourceDataByDrop(itemCode) {
  const url = `/resources/?drop=${itemCode}`

  console.log(`Getting resource data for ${itemCode}.`)
  return await controller.getRequestPaged(url)
}

async function getFirstResourceDataByDrop(itemCode) {
  const allResourcesByDrop = await getResourceDataByDrop(itemCode)

  if(allResourcesByDrop.length < 1) {
    console.log(`No resources drop itemCode: ${itemCode}.`)
    return {}
  }

  return allResourcesByDrop[0]
}

async function getBankItem(itemCode) {
  const url = `/my/bank/items?item_code=${itemCode}`

  const responseArray = await controller.getRequestPaged(url)
  if(responseArray.length < 1) {
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
  return await controller.getRequestPaged(url)
}

function getAllMapsByCode(contentCode) {
  const url = `/maps/?page=1&size=100&content_code=${contentCode}`

  return controller.getRequestPaged(url)
}

function getAllMapsByType(contentType) {
  const url = `/maps/?page=1&size=100&content_type=${contentType}`

  return controller.getRequestPaged(url)
}

async function getFirstTileByCode(contentCode) {
  const allMapsByCode = await getAllMapsByCode(contentCode)

  if(allMapsByCode.length < 1) {
    console.log(`No tiles match contentCode: ${contentCode}.`)
    return {}
  }

  return allMapsByCode[0]
}

async function getClosestTile(contentCode, targetTile) {
  const mapData = await getAllMapsByCode(contentCode)

  if(mapData.length < 1) {
    console.log(`No tiles match contentCode: ${contentCode}.`)
    return {}
  }

  let closestTile
  let currentDistance
  let highestDistance = Number.MAX_SAFE_INTEGER

  for(const mapTile of mapData) {
    currentDistance = Math.abs(targetTile.x - mapTile.x) + Math.abs(targetTile.y - mapTile.y)
    if(currentDistance < highestDistance) {
      closestTile = mapTile
      highestDistance = currentDistance
    }
  }

  return closestTile
}

async function moveRequest(character, tile) {
  const action = "move"
  const body = `{"x":${tile.x},"y":${tile.y}}`

  return await controller.postRequest(character, action, body)
}

async function equipRequest(character, itemCode, slot) {
  // Allowed slot values: weapon, shield, helmet, body_armor, leg_armor, boots, ring1, ring2, amulet, artifact1, artifact2, artifact3, consumable1, consumable2
  const action = "equip"
  const body = `{"code":${itemCode},"slot":${slot}}`

  return await controller.postRequest(character, action, body)
}

async function unequipRequest(character, slot) {
  // Allowed slot values: weapon, shield, helmet, body_armor, leg_armor, boots, ring1, ring2, amulet, artifact1, artifact2, artifact3, consumable1, consumable2
  const action = "unequip"
  const body = `{"slot":${slot}}`

  return await controller.postRequest(character, action, body)
}

async function fight(character) {
  const action = "fight"

  return await controller.postRequest(character, action)
}

async function gather(character) {
  const action = "gathering"

  return await controller.postRequest(character, action,)
}

async function craft(character, itemCode, quantity) {
  if(!code && !quantity)
    throw new Error("Craft must be passed code and quantity.");

  const action = "crafting"
  const body = `{"code": "${itemCode}", "quantity": ${quantity}}`

  return await controller.postRequest(character, action, body)
}

async function depositItem(character, itemCode, quantity) {
  const action = "bank/deposit"
  const body = `{"code":"${itemCode}","quantity":${quantity}}`

  return await controller.postRequest(character, action, body)
}

async function depositGold(character, quantity) {
  const action = "bank/deposit/gold"
  const body = `{"quantity":${quantity}}`

  return await controller.postRequest(character, action, body)
}

async function recycle(character, itemCode, quantity) {
  if(!itemCode && !quantity)
    throw new Error("Recycle must be passed code and quantity.");

  const action = "recycling"
  const body = `{"code": "${itemCode}", "quantity": ${quantity}}`

  return await controller.postRequest(character, action, body)
}

async function withdrawItem(character, itemCode, quantity) {
    const action = "bank/withdraw"
    const body = `{"code":"${itemCode}","quantity":${quantity}}`

    return await controller.postRequest(character, action, body)
}

async function withdrawGold(character, quantity) {
  const action = "bank/withdraw/gold"
  const body = `{"quantity":${quantity}}`

  return await controller.postRequest(character, action, body)
}

async function buyItem(character, itemCode, quantity, price) {
  const action = "ge/buy"
  const body = `{"code":"${itemCode}","quantity":${quantity},"price":${price}}`

  return await controller.postRequest(character, action, body)
}

async function sellItem(character, itemCode, quantity, price) {
  const action = "ge/sell"
  const body = `{"code":"${itemCode}","quantity":${quantity},"price":${price}}`

  return await controller.postRequest(character, action, body)
}

async function acceptTask(character) {
  const action = "task/new"

  return await controller.postRequest(character, action)
}

async function completeTask(character) {
  const action = "task/complete"

  return await controller.postRequest(character, action)
}

async function exchangeTaskCoins(character) {
  const action = "task/exchange"

  return await controller.postRequest(character, action)
}

async function deleteItem(character, itemCode, quantity) {
  const action = "delete"
  const body = `{"code":"${itemCode}","quantity":${quantity}}`

  return await controller.postRequest(character, action, body)
}

export {
  getCharData,
  getItemData,
  getAllItemData,
  getResourceDataByDrop,
  getFirstResourceDataByDrop,
  getBankItem,
  getAllBankItems,
  getAllMapsByCode,
  getAllMapsByType,
  getFirstTileByCode,
  getClosestTile,
  moveRequest,
  equipRequest,
  unequipRequest,
  fight,
  gather,
  craft,
  depositItem,
  depositGold,
  recycle,
  withdrawItem,
  withdrawGold,
  buyItem,
  sellItem,
  acceptTask,
  completeTask,
  exchangeTaskCoins,
  deleteItem
}