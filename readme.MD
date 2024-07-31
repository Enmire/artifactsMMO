# ArtifactsMMO

## Contents

- [AuthToken](#authtoken)
- [Running a Script](#running-a-script)

## AuthToken

The Actions.js script requires your accounts AuthToken to make its requests. Go to the [ArtifactsMMO website](https://artifactsmmo.com/) and create an account. Once created, click on Account in the top right, and there you'll find your token. Place this in a .env file in the root directory of this project with a variable named:
```js
TOKEN = <YOUR_AUTH_TOKEN>
```

## Running a SCript

Scripts currently only require one console input, which is the character name. Example:
```bash
node scripts/wood_bank_run.js Aerin
```