import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const taskMaster = await requests.getFirstTileByCode("monsters")
let response

async function loop() {
  requests.exchangeTaskCoins(character)
    .then(async res => {
      response = res
      switch(response.status) {
        case 200:
          loop()
          break;
        case 478:
          response = await actions.bankAndDeposit(character)
          const shouldExit = await actions.withdrawTaskCoins(character, response.data.character)
          if(shouldExit) {
            console.log("Not enough task coins to exchange.")
            return
          }
          response = await actions.move(character, taskMaster, response.data.character)
          loop()
          break;
        default:
          defaultHandler.handle(character, res.status, loop, taskMaster)
          break;
      }
    })
}

async function start() {
  response = await actions.waitForCooldown(character)
  response = await actions.bankAndDeposit(character, response.data.character)
  const shouldExit = await actions.withdrawTaskCoins(character, response.data.character)
  if(shouldExit) {
    console.log("Not enough task coins to exchange.")
    return
  }
  response = await actions.move(character, taskMaster, response.data.character)
  console.log("Starting coin exchange...")
  loop()
}

start()