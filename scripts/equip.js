import * as actions from './actions/actions.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const equipArray = [
    "steel_shield"
]

await actions.waitForCooldown(character)
await actions.equipItemsFromBank(character, equipArray)