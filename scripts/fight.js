import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const command = process.argv[3]
const bank = await requests.getFirstTileByCode("bank")
const actionTile = await requests.getClosestTile(command, bank)
let response

async function loop() {
  requests.fight(character)
    .then(async res => {
      response = res
      switch(response.status) {
        case 497:
          console.log(`${character}'s inventory is full. Attempting to deposit...`);
          await actions.waitSeconds(5)
          response = await actions.bankAndDepositInventory(character, response.data.character)
          response = await actions.depositAllGold(character, response.data.character)
          response = await actions.move(character, actionTile, response.data.character)
          loop()
          break;
        default:
          defaultHandler.handle(character, res.status, loop, actionTile)
          break;
      }
    })
}

async function start() {
  response = await actions.waitForCooldown(character)
  response = await actions.depositAllItemsIfInventoryIsFull(character, response.data.character)
  response = await actions.move(character, actionTile, response.data.character)

  console.log("Starting fighting...")
  loop()
}

start()