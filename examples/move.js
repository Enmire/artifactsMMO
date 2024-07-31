//Use node index.js in the terminal for execute the script.
const server = 'https://api.artifactsmmo.com';
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IkVubWlyZSIsInBhc3N3b3JkX2NoYW5nZWQiOiIifQ.cl8WXsnJYZJ6c2zdGA4THQ_pliXXS4V2EBQxkkbwoXo";
const character = process.argv[2]
const x = process.argv[3]
const y = process.argv[4]
console.log(character)
  
async function movement() {
      
  const url = server + '/my/' + character + '/action/move';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: '{"x":' + x + ',"y":' + y + '}' //change the position here
  };
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
  }
  
movement();