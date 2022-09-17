# growr-agent-sdk

### Still Experimental stage!

### No tests, not tested in production!

### WIP

## Architecture high overview

![Architecture](Growr%20Agent%20SDK.svg?style=flat)

## Install

`npm i growr-agent-sdk`

## Use

For resident Agent instance (services with fixexd PK) that starts with your app with Single Private key use: 

```js
const GrowrAgent = require('growr-agent-sdk')

// getInstance creates instance that stays in the memory
// On first run the command creates identity with PK and then uses it for operations.
// Use this to get same instance in different modules

const agent = await GrowrAgent.getInstance(agentConfig)

```

For agent for user use case (custodial service, using user personality with each call) use:

```js
const GrowrAgent = require('growr-agent-sdk')

// getAgent creates agent for the call with PK that is introduced for the usecase
// On every run, new identity is created, based on the PK in the agentConfig
// Use this to get same new agent every time it needs to be used

const agent = await GrowrAgent.getAgent(agentConfig)
```
