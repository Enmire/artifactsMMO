import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as utils from './utilities/utils.js'

utils.addTimestampsToConsoleLogs()

const character = process.argv[2]
const command = process.argv[3]
const charData = await data.getCharData(character)
const bank = await data.getClosestTile("bank", charData.x, charData.y)
const actionTile = await data.getClosestTile(utils.commandToCode(command), bank.x, bank.y)

async function loop() {
  actions.gather(charData)
    .then(async status => responseHandling.handle(charData, status, bank, actionTile, loop))
}

async function start() {
  await actions.waitForCooldown(charData)

  if(utils.isInventoryFull(charData)) {
    console.log("Full inventory, depositing.")
    await actions.bankAndDepositAll(charData, bank)
  }

  await actions.move(charData, actionTile)

  console.log("Starting gathering...")
  loop()
}

start()