import * as actions from './actions/actions.js'
import * as responseHandling from './actions/responsehandling.js'
import * as utils from './utilities/utils.js'

const character = process.argv[2]
const itemCode = process.argv[3]
let amountToCraft = process.argv[4]
let bank
let itemInfo
let craftTile
let charData
let craftablePerTrip
let materialsArray = []
let amountCrafted = 0

async function loop() {
  console.log(`Attempting to craft ${itemCode}.`)
  actions.craft(character, itemCode, craftablePerTrip)
    .then(async (status) => {
      switch(status) {
        case 200:
          amountCrafted += craftablePerTrip
          console.log(`Total amount of ${itemCode} crafted: ${amountCrafted}`)
          await actions.move(character, bank.x, bank.y)
          await actions.depositAll(character)
          if(amountCrafted >= amountToCraft) {
            console.log(`Crafted ${amountCrafted} ${itemCode}, which has reached the requested amount of ${amountToCraft}.`)
            return;
          }
          await actions.withdrawAll(character, materialsArray)
          await actions.move(character, craftTile.x, craftTile.y)
          loop()
          break;
        default:
          responseHandling.handle(character, status, loop)
          break;
      }
    })
}

async function start() {
  if(amountToCraft === undefined || !(process.argv[5] === undefined)) {
    console.log('Command must be in the format of "node <script> <character> <itemCode> <amountToCraft>"')
    return
  }

  charData = await actions.getCharInfo(character)
  itemInfo = await actions.getItemInfo(itemCode)
  bank = await actions.getClosestTile("bank", charData.x, charData.y)
  craftTile = await actions.getClosestTile(itemInfo.item.craft.skill, bank.x, bank.y)
  
  // Wait for character cooldown.
  console.log("Received character info, calculating cooldown.")
  const cooldown = new Date(charData.cooldown_expiration) - new Date()
  if(cooldown > 0) {
    console.log(`${character} is on cooldown for ${cooldown/1000} seconds.`)
    await utils.delay(cooldown)
  }

  // Calculate max craftable items per trip.
  amountToCraft = parseInt(amountToCraft)
  let totalItemsForCraft = 0
  itemInfo.item.craft.items.forEach(item => {
    totalItemsForCraft += item.quantity
  })
  craftablePerTrip = Math.floor(charData.inventory_max_items / totalItemsForCraft)

  // If the desired amount is less than the amount per trip, lower the amount per trip to the desired amount.
  if(amountToCraft < craftablePerTrip)
    craftablePerTrip = amountToCraft
  
  // Create array of total crafting materials for withdrawal.
  itemInfo.item.craft.items.forEach(item => {
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
  await actions.withdrawAll(character, materialsArray)

  // Move to crafting location.
  await actions.move(character, craftTile.x, craftTile.y)

  console.log("Starting crafting...")
  loop()
}

start()