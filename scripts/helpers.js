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
        throw new Error("The command does not match valid action.")
    }
}

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

export {commandToItem, commandToCode}