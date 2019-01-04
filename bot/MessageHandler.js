const { handler_spot, link } = require('./Spotify');

function handler(message) {

    const split_message = message.content.split(" ");
    const command = split_message[0];
    const args = split_message.splice(1);

    switch (command) {

        case "$linkSpotify":
            
            link(message);
            break;

        case "$spotify":

            handler_spot(args, message);
            break;
    
        default:
            break;
    }
    
}

module.exports = {

    handler: handler
}