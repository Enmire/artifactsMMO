//Use node crafting.js in the terminal for execute the script.
const server = 'https://api.artifactsmmo.com';
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IkVubWlyZSIsInBhc3N3b3JkX2NoYW5nZWQiOiIifQ.cl8WXsnJYZJ6c2zdGA4THQ_pliXXS4V2EBQxkkbwoXo";
const character = process.argv[2]
console.log(character)
  
async function crafting() {
      
  const url = server + '/my/' + character +'/action/crafting';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: '{"code":"ITEM", "quantity":1}' //change the item code here
  };
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
  }
  
crafting();
  