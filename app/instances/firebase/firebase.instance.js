// ----------------------------------------------
// $app/instances/firebase
// firebase.instances.js
// ----------------------------------------------
// Firebase instance.
// Here we export the instance of Firebase.

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { firebaseConfig } from "$app/config/index.js";

const firebase = initializeApp(firebaseConfig.firebaseConfig);
const analytics = getAnalytics(firebase);

export { firebase, analytics };
