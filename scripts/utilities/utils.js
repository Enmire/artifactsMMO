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

function areSlotsAvailable(charData, slots) {
  return inventoryTotal(charData) > charData.inventory_max_items - slots
}

function isInventoryFull(charData) {
  return inventoryTotal(charData) === charData.inventory_max_items
}

function delay(delayInMs) {
  return new Promise(resolve => setTimeout(resolve, delayInMs));
};

export {commandToCode, inventoryTotal, areSlotsAvailable, isInventoryFull, delay}