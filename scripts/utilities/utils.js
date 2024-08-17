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
  return inventoryTotal(charData) <= charData.inventory_max_items - slots
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

function consumableSlotEquipped(charData, itemCode) {
  if(charData.consumable1_slot === itemCode)
    return "consumable1"
  else if(charData.consumable2_slot === itemCode)
    return "consumable2"
  else
    return null
}

function equipmentToSlotArray(charData, itemDataArray) {
  let returnData = []
  const singleSlotEquipment = itemDataArray.filter(itemData => itemData.item.type !== "ring" && itemData.item.type !== "consumable" && itemData.item.type !== "artifact")
  const ringEquipment = itemDataArray.filter(itemData => itemData.item.type === "ring")
  const consumableEquipment = itemDataArray.filter(itemData => itemData.item.type === "consumable")
  const artifactEquipment = itemDataArray.filter(itemData => itemData.item.type === "artifact")
  console.log(ringEquipment)

  let singleSlotEquipmentSet = new Set()
  singleSlotEquipment.forEach(itemData => {
    if(singleSlotEquipmentSet.has(itemData.item.type))
      throw new Error(`Equipment array cannot contain more than one ${itemData.item.type}.`)
    singleSlotEquipmentSet.add(itemData.item.type)
  })

  if(ringEquipment.length > 2)
    throw new Error("Equipment array cannot contain more than two rings.")

  if(consumableEquipment.length > 2)
    throw new Error("Equipment array cannot contain more than two consumables.")

  if(artifactEquipment.length > 3)
    throw new Error("Equipment array cannot contain more than three artifacts.")

  singleSlotEquipment.forEach(itemData => {
    if(charData[`${itemData.item.type}_slot`] !== itemData.item.code)
      returnData.push({code: itemData.item.code, slot: itemData.item.type})
  })
  
  const ringEquipmentCodes = ringEquipment.map(itemData => itemData.item.code)
  console.log(ringEquipmentCodes)

  if(ringEquipmentCodes.length === 1 && charData.ring1_slot !== ringEquipmentCodes[0] && charData.ring2_slot !== ringEquipmentCodes[0])
    returnData.push({code: ringEquipmentCodes[0], slot: "ring1_slot"})



  if(ringEquipment.length === 2) {
    const equippedRingCodes = [charData.ring1_slot, charData.ring2_slot]

    if(ringEquipmentCodes[0] !== ringEquipmentCodes[1]) {
      const isRingOneEquipped = equippedRingCodes.includes(ringEquipmentCodes[0])
      const isRingTwoEquipped = equippedRingCodes.includes(ringEquipmentCodes[1])

      if(!isRingOneEquipped && !isRingTwoEquipped) {
        returnData.push({code: ringEquipmentCodes[0], slot: "ring1"})
        returnData.push({code: ringEquipmentCodes[1], slot: "ring2"})
      }
      else if(!isRingOneEquipped && isRingTwoEquipped) {
        const indexOfEquippedRing = equippedRingCodes.indexOf(ringEquipmentCodes[1])
        returnData.push({code: ringEquipmentCodes[0], slot: `ring${indexOfEquippedRing === 0 ? 2 : 1}`})
      }
      else if(isRingOneEquipped && !isRingTwoEquipped) {
        const indexOfEquippedRing = equippedRingCodes.indexOf(ringEquipmentCodes[0])
        returnData.push({code: ringEquipmentCodes[1], slot: `ring${indexOfEquippedRing === 0 ? 2 : 1}`})
      }
    }
    else {
      if(ringEquipmentCodes[0] !== equippedRingCodes[0])
        returnData.push({code: ringEquipmentCodes[0], slot: "ring1"}) 
      if(ringEquipmentCodes[0] !== equippedRingCodes[1])
        returnData.push({code: ringEquipmentCodes[0], slot: "ring2"})
    }
  }

  for(let i = 0; i < consumableEquipment.length; i++) 
    returnData.push({code: consumableEquipment[i].item.code, slot: `consumable${i + 1}`})

  for(let i = 0; i < artifactEquipment.length; i++) {
    if(charData[`artifact${i + 1}_slot`] !== artifactEquipment[i].item.code)
      returnData.push({code: artifactEquipment[i].item.code, slot: `artifact${i + 1}`})
  }

  return returnData
}

function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function firstElement(array) {
  if(array.length < 1)
    return null
  return array[0]
}

function delay(delayInMs) {
  return new Promise(resolve => setTimeout(resolve, delayInMs));
}

export {
  commandToCode,
  inventoryTotal,
  areSlotsAvailable,
  isInventoryFull,
  maxCraftablePerInventory,
  totalCraftableInItemArray,
  maxRecyclable,
  consumableSlotEquipped,
  equipmentToSlotArray,
  isValidJson,
  firstElement,
  delay
}