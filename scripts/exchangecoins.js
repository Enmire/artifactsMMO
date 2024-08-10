import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as responseHandling from './api/responsehandling.js'
import * as utils from './utilities/utils.js'

utils.addTimestampsToConsoleLogs()

const character = process.argv[2]
const itemCode = "tasks_coin"
const charData = await data.getCharData(character)
const bank = await data.getClosestTile("bank", charData)
const taskMaster = await data.getClosestTile("monsters", charData)
let bankCoinData

async function withdrawCoins() {
  if(bankCoinData.quantity < charData.inventory_max_items)
    await actions.withdraw(charData, itemCode, bankCoinData.quantity - bankCoinData.quantity % 3)
  else
    await actions.withdraw(charData, itemCode, charData.inventory_max_items - charData.inventory_max_items % 3)
}

async function loop() {
  actions.exchangeTaskCoins(charData)
    .then(async (status) => {
      switch(status) {
        case 478:
          await actions.move(charData, bank)
          await actions.depositAll(charData)
          bankCoinData = await data.getBankItem(itemCode)
          if(bankCoinData.quantity < 3) {
            console.log("Finished exchanging task coins.")
            return
          }
          await withdrawCoins()
          await actions.move(charData, taskMaster)
          loop()
          break;
        default:
          responseHandling.handle(charData, status, bank, taskMaster, loop())
          break;
      }
    })
}

async function start() {
  await actions.waitForCooldown(charData)
  await actions.bankAndDepositAll(charData, bank)

  bankCoinData = await data.getBankItem(itemCode)
  
  if(bankCoinData.quantity < 3) {
    console.log("Not enough task coins to exchange.")
    return
  }
  
  await withdrawCoins()

  await actions.move(charData, taskMaster)

  console.log("Starting coin exchange...")
  loop()
}

start()