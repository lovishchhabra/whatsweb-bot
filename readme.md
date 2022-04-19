# Whatsweb-Bot

This is an implementation of WhatsApp-web.js which  has been customised for sample needs.

## Prerequisites

Latest Node.js is required

## Installation


Use command line to setup the app in the given folder

#### To Setup Dependencies
```bash
npm run setup 
```
#### To Start App
```bash
npm start
```

## Usage

```javascript

const mysql = require('mysql2');

const axios = require('axios').default;

const { Client, List, LocalAuth, MessageMedia} = require('whatsapp-web.js');

const qrcode = require("qrcode-terminal");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false, args: ["--no-sandbox"] }
});

client.initialize();
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});
client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});
client.on('auth_failure', msg => {
console.error('AUTHENTICATION FAILURE', msg);
});
client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {
console.log('MESSAGE RECEIVED', msg.body, msg.from);
if(msg.body === "demo"){msg.reply("Demo has started");
if(msg.body === "start"){client.sendMessage("This is Start");
}
);

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

process.on("SIGINT", async () => {
    console.log("(SIGINT) Shutting down...");
    await client.destroy();
    process.exit(0);
});

```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
