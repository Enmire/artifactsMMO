import * as actions from './actions.js';
import * as helpers from './helpers.js'

const character = process.argv[2]
const command = process.argv[3]
let x
let y
let code
console.log(character)

async function loop() {
    console.log(`Attempting to gather from ${code}.`)
    actions.gather(character, 'gathering')
      .then(async (status) => {
        switch(status) {
          case 200:
            console.log(`${character} successfully gathered from ${code}.`);
            loop()
            break;
          case 498:
            console.log('The character cannot be found on your account.');
            return;
          case 497:
            console.log(`${character}'s inventory is full.`);
            await actions.move(character, 4, 1);
            await actions.depositAll(character);
            await actions.move(character, x, y)
            loop()
            break;
          case 499:
            console.log(`${character} is in cooldown.`);
            return;
          case 493:
            console.log(`The resource is too high-level for ${character}.`);
            return;
          case 598:
            console.log('No resource on this map.');
            return;
          default:
            console.log('An error occurred while gathering the resource.');
            return;
        }
      })
}

async function start() {
    const charData = await actions.getCharInfo(character)
    console.log("Received character info, calculating cooldown.")
    const cooldown = new Date(charData.cooldown_expiration) - new Date()

    await actions.getClosestTileForCommand(command, 4, 1)
      .then((tile) => {
        x = tile.x
        y = tile.y
        code = tile.content.code
      })

    if(cooldown > 0) {
        console.log(`${character} is on cooldown for ${cooldown/1000} seconds.`)
        await actions.delay(cooldown)
    }

    if(actions.inventoryTotal(charData) == charData.inventory_max_items) {
        console.log("Full inventory, depositing.")
        if(charData.x != 4 || charData.y != 1)
            await actions.move(character, 4, 1)
        await actions.depositAll(character)

    }

    if(charData.x != x || charData.y != y)
        await actions.move(character, x, y)

    console.log("Starting gathering...")
    loop()
}

start()