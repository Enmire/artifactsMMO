import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as utils from './utilities/utils.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const skill = process.argv[3]
let currentLevel
let resourceCode
let resources
let bank
let gatherTile
let response

function getFirstGatherableResource(resources, level) {
  for(const resource of resources) {
    if(level >= resource.level)
      return  resource.code
  }
}

async function loop() {
  requests.gather(character)
    .then(async res => {
      response = res
      switch(response.status) {
        case 200:
          response = await actions.bankAndDepositIfLessSlots(character, 1, response.data.character)
          if(response.data.character[`${skill}_level`] != currentLevel) {
            currentLevel = response.data.character[`${skill}_level`]
            resourceCode = getFirstGatherableResource(resources, currentLevel)
            const bankGatherPair = await requests.getClosestBankAndTile(resourceCode)
            bank = bankGatherPair.bank
            gatherTile = bankGatherPair.contentTile
          }
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
  resources = (await requests.getResourceDataBySkill(skill)).sort(utils.sortResourcesByLevel)
  response = await actions.waitForCooldown(character)
  currentLevel = response.data.character[`${skill}_level`]
  resourceCode = getFirstGatherableResource(resources, currentLevel)
  const bankGatherPair = await requests.getClosestBankAndTile(resourceCode)
  bank = bankGatherPair.bank
  gatherTile = bankGatherPair.contentTile
  response = await actions.equipGatherTool(character, skill, response.data.character)
  response = await actions.depositAllItemsIfInventoryIsFull(character, response.data.character)
  response = await actions.move(character, gatherTile, response.data.character)
  console.log(`Starting ${skill} training...`)
  loop()
}


start()