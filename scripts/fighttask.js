import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as responseHandling from './api/responsehandling.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const bank = await requests.getClosestTile("bank", {"x": 0, "y":0})
let charData
let actionTile

async function loop() {
  charData = await requests.getCharData(character)
  if(charData.task_progress === charData.task_total) {
    await actions.completeAndAcceptTask(character)
    charData = await requests.getCharData(character)
    actionTile = await requests.getClosestTile(charData.task, bank)
    await actions.move(character, actionTile)
  }

  requests.fight(character)
    .then(async res => {
      switch(res.status) {
        case 497:
          console.log(`${character}'s inventory is full. Attempting to deposit...`);
          await actions.waitSeconds(5)
          await actions.bankAndDepositAllItems(character)
          await actions.depositAllGold(character)
          await actions.move(character, actionTile)
          loop()
          break;
        default:
          responseHandling.handle(character, res.status, loop, actionTile)
          break;
      }
    })
}

async function start() {
  await actions.waitForCooldown(character)

  await actions.depositAllItemsIfInventoryIsFull(character)

  await actions.completeAndAcceptTask(character)

  const charData = await requests.getCharData(character)

  actionTile = await requests.getClosestTile(charData.task, bank)
  
  await actions.move(character, actionTile)

  console.log("Starting fighting...")
  loop()
}

start()