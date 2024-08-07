import * as actions from './actions/actions.js'
import * as utils from './utilities/utils.js'
import * as responseHandling from './actions/responsehandling.js'

utils.addTimestampsToConsoleLogs()

const character = process.argv[2]
const command = process.argv[3]
const charData = await actions.getCharData(character)
const bank = await actions.getClosestTile("bank", charData.x, charData.y)
const actionTile = await actions.getClosestTile(command, bank.x, bank.y)

async function loop() {
  actions.fight(charData)
    .then(async status => responseHandling.handle(charData, status, bank, actionTile, loop))
}

async function start() {
  await actions.waitForCooldown(charData)

  if(utils.isInventoryFull(charData)) {
    console.log("Full inventory, depositing.")
    await actions.bankAndDepositAll(charData, bank)
  }

  await actions.move(charData, actionTile.x, actionTile.y)

  console.log("Starting fighting...")
  loop()
}

start()