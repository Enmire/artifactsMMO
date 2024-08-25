import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as utils from './utilities/utils.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const itemCode = process.argv[3]
const charData = await requests.getCharData(character)
const itemData = await requests.getItemData(itemCode)
const craftTile = await requests.getFirstTileByCode(itemData.item.craft.skill)
const maxCraftable = utils.maxCraftablePerInventory(charData, itemData)
let gatherData = []

async function loop() {
  requests.gather(character)
    .then(async res => {
      switch(res.status) {
        case 200:
          let inProgressIndex = 0
          while(inProgressIndex < gatherData.length && gatherData[inProgressIndex].gathered >= gatherData[inProgressIndex].needed)
            inProgressIndex++

          gatherData[inProgressIndex].gathered++

          if(gatherData[inProgressIndex].gathered === gatherData[inProgressIndex].needed) {
            if(inProgressIndex === gatherData.length - 1) {
              await actions.move(character, craftTile)
              await requests.craft(character, itemCode, maxCraftable)
              await actions.bankAndDeposit(character)
              await actions.move(character, gatherData[0].tile)
              for(const tracker of gatherData)
                tracker.gathered = 0
            }
            else {
              await actions.move(character, gatherData[inProgressIndex + 1].tile)
            }
          }
          loop()
          break;
        default:
          defaultHandler.handle(character, res.status, loop)
          break;
      }
    })
}

async function start() {
  await actions.waitForCooldown(character)

  await actions.bankAndDeposit(character)

  for(const item of itemData.item.craft.items) {
    const resource = await requests.getFirstResourceDataByDrop(item.code)
    const resourceTile = await requests.getFirstTileByCode(resource.code)
    const gatherObject = {
      itemCode: item.code,
      tile: resourceTile,
      needed: item.quantity * maxCraftable,
      gathered: 0
    }
    gatherData.push(gatherObject)
  }

  await actions.move(character, gatherData[0].tile)

  console.log("Starting gather and process...")
  loop()
}

start()