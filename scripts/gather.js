import * as actions from './actions/actions.js';
import * as utils from './utilities/utils.js'

const character = process.argv[2]
const command = process.argv[3]
const bank = {"x": 4, "y": 1}
let x
let y
let code
console.log(character)

async function loop() {
  actions.gather(character)
    .then(async (status) => {
      switch(status) {
        case 200:
          loop()
          break;
        case 486:
          console.log(`${character} is locked. Action is already in progress.`)
          await utils.delay(5000)
          loop()
          break;
        case 493:
          console.log(`The resource is too high-level for ${character}.`);
          return;
        case 497:
          console.log(`${character}'s inventory is full. Attempting to deposit...`);
          await utils.delay(5000)
          await actions.move(character, bank.x, bank.y);
          await actions.depositAll(character);
          await actions.move(character, x, y)
          loop()
          break;
        case 498:
          console.log(`${character} cannot be found on your account.`);
          return;
        case 499:
          console.log(`${character} is in cooldown.`);
          await utils.delay(5000)
          loop()
          break;
        case 598:
          console.log('Resource not found on this map.');
          return;
        default:
          console.log(`An error with code ${status} occurred while gathering the resource.`);
          return;
      }
    })
}

async function start() {
  const charData = await actions.getCharInfo(character)
  console.log("Received character info, calculating cooldown.")
  const cooldown = new Date(charData.cooldown_expiration) - new Date()

  await actions.getClosestTile(utils.commandToCode(command), bank.x, bank.y)
    .then((tile) => {
      x = tile.x
      y = tile.y
      code = tile.content.code
    })

  if(cooldown > 0) {
    console.log(`${character} is on cooldown for ${cooldown/1000} seconds.`)
    await utils.delay(cooldown)
  }

  if(utils.inventoryTotal(charData) == charData.inventory_max_items) {
    console.log("Full inventory, depositing.")
    if(charData.x != bank.x || charData.y != bank.y)
      await actions.move(character, bank.x, bank.y)
    await actions.depositAll(character)

  }

  if(charData.x != x || charData.y != y)
    await actions.move(character, x, y)

  console.log("Starting gathering...")
  loop()
}

start()