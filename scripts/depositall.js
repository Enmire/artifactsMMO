import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as utils from './utilities/utils.js'

utils.addTimestampsToConsoleLogs()

const character = process.argv[2]
const charData = await data.getCharData(character)
const bank = await data.getClosestTile("bank", charData)

await actions.waitForCooldown(charData)

await actions.bankAndDepositAll(charData, bank)

console.log("Deposit all complete.")