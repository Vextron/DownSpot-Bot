const express = require('express');

const { client_id, client_secret, youtube_key, bot_token } = require('./config.json');

const path = require('path');

const SpotifyWebApi = require('spotify-web-api-node');
const YouTube = require('simple-youtube-api');
const Discord = require('discord.js');

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

const youtube = new YouTube(process.env.YTAPI || youtube_key);

const scopes = ['user-top-read'];
const showDialog = true;

const credentials = {
  clientId : process.env.CLIENTID || client_id,
  clientSecret : process.env.CLIENTSECRET || client_secret,
  redirectUri : 'http://localhost:8080/discord'
}

var spotifyApi = new SpotifyWebApi(credentials);

const app = express();

const port = (process.env.PORT || 8080);

app.use(express.static(__dirname + '/client'));

app.get('/discord', (req, res) => {

    const authorizationCode = req.query.code;
  
    spotifyApi.authorizationCodeGrant(authorizationCode).then(function(data) {

        console.log(`Your access token is ${data.body['access_token']} and your refresh token is ${data.body['refresh_token']}`)

    }, function(err) {

        console.log('Something went wrong when retrieving the access token!', err.message);
    });

    res.sendFile(__dirname + '/client/index.html')
});

function get_auth_url() {

    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, null, showDialog);

    return authorizeURL;
}

client.on('message', (message) => {

    if (!message.author.bot) message.reply(get_auth_url());
})

client.login(bot_token);

app.listen(port, () => console.log("Running on port " + port))
