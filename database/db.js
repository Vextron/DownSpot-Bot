const admin = require('firebase-admin');

const service_account = require('./firestore.json');

//admin.firestore().settings({timestampsInSnapshots: true});

admin.initializeApp({

    credential: admin.credential.cert(service_account)
});
  
const db = admin.firestore();

module.exports = {db: db};