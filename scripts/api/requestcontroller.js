import 'dotenv/config'
import * as utils from '../utilities/utils.js'

const server = 'https://api.artifactsmmo.com';
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Bearer ' + process.env.TOKEN
}
const getOptions = {
  method: 'GET',
  headers
}

async function getRequest (url) {
  url = `${server}${url}`

  return await callWithRetry(fetch, [url, getOptions])
    .then(async res => {
      let returnBody
      if(res.status === 200) {
        returnBody = await res.json().then(data => data.data)
        console.log(`Request to ${url} complete. Status: ${res.status}.`)
      }
      else
        console.log(`Request to ${url} failed. Status: ${res.status}.`)
      return returnBody
    })
    .catch((error) => console.log(error))
}

async function getRequestPaged (url) {
  let returnData = []

  url = new URL(`${server}${url}`)
  url.searchParams.append("page", 1)
  url.searchParams.append("size", 1)

  const pages =  await callWithRetry(fetch, [url, getOptions])
    .then(res => res.json())
    .then(data => Math.ceil(data.total/100))
    .catch((error) => console.log(error))

  url.searchParams.set("size", 100)

  for(let i = 1; i <= pages; i++) {
    url.searchParams.set("page", i)

    await callWithRetry(fetch, [url, getOptions])
    .then(async res => {
      if(res.status === 200) {
        await res.json().then(data => returnData.push(...data.data))
        console.log(`Request to ${url} complete. Status: ${res.status}.`)
      }
      else
        console.log(`Request to ${url} failed. Status: ${res.status}.`)
    })
    .catch((error) => console.log(error))
  }

  return returnData
}

async function postRequest(character, action, body) {
  const url = `${server}/my/${character}/action/${action}`
  const postOptions = {
    method: 'POST',
    headers,
    body
  };
  let logString = `Request to ${url}`

  if(body !== undefined)
    logString += ` with body: ${body}`

  return await callWithRetry(fetch, [url, postOptions])
    .then(async res => {
      const status = res.status
      let body
      if(status === 200) {
        body = await res.json()
        const cooldown = body.data.cooldown.total_seconds
        console.log(`${logString} complete. Status: ${status}. Cooldown: ${cooldown}s.`)
        await utils.delay(cooldown * 1000)
      }
      else
        console.log(`${logString} failed. Status: ${status}.`)
      return {status, body}
    })
    .catch((error) => console.log(error))
}

async function callWithRetry(fn, args, retries = 0) {
  return await fn.apply(this, args)
    .catch(async error => {
      if(retries > 12) {
        console.log(`Http request to ${args[0]} has reached maximum retries of ${retries}.`)
        throw error
      }
      const delay = 2 ** retries * 1000
      console.log(`Http request to ${args[0]} failed. Retry count: ${retries}. Retrying after ${delay/1000}s...`)
      await utils.delay(delay)
      return callWithRetry(fn, args, retries + 1)
    })
}

export {getRequest, getRequestPaged, postRequest}