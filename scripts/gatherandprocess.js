import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as utils from './utilities/utils.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const itemCode = process.argv[3]
const charData = await data.getCharData(character)
const itemData = await data.getItemData(itemCode)
const bank = await data.getClosestTile("bank", charData)
const craftTile = await data.getClosestTile(itemData.item.craft.skill, bank)
const maxCraftable = utils.maxCraftablePerInventory(charData, itemData)
let gatherData = []

async function loop() {
  actions.gather(character)
    .then(async (status) => {
      switch(status) {
        case 200:
          let inProgressIndex = 0
          while(inProgressIndex < gatherData.length && gatherData[inProgressIndex].gathered >= gatherData[inProgressIndex].needed)
            inProgressIndex++

          gatherData[inProgressIndex].gathered++

          if(gatherData[inProgressIndex].gathered === gatherData[inProgressIndex].needed) {
            if(inProgressIndex === gatherData.length - 1) {
              await actions.move(character, craftTile)
              await actions.craft(character, itemCode, maxCraftable)
              await actions.bankAndDepositAllItems(character)
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
          responseHandling.handle(character, status, loop)
          break;
      }
    })
}
  
async function start() {
  await actions.waitForCooldown(character)

  await actions.bankAndDepositAllItems(character)

  for(const item of itemData.item.craft.items) {
    const resource = (await data.getResourceData(item.code))[0]
    const resourceTile = (await data.getAllMaps(resource.code))[0]
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