import * as utils from './utils.js'

const server = 'https://api.artifactsmmo.com';
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Bearer ' + process.env.TOKEN
}

async function getRequest (url) {
  url = `${server}${url}`
  const options = {
    method: 'GET',
    headers
  }

  return await callWithRetry(fetch, [url, options])
    .then(res => res.json())
    .then(data => data.data)
    .catch((error) => console.log(error))
}

async function postRequest(character, action, logString, body) {
  const url = `${server}/my/${character}/action/${action}`
  const options = {
    method: 'POST',
    headers,
    body
  };
  let status

  console.log(`Sending ${action} request...`)
  await callWithRetry(fetch, [url, options])
    .then(res => {
      status = res.status
      return res.json()
    })
    .then(async data => {
      if(status === 200) {
        console.log(`${logString} complete with status of ${status}. Cooldown: ${data.data.cooldown.total_seconds}s.`)
        await utils.delay(data.data.cooldown.total_seconds * 1000)
      }
      else
        console.log(`${logString} failed with status: ${status}.`)
    })
    .catch((error) => console.log(error))

  return status
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

export {getRequest, postRequest}