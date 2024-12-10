// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, doc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCllhLyxXAUhbGMbkWmVD948EVNw9w-c2I",
  authDomain: "bitsworld-b8246.firebaseapp.com",
  projectId: "bitsworld-b8246",
  storageBucket: "bitsworld-b8246.appspot.com",
  messagingSenderId: "858881725519",
  appId: "1:858881725519:web:5631da7395f374fe76063a",
  measurementId: "G-XVQZF0Y7EF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
var user;

auth.onAuthStateChanged((u) => {
  if (!localStorage.getItem("rememberMe")) return;
  if (u) {
    console.log("user logged in");
    user = u;
    window.location.href = "play.html";
  } else {
    console.log("user not logged in");
  }
});

const registerBtn = document.getElementById("registerBtn");
registerBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailRegister").value;
  const password = document.getElementById("passwordRegister").value;
  const confirmPassword = document.getElementById(
    "confirmPasswordRegister"
  ).value;
  const username = document.getElementById("usernameRegister").value;

  // Validate email and password
  if (!validateEmail(email) || !validatePassword(password)) {
    alert("Please enter a valid email and password");
    return;
  }

  if (validateField(!username)) {
    alert("Please enter a valid username");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    user = userCredential.user;
    var userData = {
      username: username,
      gold: 0,
      diamond: 0,
      ruby: 0,
      sapphire: 0,
      gem: 0,
      coin: 0,
      color: "blue",
    };

    try {
      // Create a document in the "users" collection with the username
      await setDoc(doc(db, "users/", user.uid), userData);
      alert("Registration successful! Please login to continue.");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  } catch (e) {
    console.log("Error creating user: ", e);
  }
});

const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Get email and password
  const email = document.getElementById("emailLogin").value;
  const password = document.getElementById("passwordLogin").value;

  // Validate email and password
  if (!validateEmail(email) || !validatePassword(password)) {
    alert("Please enter a valid email and password");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      user = userCredential.user;
      console.log("user logged in");
      localStorage.setItem(
        "rememberMe",
        document.getElementById("remember-me").checked
      );
      window.location.href = "play.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

function validateEmail(email) {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  return expression.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validateField(field) {
  if (field == null) {
    return false;
  }
  return field.length > 0;
}
