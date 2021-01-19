import firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyBiZUU-Gux0EK67ty6tgu2tvT_V1bKyfV4",
    authDomain: "quizapp-1fafd.firebaseapp.com",
    databaseURL: "https://quizapp-1fafd-default-rtdb.firebaseio.com",
    projectId: "quizapp-1fafd",
    storageBucket: "quizapp-1fafd.appspot.com",
    messagingSenderId: "389446420177",
    appId: "1:389446420177:web:eaf36c2f4d874ca5f6a7f0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase;
