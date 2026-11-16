const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // On production (Render), parse the JSON string from the environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // On local machine, fall back to the local JSON file
    const serviceAccountPath = path.join(__dirname, '..', 'binge-buddies-17abf-firebase-adminsdk-fbsvc-5a1483fc6e.json');
    serviceAccount = require(serviceAccountPath);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('Firebase Admin initialized successfully');
} catch (err) {
  console.error('Failed to initialize Firebase Admin:', err.message);
}

const db = admin.firestore();

module.exports = { admin, db };