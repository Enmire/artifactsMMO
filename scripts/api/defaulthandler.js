import * as actions from '../actions/actions.js'

function getErrorMessage(status) {
  switch(status) {
    case 200:
      return "Remember to cover the success case."
    case 404:
      return "Item not found."
    case 478:
      return "Missing item or insufficient quantity in your inventory."
    case 485:
      return "The item is already equipped."
    case 486:
      return "Character is locked. An action is already in progress."
    case 490:
      return "Character already at destination."
    case 491:
      return "Slot is empty."
    case 493:
      return "The resource is too high-level for your character."
    case 496:
      return "Character level is not high enough."
    case 497:
      return "Your character's inventory is full."
    case 498:
      return "The character cannot be found on your account."
    case 499:
      return "Your character is in cooldown."
    case 598:
      return "Resource not found on this map."
    default:
      return "No error message."
  }
}

async function handle(character, status, loop, actionTile) {
  switch(status) {
    case 200:
    case 404:
    case 478:
    case 485:
    case 490:
    case 491:
    case 493:
    case 498:
    case 598:
      console.log(`Character: ${character}. Status: ${status}. Action: ${loop.name}. ${getErrorMessage(status)}. Exiting.`)
      break;
    case 497:
      console.log(`Character: ${character}. Status: ${status}. Action: ${loop.name}. ${getErrorMessage(status)}. Depositing as a fallback.`);
      await actions.waitSeconds(5)
      const response = await actions.bankAndDeposit(character)
      await actions.move(character, actionTile, response.data.character)
      loop()
      break;
    default:
      console.log(`Character: ${character}. Status: ${status}. Action: ${loop.name}. ${getErrorMessage(status)} Waiting 5s and retrying...`)
      await actions.waitSeconds(5)
      loop()
      break;
    }
}

export {handle}