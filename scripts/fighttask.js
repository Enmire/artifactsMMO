import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
let bank
let fightTile
let requiredSlots
let response

async function loop() {
  requests.fight(character)
    .then(async res => {
      response = res
      switch(response.status) {
        case 200:
          if(response.data.character.task_progress === response.data.character.task_total) {
            response = await actions.completeAndAcceptTask(character, response.data.character)
            const monsterData = await requests.getMonsterData(response.data.character.task)
            requiredSlots = monsterData.drops.length
            const bankFightPair = await requests.getClosestBankAndTile(response.data.character.task)
            bank = bankFightPair.bank
            fightTile = bankFightPair.contentTile
          }
          response = await actions.bankAndDepositIfLessSlots(character, requiredSlots, response.data.character)
          response = await actions.move(character, fightTile, response.data.character)
          loop()
          break;
        default:
          defaultHandler.handle(character, res.status, loop, fightTile)
          break;
      }
    })
}

async function start() {
  response = await actions.waitForCooldown(character)
  response = await actions.completeAndAcceptTask(character, response.data.character)
  const monsterData = await requests.getMonsterData(response.data.character.task)
  requiredSlots = monsterData.drops.length
  const bankFightPair = await requests.getClosestBankAndTile(response.data.character.task)
  bank = bankFightPair.bank
  fightTile = bankFightPair.contentTile
  response = await actions.bankAndDepositIfLessSlots(character, requiredSlots, response.data.character)
  response = await actions.move(character, fightTile, response.data.character)

  console.log("Starting task fighting...")
  loop()
}

start()