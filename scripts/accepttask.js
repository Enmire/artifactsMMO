import * as actions from './actions/actions.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
const response  = await actions.waitForCooldown(character)
await actions.completeAndAcceptTask(character, response.data.character)
console.log("New task accepted.")