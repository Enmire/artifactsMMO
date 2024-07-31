//Use node fight_loop.js in the terminal for execute the script.
const server = 'https://api.artifactsmmo.com';
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IkVubWlyZSIsInBhc3N3b3JkX2NoYW5nZWQiOiIifQ.cl8WXsnJYZJ6c2zdGA4THQ_pliXXS4V2EBQxkkbwoXo";
let cooldown;
let timeout;
const character = process.argv[2]
console.log(character)
  
//This script is an example of how to loop each time cooldown is complete.
async function performFight() {
    const url = server + '/my/' + character + '/action/fight';
  
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
    };
  
    return fetch(url, {
      method: 'POST',
      headers: headers,
    }).then((fightResponse) => {
      if (fightResponse.status === 498) {
        console.log('The character cannot be found on your account.');
        return;
      }
      else if (fightResponse.status === 497) {
        console.log("Your character's inventory is full.");
        return;
      }
      else if  (fightResponse.status === 499) {
        console.log('Your character is in cooldown.');
        return;
      }
      else if (fightResponse.status === 598) {
        console.log('No monster on this map.');
        return;
      }
      else if (fightResponse.status !== 200) {
        console.log('An error occurred during the fight.');
        return;
      }
  
      if (fightResponse.status === 200) {
        fightResponse.json().then((data) => {
              console.log('The fight ended successfully. ' + character + ' has ' + data.data.fight.result +'.');
              cooldown = data.data.cooldown.totalSeconds;
              setTimeout(performFight, cooldown * 1000);
        });
  
      }
        });
  }
  
  
performFight  ()
  