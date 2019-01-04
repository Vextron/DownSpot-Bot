const EXPIRE_TIME = 3600000;

const SpotifyWebApi = require('spotify-web-api-node');
const { db } = require('../database/db');
const { client_id, client_secret } = require('../config.json');

const scopes = ['user-top-read'];
const showDialog = true;

const credentials = {

  clientId : process.env.CLIENTID || client_id,
  clientSecret : process.env.CLIENTSECRET || client_secret,
  redirectUri : 'http://localhost:8080/discord'
}

let spotifyApi = new SpotifyWebApi(credentials);

function handler(args, message) {

    const flag = args[0];
    const arg = args[1];

    switch (flag) {
        case "--top" || "-t":
            
            top(arg, message);
            break;
    
        default:
            break;
    }
}

function top(type, message) {

    
    if (type == 'artist') {

        get_top_artists(message.author.id, message);
    }
}

function link(message) {
    
    const response = check_database(message.author.id);

    response.then( doc => {

        if (doc.exists) {

            if ((Date.now() - doc.data().set_time) > EXPIRE_TIME) {

                message.reply("Your token has expired! Refreshing...")

                refresh_access_token(doc.data(), message.author.id)
            }

            else message.reply("You have a token!")
                
        }

        else message.reply(get_auth_url(message.author.id));
    })
        
}

function get_auth_url(state) {

    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, showDialog);

    return authorizeURL;
}

async function check_database(doc) {

    let doc_ref = db.collection('SpotifyUser').doc(doc);

    return await doc_ref.get();
}

async function update_access_token(new_access_token, doc) {
    
    db.collection('SpotifyUser').doc(doc).update({access_token: new_access_token, set_time: Date.now()});
}

function refresh_access_token(data, id) {

    spotifyApi.setRefreshToken(data.refresh_token)

    spotifyApi.refreshAccessToken().then( data => {

        update_access_token(data.body['access_token'], id)

        spotifyApi.resetRefreshToken();

    }).catch( e => {

        console.log(e);
        
        get_auth_url(id);
    })
}

async function get_user(doc) {

   let doc_ref = db.collection('SpotifyUser').doc(doc);

   return await doc_ref.get();
}

function save_user(auth_code, discord_id) {

    spotifyApi.authorizationCodeGrant(auth_code).then( data => {
        
        const user = { 

            discord_id: discord_id,
            access_token: data.body['access_token'],
            refresh_token: data.body['refresh_token'],
            set_time: Date.now(),
            valid: true
        }

        db.collection('SpotifyUser').doc(discord_id).set(user)

    }).catch( err => {

        console.log('Something went wrong when retrieving the access token!', err.message);
    });
}

function get_top_artists(discord_id, message) {

    let response = get_user(discord_id);

    response.then( data => {

        spotifyApi.setAccessToken(data.data().access_token);

        spotifyApi.getMyTopArtists().then( artists => {

            let top_response = ``;

            artists.body.items.forEach( (artist, index) => {
                
                console.log(artist.name, index);
                top_response += `[${index + 1}] - ${artist.name}\n`
            });

            message.reply(top_response)
        }).catch( err => {

            console.log(err);
            
        })
    })
}

module.exports = {
    
    handler_spot: handler,

    link: link,

    save_user: save_user,
}
