import * as actions from './actions/actions.js'
import * as utils from './utilities/utils.js'

const character = process.argv[2]
const charData = await actions.getCharData(character)
const bank = await actions.getClosestTile("bank", charData.x, charData.y)

await actions.waitForCooldown(charData)

await actions.bankAndDepositAll(charData, bank)

console.log("Deposit all complete.")