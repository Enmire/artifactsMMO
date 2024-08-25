import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const command = process.argv[3]
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
  const bankFightPair = await requests.getClosestBankAndTile(command)
  bank = bankFightPair.bank
  fightTile = bankFightPair.contentTile
  const monsterData = await requests.getMonsterData(command)
  requiredSlots = monsterData.drops.length
  response = await actions.waitForCooldown(character)
  response = await actions.bankAndDepositIfLessSlots(character, requiredSlots, response.data.character)
  response = await actions.move(character, fightTile, response.data.character)

  console.log("Starting fighting...")
  loop()
}

start()