import * as actions from './actions/actions.js'
import * as utils from './utilities/utils.js'

const character = process.argv[2]
const charData = await actions.getCharInfo(character)
const bank = await actions.getClosestTile("bank", charData.x, charData.y)

console.log("Calculating cooldown.")
const cooldown = new Date(charData.cooldown_expiration) - new Date()

if(cooldown > 0) {
  console.log(`${character} is on cooldown for ${cooldown/1000} seconds.`)
  await utils.delay(cooldown)
}

await actions.bankAndDepositAll(charData, bank)

console.log("Deposit all complete.")