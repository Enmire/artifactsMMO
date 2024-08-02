const server = 'https://api.artifactsmmo.com';
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Bearer ' + process.env.TOKEN
}

function getCharInfo(character) {
    console.log(`Getting character info for ${character}.`)

    const url = `${server}/characters/${character}`
    const options = {
      method: 'GET',
      headers
    }

    return fetch(url, options)
        .then(res => res.json())
        .then(data => data.data)
        .catch((error) => console.log(error))
}

function getAllMaps(contentCode,  contentType) {
    if(!contentCode && !contentType)
      throw new Error("getAllMaps must be passed contentCode or contentType.");
  
    let url = `${server}/maps/?page=1&size=100`
  
    if(contentCode)
      url += `&content_code=${contentCode}`
    if(contentType)
      url += `&content_type=${contentType}`
  
    const options = {
      method: 'GET',
      headers
    }
  
    return fetch(url, options)
        .then(res => res.json())
        .then(data => data.data)
        .catch((error) => console.log(error))
  }

function getItemInfo(itemCode) {
    console.log(`Getting item info for ${itemCode}.`)

    const url = `${server}/items/${itemCode}`
    const options = {
      method: 'GET',
      headers
    }

    return fetch(url, options)
        .then(res => res.json())
        .then(data => data.data)
        .catch((error) => console.log(error))
}

function postAction(character, action, body) {
    const url = `${server}/my/${character}/action/${action}`
    const options = {
      method: 'POST',
      headers,
      body
    };

    console.log(`Sending ${action} request...`)
    return fetch(url, options)
        .catch((error) => console.log(error))
}

export {getCharInfo, getAllMaps, getItemInfo, postAction}