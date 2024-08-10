// Actions to be used by other scripts.
import 'dotenv/config'
import * as requests from './requests.js'

async function getCharData(character) {
  const url = `/characters/${character}`

  return await requests.getRequest(url)
}

async function getItemData(itemCode) {
  const url = `/items/${itemCode}`

  return await requests.getRequest(url)
}

async function getAllItemData() {
  const url = "/items"

  console.log("Getting all item data.")
  return await requests.getRequestPaged(url)
}

async function getResourceData(itemCode) {
  let url = "/resources/"

  if(itemCode !== undefined)
    url += `?drop=${itemCode}`

  console.log(`Getting resource data for ${itemCode}.`)
  return await requests.getRequestPaged(url)
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

async function getClosestTile(command, targetTile) {
  const mapData = await getAllMaps(command)
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

export {
  getCharData,
  getItemData,
  getAllItemData,
  getResourceData,
  getBankItem,
  getAllBankItems,
  getAllMaps,
  getClosestTile
}