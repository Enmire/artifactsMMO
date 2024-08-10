import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as utils from './utilities/utils.js'

utils.addTimestampsToConsoleLogs()

const character = process.argv[2]
const itemCode = process.argv[3]
const amountToRecycle = parseInt(process.argv[4])
const charData = await data.getCharData(character)
const bank = await data.getClosestTile("bank", charData)
const itemData = await data.getItemData(itemCode)
let recycleTile
let maxRecyclable
let amountRecycled = 0

async function loop() {
  actions.recycle(charData, itemCode, maxRecyclable)
    .then(async (status) => {
      switch(status) {
        case 200:
          amountRecycled += maxRecyclable
          console.log(`Total amount of ${itemCode} recycled: ${amountRecycled}`)
          await actions.move(charData, bank)
          await actions.depositAll(charData)

          // Return if we've reach the desired amount to recycle.
          if(amountRecycled >= amountToRecycle) {
            console.log(`Recycled ${amountRecycled} ${itemCode}, which has reached the requested amount of ${amountToRecycle}.`)
            return;
          }

          // Update the amount to recycle if there are less remaining than the maximum recyclable amount.
          if((amountToRecycle - amountRecycled) < maxRecyclable)
            maxRecyclable = amountToRecycle - amountRecycled

          await actions.withdraw(charData, itemCode, maxRecyclable)
          await actions.move(charData, recycleTile)
          loop()
          break;
        default:
          responseHandling.handle(charData, status, loop())
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

  recycleTile = await data.getClosestTile(itemData.item.craft.skill, bank)
  
  await actions.waitForCooldown(charData)

  await actions.bankAndDepositAll(charData, bank)

  maxRecyclable = utils.maxRecyclable(charData, itemData)

  if(amountToRecycle < maxRecyclable)
    maxRecyclable = amountToRecycle

  await actions.withdraw(charData, itemCode, maxRecyclable)

  await actions.move(charData, recycleTile)

  console.log("Starting recycling...")
  loop()
}

start()