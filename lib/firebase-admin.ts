import admin from "firebase-admin";

if (!process.env.SERVICE_ACCOUNT) {
  throw new Error("Missing SERVICE_ACCOUNT environment variable");
}

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://disiplinkuapp-default-rtdb.firebaseio.com",
  });
}

export const db = admin.database();
export const auth = admin.auth();