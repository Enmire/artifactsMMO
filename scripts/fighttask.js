import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const bank = await requests.getClosestTile("bank", {"x": 0, "y":0})
let actionTile
let response

async function loop() {
  requests.fight(character)
    .then(async res => {
      response = res
      switch(response.status) {
        case 497:
          console.log(`${character}'s inventory is full. Attempting to deposit...`);
          await actions.waitSeconds(5)
          response = await actions.bankAndDepositInventory(character)
          response = await actions.depositAllGold(character)
          response = await actions.move(character, actionTile)
          loop()
          break;
        default:
          if(response.data.character.task_progress === response.data.character.task_total) {
            response = await actions.completeAndAcceptTask(character, response.data.character)
            actionTile = await requests.getClosestTile(response.data.character.task, bank)
            response = await actions.move(character, actionTile, response.data.character)
          }
          defaultHandler.handle(character, res.status, loop, actionTile)
          break;
      }
    })
}

async function start() {
  response = await actions.waitForCooldown(character)
  response = await actions.depositAllItemsIfInventoryIsFull(character, response.data.character)
  response = await actions.completeAndAcceptTask(character, response.data.character)
  actionTile = await requests.getClosestTile(response.data.character.task, bank)
  response = await actions.move(character, actionTile, response.data.character)

  console.log("Starting fighting...")
  loop()
}

start()