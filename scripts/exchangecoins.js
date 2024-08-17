import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as responseHandling from './api/responsehandling.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const taskMaster = await requests.getClosestTile("monsters", {"x": 0, "y":0})

async function loop() {
  requests.exchangeTaskCoins(character)
    .then(async res => {
      switch(res.status) {
        case 478:
          await actions.bankAndDepositAllItems(character)
          const shouldExit = await actions.withdrawTaskCoins(character)
          if(shouldExit) {
            console.log("Not enough task coins to exchange.")
            return
          }
          await actions.move(character, taskMaster)
          loop()
          break;
        default:
          responseHandling.handle(character, res.status, loop, taskMaster)
          break;
      }
    })
}

async function start() {
  await actions.waitForCooldown(character)
  await actions.bankAndDepositAllItems(character)
  const shouldExit = await actions.withdrawTaskCoins(character)
  if(shouldExit) {
    console.log("Not enough task coins to exchange.")
    return
  }
  await actions.move(character, taskMaster)
  console.log("Starting coin exchange...")
  loop()
}

start()