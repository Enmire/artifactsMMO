import * as actions from './actions.js';

const character = process.argv[2]
const command = process.argv[3]
let x
let y
let item
console.log(character)

export async function loop() {
    const action = 'gathering';
  
    actions.gather(character, action)
      .then(async (status) => {
        switch(status) {
          case 200:
            console.log('Your character successfully gathered the resource.');
            loop()
            break;
          case 498:
            console.log('The character cannot be found on your account.');
            return;
          case 497:
            console.log("Your character's inventory is full.");
            await actions.move(character, 4, 1);
            await actions.depositAll(character);
            await actions.move(character, x, y)
            loop()
            break;
          case 499:
            console.log('Your character is in cooldown.');
            return;
          case 493:
            console.log('The resource is too high-level for your character.');
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

function setParameters() {
    console.log(`Setting parameters for ${command}.`)
    switch(command) {
      case "ash":
        x = 6
        y = 1
        item = "ash_wood"
        break;
      case "spruce":
        x = 2
        y = 6
        item = "spruce_wood"
        break;
      case "birch":
        x = 3
        y = 5
        item = "birch_wood"
        break;
      case "dead":
        x = 9
        y = 8
        item = "dead_wood"
        break;
      case "copper":
        x = 2
        y = 0
        item = "copper_ore"
        break;
      case "iron":
        x = 1
        y = 7
        item = "iron_ore"
        break;
      case "coal":
        x = 1
        y = 6
        item = "coal"
        break;
      case "gold":
        x = 10
        y = -4
        item = "gold"
        break;
      case "gudgeon":
        x = 4
        y = 2
        item = "gudgeon"
        break;
      case "shrimp":
        x = 5
        y = 2
        item = "shrimp"
        break;
      case "trout":
        x = -2
        y = 6
        item = "trout"
        break;
      case "bass":
        x = -3
        y = 6
        item = "bass"
        break;
      default:
        return "error"
    }

    console.log(`Parameters set to x: ${x}, y: ${y}, item: ${item}.`)
}

async function start() {
    const charData = await actions.getCharInfo(character)
    console.log("Received character info, calculating cooldown.")
    const cooldown = new Date(charData.cooldown_expiration) - new Date()

    if(setParameters() === "error") {
      console.log("Input parameters are incorrect.")
      return
    }
        
    if(cooldown > 0) {
        console.log(`${character} is on cooldown for ${cooldown/1000} seconds.`)
        await actions.delay(cooldown)
    }

    if(actions.inventoryTotal(charData) == charData.inventory_max_items) {
        console.log("Full inventory, depositing.")
        if(charData.x != 4 || charData.y != 1)
            await actions.move(character, 4, 1)
        await actions.depositAll(character)
        await actions.move(character, x, y)
        loop()
    }
    
    else {
        if(charData.x != x || charData.y != y)
            await actions.move(character, x, y)
        loop()
    }
}

start()