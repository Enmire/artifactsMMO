import * as actions from './actions.js';

const character = process.argv[2]
const item = "birch_wood"
const quantity = 100
console.log(character)

export async function loop() {
    const action = 'gathering';
  
    actions.gather(character, action)
      .then(async (status) => {

        if (status === 498) {
          console.log('The character cannot be found on your account.');
          return;
        }
        else if (status === 497) {
          console.log("Your character's inventory is full.");
          await actions.move(character, 4, 1);
          await actions.deposit(character, item, quantity);
          await actions.move(character, 3, 5)
          loop()
        }
        else if  (status === 499) {
          console.log('Your character is in cooldown.');
          return;
        }
        else if  (status === 493) {
          console.log('The resource is too high-level for your character.');
          return;
        }
        else if (status === 598) {
          console.log('No resource on this map.');
          return;
        }
        else if (status !== 200) {
          console.log('An error occurred while gathering the resource.');
          return;
        }
    
        else if (status === 200) {
          console.log('Your character successfully gathered the resource.');
          loop()
        }
      })
}

async function start() {
    const charData = await actions.getCharInfo(character)
    const cooldown = new Date(charData.cooldown_expiration) - new Date()
        
    if(cooldown > 0) {
        console.log(`${character} is on cooldown for ${cooldown/1000} seconds.`)
        await actions.delay(cooldown)
    }

    if(actions.inventoryTotal(charData) == charData.inventory_max_items) {
        console.log("Full inventory, depositing.")
        if(charData.x != 4 || charData.y != 1)
            await actions.move(character, 4, 1)
        await actions.deposit(character, item, quantity)
        await actions.move(character, 3, 5)
        loop()
    }
    
    else {
        if(charData.x != 3 || charData.y != 5)
            await actions.move(character, 3, 5)
        loop()
    }
}

start()