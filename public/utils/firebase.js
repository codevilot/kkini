// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCxUWiOdQa_0eTMZe6r7sbnLMpjiVCuxEw',
  authDomain: 'eat-it-6f7b8.firebaseapp.com',
  projectId: 'eat-it-6f7b8',
  storageBucket: 'eat-it-6f7b8.appspot.com',
  messagingSenderId: '457186226254',
  appId: '1:457186226254:web:d444e7ba201025bb97531f',
  measurementId: 'G-8ESSYEFJEW',
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
