import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as utils from './utilities/utils.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const itemCode = process.argv[3]
const amountToCraft = parseInt(process.argv[4])
let charData
let bank
let itemData
let craftTile
let craftablePerTrip
let materialsArray = []
let amountCrafted = 0
let response

async function loop() {
  response = await requests.craft(character, itemCode, craftablePerTrip)

  switch(response.status) {
    case 200:
      amountCrafted += craftablePerTrip
      console.log(`Total amount of ${itemCode} crafted: ${amountCrafted}`)
      response = await actions.bankAndDeposit(character, response.data.character)
      // Return if we've reach the desired amount to craft.
      if(amountCrafted >= amountToCraft) {
        console.log(`Crafted ${amountCrafted} ${itemCode}, which has reached the requested amount of ${amountToCraft}.`)
        return;
      }
      // Update the materials array and amount to craft if there are less remaining than the maximum craftable amount.
      if((amountToCraft - amountCrafted) < craftablePerTrip) {
        craftablePerTrip = amountToCraft - amountCrafted
        materialsArray = itemData.item.craft.items.map(item => {
          return {
            code: item.code,
            quantity: item.quantity * craftablePerTrip
          }
        })
      }
      response = await actions.withdrawAllItems(character, materialsArray, response.data.character)
      response = await actions.move(character, craftTile, response.data.character)
      loop()
      break;
    default:
      defaultHandler.handle(character, response.status, loop)
      break;
  }

}

async function start() {
  if(process.argv[4] === undefined || !(process.argv[5] === undefined)) {
    console.log('Command must be in the format of "node <script> <character> <itemCode> <amountToCraft>"')
    return
  }

  charData = await requests.getCharData(character)
  itemData = await requests.getItemData(itemCode)
  bank = await requests.getFirstTileByCode("bank")
  craftTile= await requests.getClosestTile(itemData.item.craft.skill, bank)
  
  // Wait for character cooldown.
  response = await actions.waitForCooldown(character, charData)

  // Calculate max craftable items per trip.
  craftablePerTrip = utils.maxCraftablePerInventory(charData, itemData)

  // If the desired amount is less than the amount per trip, lower the amount per trip to the desired amount.
  if(amountToCraft < craftablePerTrip)
    craftablePerTrip = amountToCraft
  
  // Create array of total crafting materials for withdrawal.
  itemData.item.craft.items.forEach(item => {
    materialsArray.push(
      {
        "code": item.code,
        "quantity": item.quantity * craftablePerTrip
      }
    )
  })

  // Deposit all inventory.
  response = await actions.bankAndDeposit(character)

  // Withdraw all required materials.
  response = await actions.withdrawAllItems(character, materialsArray, response.data.character)

  // Move to crafting location.
  response = await actions.move(character, craftTile, response.data.character)

  console.log("Starting crafting...")
  loop()
}

start()