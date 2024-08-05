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
function commandToItem(command) {
  switch(command) {
    case "ash":
      return "ash_wood"
    case "spruce":
      return "spruce_wood"
    case "birch":
      return "birch_wood"
    case "dead":
      return "dead_wood"
    case "copper":
      return "copper_ore"
    case "iron":
      return "iron_ore"
    case "coal":
      return "coal"
    case "gold":
      return "gold"
    case "gudgeon":
      return "gudgeon"
    case "shrimp":
      return "shrimp"
    case "trout":
      return "trout"
    case "bass":
      return "bass"
    default:
      throw new Error("The command does not match valid item.")
  }
}

function inventoryTotal(charData) {
  return charData.inventory.reduce((acc, slot) => slot.quantity + acc, 0)
}

function delay(delayInMs) {
  return new Promise(resolve => setTimeout(resolve, delayInMs));
};

export {commandToItem, commandToCode, inventoryTotal, delay}