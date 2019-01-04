const express = require('express');

const YouTube = require('simple-youtube-api');
const Discord = require('discord.js');

const { youtube_key, bot_token } = require('./config.json');
const { save_user } = require('./bot/Spotify');
const { handler } = require('./bot/MessageHandler');

const path = require('path');

const client = new Discord.Client();

client.on('ready', () => {

  console.log(`Logged in as ${client.user.tag}!`);
});

const youtube = new YouTube(process.env.YTAPI || youtube_key);

const app = express();

const port = (process.env.PORT || 8080);

app.use(express.static(__dirname + '/client'));

app.get('/discord', (req, res) => {

    const authorizationCode = req.query.code;
    const discord_id = req.query.state;
  
    save_user(authorizationCode, discord_id);

    res.sendFile(__dirname + '/client/index.html')
});

client.on('message', (message) => {

    if (!message.author.bot) {

        handler(message);
    }
})

client.login(bot_token);

app.listen(port, () => console.log("Running on port " + port))
