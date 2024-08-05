const error_messages = {
  404: "Item not found.",
  478: "Missing item or insufficient quantity in your inventory.",
  485: "The item is already equipped.",
  486: "An action is already in progress.",
  490: "Character already at destination.",
  491: "Slot is empty.",
  493: "The resource is too high-level for your character.",
  496: "Character level is not high enough.",
  497: "Your character's inventory is full.",
  498: "The character cannot be found on your account.",
  499: "Your character is in cooldown.",
  598: "Resource not found on this map."
}

// For functions that assist in making actions.
function commandToCode(command) {
  switch(command) {
    case "ash":
      return "ash_tree"
    case "spruce":
      return "spruce_tree"
    case "birch":
      return "birch_tree"
    case "dead":
      return "dead_tree"
    case "copper":
      return "copper_rocks"
    case "iron":
      return "iron_rocks"
    case "coal":
      return "coal_rocks"
    case "gold":
      return "gold_rocks"
    case "gudgeon":
      return "gudgeon_fishing_spot"
    case "shrimp":
      return "shrimp_fishing_spot"
    case "trout":
      return "trout_fishing_spot"
    case "bass":
      return "bass_fishing_spot"
    default:
      throw new Error("The command does not match valid action.")
  }
}

function inventoryTotal(charData) {
  return charData.inventory.reduce((acc, slot) => slot.quantity + acc, 0)
}

function delay(delayInMs) {
  return new Promise(resolve => setTimeout(resolve, delayInMs));
};

export {commandToCode, inventoryTotal, delay}