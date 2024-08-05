import * as actions from './actions.js';
import * as utils from './utils.js'

const character = process.argv[2]
const itemCode = process.argv[3]
const amountToCraft = process.argv[4]
const bank = {"x": 4, "y": 1}
let itemInfo
let craftTile
let charData
let craftablePerTrip
let materialsArray = []
let amountCrafted = 0
console.log(character)

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
        case 404:
          console.log('Craft not found.')
          return;
        case 479:
          console.log('Missing item or insufficient quantity in your inventory.')
          return;
        case 486:
          console.log(`${character} is locked. Action is already in progress.`)
          await utils.delay(5000)
          loop()
          break;
        case 493:
          console.log(`The craft is too high-level for ${character}.`);
          return;
        case 497:
          console.log(`${character}'s inventory is full.`);
          return;
        case 498:
          console.log(`${character} cannot be found on your account.`);
          return;
        case 499:
          console.log(`${character} is in cooldown.`);
          await utils.delay(5000)
          loop()
          break;
        case 598:
          console.log('Workshop not found on this map.');
          return;
        default:
          console.log(`An error with code ${status} occurred while crafting ${itemCode}.`);
          return;
      }
    })
}

async function start() {
  if(amountToCraft === undefined || !(process.argv[5] === undefined)) {
    console.log('Command must be in the format of "node <script> <character> <itemCode> <amountToCraft>"')
    return
  }

  itemInfo = await actions.getItemInfo(itemCode)
  craftTile = await actions.getClosestTile(itemInfo.item.craft.skill, bank.x, bank.y)
  charData = await actions.getCharInfo(character)
  
  // Wait for character cooldown.
  console.log("Received character info, calculating cooldown.")
  const cooldown = new Date(charData.cooldown_expiration) - new Date()
  if(cooldown > 0) {
    console.log(`${character} is on cooldown for ${cooldown/1000} seconds.`)
    await utils.delay(cooldown)
  }

  // Calculate max craftable items per trip.
  let totalItemsForCraft = 0
  itemInfo.item.craft.items.forEach(item => {
    totalItemsForCraft += item.quantity
  })
  craftablePerTrip = Math.floor(charData.inventory_max_items / totalItemsForCraft)
  
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
  if(charData.x != bank.x || charData.y != bank.y)
    await actions.move(character, bank.x, bank.y)
  await actions.depositAll(character)

  // Withdraw all required materials.
  await actions.withdrawAll(character, materialsArray)

  // Move to crafting location.
  await actions.move(character, craftTile.x, craftTile.y)

  console.log("Starting crafting...")
  loop()
}

start()