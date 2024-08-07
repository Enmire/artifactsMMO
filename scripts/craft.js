import * as actions from './actions/actions.js'
import * as responseHandling from './actions/responsehandling.js'

const character = process.argv[2]
const itemCode = process.argv[3]
let amountToCraft = process.argv[4]
const charData = await actions.getCharData(character)
const bank = await actions.getClosestTile("bank", charData.x, charData.y)
const itemInfo = await actions.getItemInfo(itemCode)
const craftTile = await actions.getClosestTile(itemInfo.item.craft.skill, bank.x, bank.y)
let craftablePerTrip
let materialsArray = []
let amountCrafted = 0

async function loop() {
  console.log(`Attempting to craft ${itemCode}.`)
  actions.craft(charData, itemCode, craftablePerTrip)
    .then(async (status) => {
      switch(status) {
        case 200:
          amountCrafted += craftablePerTrip
          console.log(`Total amount of ${itemCode} crafted: ${amountCrafted}`)
          await actions.move(charData, bank.x, bank.y)
          await actions.depositAll(charData)
          if(amountCrafted >= amountToCraft) {
            console.log(`Crafted ${amountCrafted} ${itemCode}, which has reached the requested amount of ${amountToCraft}.`)
            return;
          }
          await actions.withdrawAll(charData, materialsArray)
          await actions.move(charData, craftTile.x, craftTile.y)
          loop()
          break;
        default:
          responseHandling.handle(charData, status, loop)
          break;
      }
    })
}

async function start() {
  if(amountToCraft === undefined || !(process.argv[5] === undefined)) {
    console.log('Command must be in the format of "node <script> <character> <itemCode> <amountToCraft>"')
    return
  }
  
  // Wait for character cooldown.
  await actions.waitForCooldown(charData)

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
  await actions.withdrawAll(charData, materialsArray)

  // Move to crafting location.
  await actions.move(charData, craftTile.x, craftTile.y)

  console.log("Starting crafting...")
  loop()
}

start()