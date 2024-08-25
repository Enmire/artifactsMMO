import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as utils from './utilities/utils.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

let consumableOne
let consumableOneNeeded
let consumableTwo
let consumableTwoNeeded
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
            response = await actions.bankAndDeposit(character, response.data.character)
            response = await actions.withdrawAndEquipBassIfNeeded(character, bassNeeded, response.data.character)
            response = await actions.move(character, lichTile, response.data.character)
          }
          response = await actions.withdrawAndEquipBassIfNeeded(character, bassNeeded, response.data.character)
          response = await actions.move(character, lichTile, response.data.character)
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
  response = await actions.bankAndDepositIfLessSlots(character, 2, response.data.character)
  response = await actions.equipConsumablesIfNeeded(character, bassNeeded, response.data.character)
  response = await actions.move(character, lichTile, response.data.character)

  console.log("Starting fighting...")
  loop()
}

start()