import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as utils from './utilities/utils.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const command = process.argv[3]
let bank
let gatherTile
let response

async function loop() {
  requests.gather(character)
    .then(async res => {
      response = res
      switch(response.status) {
        case 200:
          response = await actions.bankAndDepositIfLessSlots(character, 1, response.data.character)
          response = await actions.move(character, gatherTile, response.data.character)
          loop()
          break;
        default:
          defaultHandler.handle(character, response.status, loop, gatherTile)
          break;
      }
    })
}

async function start() {
  const bankGatherPair = await requests.getClosestBankAndTile(utils.commandToCode(command))
  bank = bankGatherPair.bank
  gatherTile = bankGatherPair.contentTile
  const gatherType = (await requests.getResourceDataByCode(utils.commandToCode(command))).skill
  response = await actions.waitForCooldown(character)
  response = await actions.equipGatherTool(character, gatherType, response.data.character)
  response = await actions.depositAllItemsIfInventoryIsFull(character, response.data.character)
  response = await actions.move(character, gatherTile, response.data.character)
  console.log("Starting gathering...")
  loop()
}

start()