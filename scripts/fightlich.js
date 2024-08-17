import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as utils from './utilities/utils.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const bassNeeded = 7
let lichTile
let character
let response

async function loop() {
  requests.fight(character)
    .then(async res => {
      response = res
      switch(response.status) {
        case 200:
          if(!utils.areSlotsAvailable(response.data.character, 2)) {
            await actions.waitSeconds(5)
            response = await actions.bankAndDepositInventory(character, response.data.character)
            response = await actions.depositAllGold(character, response.data.character)
            response = await actions.withdrawAndEquipBassIfNeeded(character, bassNeeded, response.data.character)
            response = await actions.move(character, lichTile, response.data.character)
          }
          response = await actions.withdrawAndEquipBassIfNeeded(character, bassNeeded, response.data.character)
          response = await actions.move(character, lichTile, response.data.character)
          loop()
          break;
        case 497:
          console.log(`${character}'s inventory is full. Attempting to deposit...`);
          await actions.waitSeconds(5)
          response = await actions.bankAndDepositInventory(character)
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
  character = process.argv[2]
  lichTile = await requests.getFirstTileByCode("lich")
  response = await actions.waitForCooldown(character)
  response = await actions.depositAllItemsIfInventoryIsFull(character, response.data.character)
  response = await actions.withdrawAndEquipBassIfNeeded(character, bassNeeded, response.data.character)
  response = await actions.move(character, lichTile, response.data.character)

  console.log("Starting fighting...")
  loop()
}

start()