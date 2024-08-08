import * as actions from './actions/actions.js'
import * as utils from './utilities/utils.js'

utils.addTimestampsToConsoleLogs()

const character = process.argv[2]
const charData = await actions.getCharData(character)
const bank = await actions.getClosestTile("bank", charData.x, charData.y)
const taskMaster = await actions.getClosestTile("monsters", charData.x, charData.y)

await actions.waitForCooldown(charData)

await actions.completeAndAcceptTask(charData, bank, taskMaster)

console.log("New task accepted.")