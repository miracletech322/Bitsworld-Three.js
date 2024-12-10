// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  initializeFirestore,
  count,
  getCountFromServer,
} from "firebase/firestore";
import fs from "fs";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCllhLyxXAUhbGMbkWmVD948EVNw9w-c2I",
  authDomain: "bitsworld-b8246.firebaseapp.com",
  databaseURL: "https://bitsworld-b8246-default-rtdb.firebaseio.com",
  projectId: "bitsworld-b8246",
  storageBucket: "bitsworld-b8246.appspot.com",
  messagingSenderId: "858881725519",
  appId: "1:858881725519:web:178e4917b593204f76063a",
  measurementId: "G-MMZWV9ESGE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = initializeFirestore(app, { experimentalForceLongPolling: true });

function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ",";

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    // Delimiters.
    "(\\" +
      strDelimiter +
      "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      "\\r\\n]*))",
    "gi"
  );

  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return arrData;
}

async function batchedWrites(data) {
  let batch = writeBatch(firestore);
  let count = 0;
  let i = 0;
  while (data.length) {
    const columns = CSVToArray(data.pop())[0];
    const card = {
      name: columns[0].trim(),
      description: columns[1],
      lat: Number(columns[2]),
      lon: Number(columns[3]),
      reward: columns[4],
      rewardClaimed: false,
      owner: "",
      listed: false,
    };
    batch.set(doc(collection(firestore, "cards")), card);
    i++;
    if (++count >= 500) {
      await batch.commit();
      batch = writeBatch(firestore);
      console.log("Batch written: ", i);
      console.log
      count = 0;
    } else if (data.length === 0) {
      await batch.commit();
      console.log("Batch written: ", i);
    }
  }
}

fs.readFile("data-20k.csv", "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    let rows = data.split("\r\n").slice(1);
    batchedWrites(rows);
    });

// Get length of cards collection
const cardsCollection = collection(firestore, "cards");
const cards = await getCountFromServer(cardsCollection);
console.log(cards.data().count);
