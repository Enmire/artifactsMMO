import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as utils from './utilities/utils.js'

utils.addTimestampsToConsoleLogs()

const character = process.argv[2]
const itemCode = process.argv[3]
const charData = await data.getCharData(character)
const itemData = await data.getItemData(itemCode)
const bank = await data.getClosestTile("bank", charData)
const craftTile = await data.getClosestTile(itemData.item.craft.skill, bank)
const maxCraftable = utils.maxCraftable(charData, itemData)
let gatherData = []

async function loop() {
    actions.gather(charData)
    .then(async (status) => {
        switch(status) {
          case 200:
            let inProgressIndex = 0
            while(inProgressIndex < gatherData.length && gatherData[inProgressIndex].gathered >= gatherData[inProgressIndex].needed)
              inProgressIndex++

            gatherData[inProgressIndex].gathered++

            if(gatherData[inProgressIndex].gathered === gatherData[inProgressIndex].needed) {
              if(inProgressIndex === gatherData.length - 1) {
                await actions.move(charData, craftTile)
                await actions.craft(charData, itemCode, maxCraftable)
                await actions.bankAndDepositAll(charData, bank)
                await actions.move(charData, gatherData[0].tile)
                for(let i = 0; i < gatherData.length; i++)
                  gatherData[i].gathered = 0
              }
              else {
                await actions.move(charData, gatherData[inProgressIndex + 1].tile)
              }
            }
            loop()
            break;
          default:
            responseHandling.handle(charData, status, loop())
            break;
        }
      })
  }
  
  async function start() {
    await actions.waitForCooldown(charData)
  
    await actions.bankAndDepositAll(charData, bank)

    const items = itemData.item.craft.items

    for(let i = 0; i < items.length; i++) {
      const resource = (await data.getResourceData(items[i].code))[0]
      const resourceTile = (await data.getAllMaps(resource.code))[0]
      const gatherObject = {
        itemCode: items[i].code,
        tile: resourceTile,
        needed: items[i].quantity * maxCraftable,
        gathered: 0
      }
      gatherData.push(gatherObject)
    }
  
    await actions.move(charData, gatherData[0].tile)

    console.log("Starting gather and process...")
    loop()
  }
  
  start()