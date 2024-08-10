import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as utils from './utilities/utils.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const command = process.argv[3]
const charData = await data.getCharData(character)
const bank = await data.getClosestTile("bank", charData)
const actionTile = await data.getClosestTile(utils.commandToCode(command), bank)

async function loop() {
  actions.gather(character)
    .then(async status => responseHandling.handle(character, status, loop, actionTile))
}

async function start() {
  await actions.waitForCooldown(character)

  await actions.depositAllItemsIfInventoryIsFull(character)

  await actions.move(character, actionTile)

  console.log("Starting gathering...")
  loop()
}

start()