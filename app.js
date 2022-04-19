//import mysql2 instead of mysql because it doesnt support new login
const mysql = require('mysql2');
//import axios to run xhr
const axios = require('axios').default;

//create client from whatsapp-web.js
const { Client, List, LocalAuth, MessageMedia} = require('whatsapp-web.js');
const qrcode = require("qrcode-terminal");
//connect the db
// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "lovish"
// });
// //check db connection
// con.connect(function (err) {
//     if (err) throw err;
//     console.log("db connected!!!");
// });
//start whatsapp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false, args: ["--no-sandbox"] }
    // agrs headless can be changed to true if dont want chromium to popup
});


client.initialize();
//create list of options to be displayed
const options = new List(
    "Please Select Options from Below ",
    "View all Options",
    [
        {
            title: "Select Options",
            rows: [
                { id: "products", title: "Check Products" },
                { id: "status1", title: "Check Status from axios" },
                { id: "status2", title: "Check Status from sql" },
                { id: "cancel", title: "Cancel Order" },
                { id: "return", title: "Return Order" },
                { id: "about", title: "About" },
                { id: "resume", title: "Resume"}
                
            ],
        },
    ]
);
//list of products
const productsList = new List(
    "Please Select Category from Below ",
    "View all Categories",
    [
        {
            title: "Select Categories",
            rows: [
                { id: "product1", title: "Drone" },
                { id: "product2", title: "GoPro" },
                { id: "product3", title: "Ipad" },
                { id: "product4", title: "Laptop" },
                { id: "product5", title: "Nest" },
                { id: "mp3", title: "Sample MP3"},
                { id: "home", title: "Home" },
            ],
        },
    ]
    );
//show qr code for login
client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    qrcode.generate(qr, { small: true });
    // console.log('QR RECEIVED', qr);
});
//confirm login
client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});
//failure to login
client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});
//confirm client is ready
client.on('ready', () => {
    console.log('READY');
});
//in case of message recd.
client.on('message', async msg => {
    let namedb = msg.from;
    let name = namedb.split('@')[0];
    let trim = msg.body.toLocaleLowerCase();
    let body = trim.replace(/ /g,"");
    //check status of the order from sql
    // this has been disabled as sql is running on localhost and a replica is hosted on jsonbin.io and is linked using axios
    // function statusdb() {
    //     con.connect(function (err) {
    //         if (err) throw err;
    //         con.query(`SELECT * FROM users.users WHERE name like ${name}`, function (err, result) {
    //             if (err) throw err;
    //             console.log(result[0]);
    //             console.log(result[0].status);
    //             msg.reply(`Current Status : ${result[0].status}`);
    //         });
    //     });
    // };
    const img = await MessageMedia.fromUrl(`https://productsimag.s3.ap-south-1.amazonaws.com/${body}.jpg`);
    const pdf = await MessageMedia.fromUrl(`https://productsimag.s3.ap-south-1.amazonaws.com/${body}.pdf`);
    const mp3 = await MessageMedia.fromUrl(`https://productsimag.s3.ap-south-1.amazonaws.com/${body}.mp3`);
    
    //function to check status of order based on their phone number using axios

    async function statuscheck() {
        console.log("axios fired");
        
        try {
            //handle response
            const resp = await axios.get('https://api.jsonbin.io/b/625172d4d8a4cc06909e3ec6/latest')
            console.log(resp.data);
            let data = resp.data
            for (var names in data) {
                if (names === namedb) {
                    console.log(names);
                    console.log(data[namedb]);
                    msg.reply(`Current Status : ${data[namedb]}`);
                }
            }
        }
        catch (error) {
            // handle error
            console.log(error);
        }
    };

    //show the message
    console.log('MESSAGE RECEIVED', body, name);
    //check for message content and reply accordingly
    if (body === "start" || body === "hi" || body === "hello") { client.sendMessage(msg.from, options) };
    if (body === "checkproducts") { client.sendMessage(msg.from, productsList) }
    if (body === "checkstatusfromaxios") { statuscheck() }
    if (body === "checkstatusfromsql") { msg.reply("this has been disabled as sql is running on localhost and a replica is hosted on jsonbin.io and is linked using axios") }
    if (body === "cancelorder") { msg.reply("Cancelling Your Order....") }
    if (body === "returnorder") { msg.reply("Returning Your Order....") }
    if (body === "about") { msg.reply("This is an automated bot reply to Whatsapp Messages using Javascript and NodeJs") }
    if (body === "home" || body === "back") { client.sendMessage(msg.from, options); }
    if (body === "drone") { msg.reply(img) }
    if (body === "gopro") { msg.reply(img) }
    if (body === "ipad") { msg.reply(img) }
    if (body === "laptop") { msg.reply(img) }
    if (body === "nest") { msg.reply(img) }
    if (body === "resume") { msg.reply(pdf) }
    if (body === "samplemp3"){msg.reply(mp3)}
}
);

//output reason if client got disconnected
client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});
//confirm exit from process
process.on("SIGINT", async () => {
    console.log("(SIGINT) Shutting down...");
    await client.destroy();
    process.exit(0);
});