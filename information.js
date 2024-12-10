// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

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
const functions = getFunctions(app);
const getData = httpsCallable(functions, "getGlobalStats");

const gold = document.getElementById("gold");
const diamond = document.getElementById("diamond");
const gem = document.getElementById("gem");
const sapphire = document.getElementById("sapphire");
const ruby = document.getElementById("ruby");
const coin = document.getElementById("coin");
const cards = document.getElementById("cards");
const online = document.getElementById("online");

window.onload = function () {
    getData().then((result) => {
        console.log(result.data);
        gold.innerHTML = result.data.gold;
        diamond.innerHTML = result.data.diamond;
        gem.innerHTML = result.data.gem;
        sapphire.innerHTML = result.data.sapphire;
        ruby.innerHTML = result.data.ruby;
        coin.innerHTML = result.data.coin;
        cards.innerHTML = result.data.cards;
        online.innerHTML = result.data.online;
    });
}