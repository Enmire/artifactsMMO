import * as requests from './api/requests.js'
import * as actions from './actions/actions.js'
import * as defaultHandler from './api/defaulthandler.js'
import * as utils from './utilities/utils.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const itemCode = process.argv[3]
const amountToRecycle = parseInt(process.argv[4])
const charData = await requests.getCharData(character)
const bank = await requests.getClosestTile("bank", charData)
const itemData = await requests.getItemData(itemCode)
let recycleTile
let maxRecyclable
let amountRecycled = 0

async function loop() {
  requests.recycle(character, itemCode, maxRecyclable)
    .then(async res => {
      switch(res.status) {
        case 200:
          amountRecycled += maxRecyclable
          console.log(`Total amount of ${itemCode} recycled: ${amountRecycled}`)
          await actions.bankAndDepositInventory(character)

          // Return if we've reach the desired amount to recycle.
          if(amountRecycled >= amountToRecycle) {
            console.log(`Recycled ${amountRecycled} ${itemCode}, which has reached the requested amount of ${amountToRecycle}.`)
            return;
          }

          // Update the amount to recycle if there are less remaining than the maximum recyclable amount.
          if((amountToRecycle - amountRecycled) < maxRecyclable)
            maxRecyclable = amountToRecycle - amountRecycled

          await requests.withdrawItem(character, itemCode, maxRecyclable)
          await actions.move(character, recycleTile)
          loop()
          break;
        default:
          defaultHandler.handle(character, res.status, loop)
          break;
      }
    })
}

async function start() {
  if(process.argv[4] === undefined || !(process.argv[5] === undefined)) {
    console.log('Command must be in the format of "node <script> <character> <itemCode> <amountToRecycle>"')
    return
  }

  if(itemData.item.craft.skill === null) {
    console.log(`${itemData.name} cannot be recycled.`)
    return
  }

  recycleTile = await requests.getClosestTile(itemData.item.craft.skill, bank)
  
  await actions.waitForCooldown(character)

  await actions.bankAndDepositInventory(character)

  maxRecyclable = utils.maxRecyclable(charData, itemData)

  if(amountToRecycle < maxRecyclable)
    maxRecyclable = amountToRecycle

  await requests.withdrawItem(character, itemCode, maxRecyclable)

  await actions.move(character, recycleTile)

  console.log("Starting recycling...")
  loop()
}

start()