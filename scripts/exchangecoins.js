import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const taskMaster = await data.getClosestTile("monsters", {"x": 0, "y":0})

async function loop() {
  actions.exchangeTaskCoins(character)
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