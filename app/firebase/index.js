import admin from "firebase-admin";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccountPath = join(
  __dirname,
  "openhubble-cloud-firebase-adminsdk-fbsvc-f7101b78d2.json"
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export default admin;
