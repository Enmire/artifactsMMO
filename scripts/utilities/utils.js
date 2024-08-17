// For functions that assist in making requests.
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

function materialsPerItem(itemData) {
  let totalMaterials = 0
  itemData.item.craft.items.forEach(item => {
    totalMaterials += item.quantity
  })

  return totalMaterials
}

function maxCraftablePerInventory(charData, itemData) {
  return Math.floor(charData.inventory_max_items / materialsPerItem(itemData))
}

function totalCraftableInItemArray(itemArray, itemData) {
  let amountCraftablePerMaterial = []

  itemData.item.craft.items.forEach(item => {
      const filteredInventory = itemArray.filter(slot => item.code === slot.code)
      if(filteredInventory.length > 0)
          amountCraftablePerMaterial.push(Math.floor(filteredInventory[0].quantity / item.quantity))
      else
          amountCraftablePerMaterial.push(0)
  })

  return Math.min(...amountCraftablePerMaterial)
}

function recycledPerItem(itemData) {
  return 1 + Math.floor((materialsPerItem(itemData) - 1) / 5)
}

function maxRecyclable(charData, itemData) {
  return Math.floor(charData.inventory_max_items / recycledPerItem(itemData))
}

function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function delay(delayInMs) {
  return new Promise(resolve => setTimeout(resolve, delayInMs));
};

export {
  commandToCode,
  inventoryTotal,
  areSlotsAvailable,
  isInventoryFull,
  maxCraftablePerInventory,
  totalCraftableInItemArray,
  maxRecyclable,
  isValidJson,
  delay
}