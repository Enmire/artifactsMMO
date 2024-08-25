import * as actions from '../actions/actions.js'

const error_messages = {
  404: "Item not found.",
  478: "Missing item or insufficient quantity in your inventory.",
  485: "The item is already equipped.",
  486: "Character is locked. An action is already in progress.",
  490: "Character already at destination.",
  491: "Slot is empty.",
  493: "The resource is too high-level for your character.",
  496: "Character level is not high enough.",
  497: "Your character's inventory is full.",
  498: "The character cannot be found on your account.",
  499: "Your character is in cooldown.",
  598: "Resource not found on this map."
}

async function handle(character, status, loop, actionTile) {
  let response
  switch(status) {
    case 200:
      loop()
      break;
    case 486:
      console.log(error_messages[status])
      console.log("Waiting 5s and retrying...")
      await actions.waitSeconds(5)
      loop()
      break;
    case 497:
      console.log(`${character}'s inventory is full. Attempting to deposit...`);
      await actions.waitSeconds(5)
      response = await actions.bankAndDepositInventory(character)
      await actions.move(character, actionTile, response.data.character)
      loop()
      break;
    case 499:
      console.log(error_messages[status])
      console.log("Waiting 5s and retrying...")
      await actions.waitSeconds(5)
      loop()
      break;
    default:
      console.log(error_messages[status])
      break;
    }
}

export {handle}