import * as actions from './actions/actions.js'

const character = process.argv[2]
const charData = await actions.getCharData(character)
const bank = await actions.getClosestTile("bank", charData.x, charData.y)
const taskMaster = await actions.getClosestTile("monsters", charData.x, charData.y)

await actions.waitForCooldown(charData)

// TODO: Add logic

console.log("Exchanging coins complete.")