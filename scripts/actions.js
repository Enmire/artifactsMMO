// Actions to be used by other scripts.
import 'dotenv/config'
import * as helpers from './helpers.js'
import * as requests from './requests.js'

async function getClosestTileForCommand(command, x, y) {
  const data = await requests.getAllMaps(helpers.commandToCode(command))
  let closestIndex
  let currentDistance
  let highestDistance = 17

  for(let i = 0; i < data.length; i++) {
    currentDistance = Math.max(Math.abs(x - data[i].x),Math.abs( y - data[i].y))
    if(currentDistance < highestDistance) {
      closestIndex = i
    }
  }

  return data[closestIndex]
}

async function move(character, x, y) {
    const body = `{"x":${x},"y":${y}}`
    let status
    

    await requests.postAction(character, "move", body)
        .then(res => {
          status = res.status
          return res.json()
        })
        .then(async data => {
          if(status === 200) {
            console.log(`Move to ${x}, ${y} complete with status of ${status}. Cooldown: ${data.data.cooldown.totalSeconds}s.`)
            await delay(data.data.cooldown.totalSeconds * 1000)
          }
          else
          console.log(`Move to ${x}, ${y} failed with status: ${status}.`)
        })
        .catch((error) => console.log(error))

    return status
}

async function gather(character) {
    let status

    await requests.postAction(character, "gathering")
        .then(res => {
            status = res.status
            return res.json()
        })
        .then(async data => {
          if(status === 200) {
            console.log(`Gathering complete with status of ${status}. Cooldown: ${data.data.cooldown.totalSeconds}s`)
            await delay(data.data.cooldown.totalSeconds * 1000)
          }
          else
            console.log(`Gathering failed with status: ${status}.`)
        })
        .catch((error) => console.log(error))

    return status
}

async function craft(character, code, quantity) {
  if(!code && !quantity)
    throw new Error("Craft must be passed code and quantity.");

  const body = `{"code": "${code}", "quantity": ${quantity}}`
  let status

  await requests.postAction(character, "crafting", body)
      .then(res => {
          status = res.status
          return res.json()
      })
      .then(async data => {
        if(status === 200) {
          console.log(`Crafting complete with status of ${status}. Cooldown: ${data.data.cooldown.totalSeconds}s`)
          await delay(data.data.cooldown.totalSeconds * 1000)
        }
        else
          console.log(`Crafting of ${quantity} ${code} failed with status: ${status}.`)
      })
      .catch((error) => console.log(error))

  return status
}

async function fight() {
  let status

  await requests.postAction(character, "fight")
      .then(res => {
          status = res.status
          return res.json()
      })
      .then(async data => {
        if(status === 200) {
          console.log(`Fighting complete with status of ${status}. Cooldown: ${data.data.cooldown.totalSeconds}s`)
          await delay(data.data.cooldown.totalSeconds * 1000)
        }
        else
          console.log(`Fighting failed with status: ${status}.`)
      })
      .catch((error) => console.log(error))

  return status
}

async function deposit(character, item, quantity) {
    const action = "bank/deposit";
    const body = `{"code":"${item}","quantity":${quantity}}`
    let status


    await requests.postAction(character, action, body)
        .then(res => {
          status = res.status
          return res.json()
        })
        .then(async data => {
          if(status === 200) {
            console.log(`Deposit of ${quantity} ${item} complete with status of ${status}. Cooldown: ${data.data.cooldown.totalSeconds}s.`)
            await delay(data.data.cooldown.totalSeconds * 1000)
          }
          else
            console.log(`Deposit of ${quantity} ${item} failed with status: ${status}.`)
        })
        .catch((error) => console.log(error))

    return status
}

async function depositAll(character) {
    const charData = await requests.getCharInfo(character)
    console.log("Character info for depositAll received.\n")

    for(const slot of charData.inventory) {
      if(slot.quantity > 0) {
        console.log(`Depositing ${slot.code}...`)
        await deposit(character, slot.code, slot.quantity)
      }
    }
}

async function withdraw(character, item, quantity) {
  const action = "bank/withdraw"
  const body = `{"code":"${item}","quantity":${quantity}}`
  let status

  await requests.postAction(character, action, body)
        .then(res => {
          status = res.status
          return res.json()
        })
        .then(async data => {
          if(status === 200) {
            console.log(`Withdrawal of ${quantity} ${item} complete with status of ${status}. Cooldown: ${data.data.cooldown.totalSeconds}s.`)
            await delay(data.data.cooldown.totalSeconds * 1000)
          }
          else
            console.log(`Withdrawal of ${quantity} ${item} failed with status: ${status}.`)
        })
        //.catch((error) => console.log(error))

    return status
}

async function withdrawAll(character, itemArray) {
  for(const item of itemArray) {
    await withdraw(character, item.code, item.quantity)
  }
}

function delay(delayInMs) {
    return new Promise(resolve => setTimeout(resolve, delayInMs));
};

function inventoryTotal(charData) {
    return charData.inventory.reduce((acc, slot) => slot.quantity + acc, 0)
}

export {getClosestTileForCommand, move, gather, craft, fight, deposit, depositAll, withdrawAll, delay, inventoryTotal}