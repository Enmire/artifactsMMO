import * as actions from './actions/actions.js'
import * as responseHandling from './actions/responsehandling.js';
import * as utils from './utilities/utils.js'

const character = process.argv[2]
const command = process.argv[3]
let bank
let actionTile

async function loop() {
  actions.fight(character)
    .then(async status => responseHandling.handle(character, status, bank, actionTile, loop))
}

async function start() {
  const charData = await actions.getCharInfo(character)
  console.log("Received character info, calculating cooldown.")
  const cooldown = new Date(charData.cooldown_expiration) - new Date()

  bank = await actions.getClosestTile("bank", charData.x, charData.y)
  actionTile = await actions.getClosestTile(command, bank.x, bank.y)

  if(cooldown > 0) {
    console.log(`${character} is on cooldown for ${cooldown/1000} seconds.`)
    await utils.delay(cooldown)
  }

  if(utils.inventoryTotal(charData) == charData.inventory_max_items) {
    console.log("Full inventory, depositing.")
    await actions.bankAndDepositAll(charData, bank)
  }

  if(charData.x != actionTile.x || charData.y != actionTile.y)
    await actions.move(character, actionTile.x, actionTile.y)

  console.log("Starting fighting...")
  loop()
}

start()