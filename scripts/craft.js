import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as utils from './utilities/utils.js'

utils.addTimestampsToConsoleLogs()

const character = process.argv[2]
const itemCode = process.argv[3]
const amountToCraft = parseInt(process.argv[4])
const charData = await data.getCharData(character)
const bank = await data.getClosestTile("bank", charData.x, charData.y)
const itemData = await data.getItemData(itemCode)
const craftTile = await data.getClosestTile(itemData.item.craft.skill, bank.x, bank.y)
let craftablePerTrip
let materialsArray = []
let amountCrafted = 0

async function loop() {
  actions.craft(charData, itemCode, craftablePerTrip)
    .then(async (status) => {
      switch(status) {
        case 200:
          amountCrafted += craftablePerTrip
          console.log(`Total amount of ${itemCode} crafted: ${amountCrafted}`)
          await actions.move(charData, bank)
          await actions.depositAll(charData)
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
          await actions.withdrawAll(charData, materialsArray)
          await actions.move(charData, craftTile)
          loop()
          break;
        default:
          responseHandling.handle(charData, status, loop)
          break;
      }
    })
}

async function start() {
  if(process.argv[4] === undefined || !(process.argv[5] === undefined)) {
    console.log('Command must be in the format of "node <script> <character> <itemCode> <amountToCraft>"')
    return
  }
  
  // Wait for character cooldown.
  await actions.waitForCooldown(charData)

  // Calculate max craftable items per trip.
  craftablePerTrip = utils.maxCraftable(charData, itemData)

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
  await actions.bankAndDepositAll(charData, bank)

  // Withdraw all required materials.
  await actions.withdrawAll(charData, materialsArray)

  // Move to crafting location.
  await actions.move(charData, craftTile)

  console.log("Starting crafting...")
  loop()
}

start()