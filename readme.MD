# ArtifactsMMO

## Contents

- [AuthToken](#authtoken)
- [Running a Script](#running-a-script)
    - [Craft](#craft)
    - [Fight](#fight)
    - [Gather](#gather)

## AuthToken

The Actions.js script requires your accounts AuthToken to make its requests. Go to the [ArtifactsMMO website](https://artifactsmmo.com/) and create an account. Once created, click on Account in the top right, and there you'll find your token. Place this in a .env file in the root directory of this project with a variable named:
```js
TOKEN = <YOUR_AUTH_TOKEN>
```

## Starting the Project

To get the node modules needed for the project to run, use the command:
```bash
npm i
```

## Running a Script

Each script require different console input.

### Craft

The craft script requires 3 inputs: the character name, the item code to craft, and the number of items to craft. Example:
```bash
node scripts/craft.js character item_code 100
```

### Fight

The fight script requires 2 inputs: the character name and the monster name to fight. Example:
```bash
node scripts/craft.js character monster
```

### Gather

The gather script requires 2 inputs: the character name and the item shorthand to gather. Example:
```bash
node scripts/craft.js character item
```

The accepted shorthand names are:
- ash
- spruce
- birch
- dead
- copper
- iron
- coal
- gold
- gudgeon
- shrimp
- trout
- bass