import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as utils from './utilities/utils.js'

utils.addTimestampsToConsoleLogs()

const character = process.argv[2]
const charData = await data.getCharData(character)
const bank = await data.getClosestTile("bank", charData)
const taskMaster = await data.getClosestTile("monsters", charData)

await actions.waitForCooldown(charData)

await actions.completeAndAcceptTask(charData, bank, taskMaster)

console.log("New task accepted.")