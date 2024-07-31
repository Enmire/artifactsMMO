//Use node deposit_bank_golds.js in the terminal for execute the script.
const server = 'https://api.artifactsmmo.com';
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IkVubWlyZSIsInBhc3N3b3JkX2NoYW5nZWQiOiIifQ.cl8WXsnJYZJ6c2zdGA4THQ_pliXXS4V2EBQxkkbwoXo";
const character = process.argv[2]
console.log(character)
  
async function depositBank() {
      
  const url = server + '/my/' + character +'/action/bank/deposit/gold';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: '{"quantity":0}' //change quantity here
  };
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
  }
  
depositBank();
  