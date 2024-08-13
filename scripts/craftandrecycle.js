import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as utils from './utilities/utils.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const itemCode = process.argv[3]
const charData = await data.getCharData(character)
const bank = await data.getClosestTile("bank", charData)
const itemData = await data.getItemData(itemCode)
const craftTile = await data.getClosestTile(itemData.item.craft.skill, bank)
let maxCraftable
let materialsArray = []
let amountCrafted = 0

async function loop() {
  actions.craft(character, itemCode, maxCraftable)
    .then(async (status) => {
      switch(status) {
        case 200:
          amountCrafted += maxCraftable
          console.log(`Total amount of ${itemCode} crafted: ${amountCrafted}`)
          await actions.bankAndDepositAllItems(character)
          // Return if we've reach the desired amount to craft.
          if(amountCrafted >= amountToCraft) {
            console.log(`Crafted ${amountCrafted} ${itemCode}, which has reached the requested amount of ${amountToCraft}.`)
            return;
          }
          // Update the materials array and amount to craft if there are less remaining than the maximum craftable amount.
          if((amountToCraft - amountCrafted) < maxCraftable) {
            maxCraftable = amountToCraft - amountCrafted
            materialsArray = itemData.item.craft.items.map(item => {
              return {
                code: item.code,
                quantity: item.quantity * maxCraftable
              }
            })
          }
          await actions.withdrawAllItems(character, materialsArray)
          await actions.move(character, craftTile)
          loop()
          break;
        default:
          responseHandling.handle(character, status)
          break;
      }
    })
}

async function start() {
  if(process.argv[3] === undefined || !(process.argv[4] === undefined)) {
    console.log('Command must be in the format of "node <script> <character> <itemCode>"')
    return
  }
  
  // Wait for character cooldown.
  await actions.waitForCooldown(character)

  // Calculate max craftable items per trip.
  maxCraftable = utils.maxCraftablePerInventory(charData, itemData)
  
  // Create array of total crafting materials for withdrawal.
  itemData.item.craft.items.forEach(item => {
    materialsArray.push(
      {
        "code": item.code,
        "quantity": item.quantity * maxCraftable
      }
    )
  })

  // Deposit all inventory.
  await actions.bankAndDepositAllItems(character)

  // Withdraw all required materials.
  await actions.withdrawAllItems(character, materialsArray)

  // Move to crafting location.
  await actions.move(character, craftTile)

  console.log("Starting crafting...")
  loop()
}

start()