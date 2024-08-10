import * as actions from './api/actions.js'
import * as data from './api/data.js'
import * as logger from './utilities/logsettings.js'

logger.addTimestampsToConsoleLogs()

const character = process.argv[2]
await actions.waitForCooldown(character)
await actions.completeAndAcceptTask(character)
console.log("New task accepted.")