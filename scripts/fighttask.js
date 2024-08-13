import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const bank = await data.getClosestTile("bank", {"x": 0, "y":0})
let charData
let actionTile

async function loop() {
  charData = await data.getCharData(character)
  if(charData.task_progress === charData.task_total) {
    await actions.completeAndAcceptTask(character)
    charData = await data.getCharData(character)
    actionTile = await data.getClosestTile(charData.task, bank)
    await actions.move(character, actionTile)
  }

  actions.fight(character)
    .then(async (status) => {
      switch(status) {
        case 497:
          console.log(`${character}'s inventory is full. Attempting to deposit...`);
          await actions.waitSeconds(5)
          await actions.bankAndDepositAllItems(character)
          await actions.depositAllGold(character)
          await actions.move(character, actionTile)
          loop()
          break;
        default:
          responseHandling.handle(character, status, loop, actionTile)
          break;
      }
    })
}

async function start() {
  await actions.waitForCooldown(character)

  await actions.depositAllItemsIfInventoryIsFull(character)

  await actions.completeAndAcceptTask(character)

  const charData = await data.getCharData(character)

  actionTile = await data.getClosestTile(charData.task, bank)
  
  await actions.move(character, actionTile)

  console.log("Starting fighting...")
  loop()
}

start()