// your-firebase-config.js

import { initializeApp } from 'firebase/app';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzTbyNeS32kuq0zkq5N-RIB-q0GAQESko",
  authDomain: "iot-d601d.firebaseapp.com",
  databaseURL: "https://iot-d601d-default-rtdb.firebaseio.com",
  projectId: "iot-d601d",
  storageBucket: "iot-d601d.appspot.com",
  messagingSenderId: "978468410705",
  appId: "1:978468410705:web:8865f490d399f54dba6f70",
  measurementId: "G-FLQQMDGSWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
