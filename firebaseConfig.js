// Remove Firebase imports
// import { initializeApp } from "firebase/app";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { getFirestore, doc, setDoc } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyDKoo6E4nw2mzWyP8tU0opRlEF_FTMRJAA",
//   authDomain: "color-project-2025.firebaseapp.com",
//   projectId: "color-project-2025",
//   storageBucket: "color-project-2025.appspot.com",
//   messagingSenderId: "543232256315",
//   appId: "1:543232256315:web:48ea18f42333d0a4f5ef1e",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);

// Function to sign up a new user
// export const signUp = async (email, password) => {
//   try {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;
//     // Save user data to Firestore
//     await setDoc(doc(db, "users", user.uid), {
//       email: user.email,
//       createdAt: new Date(),
//     });
//     console.log("User signed up:", user);
//   } catch (error) {
//     console.error("Error signing up:", error);
//   }
// };

// Function to log in an existing user
// export const logIn = async (email, password) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;
//     console.log("User logged in:", user);
//   } catch (error) {
//     console.error("Error logging in:", error);
//   }
// }; 