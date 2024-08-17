import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as utils from './utilities/utils.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const command = process.argv[3]
const bank = await requests.getFirstTileByCode("bank")
const actionTile = await requests.getClosestTile(utils.commandToCode(command), bank)

async function loop() {
  requests.gather(character)
    .then(async res => defaultHandler.handle(character, res.status, loop, actionTile))
}

async function start() {
  await actions.waitForCooldown(character)

  await actions.depositAllItemsIfInventoryIsFull(character)

  await actions.move(character, actionTile)

  console.log("Starting gathering...")
  loop()
}

start()