// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signOut, updatePassword } from "firebase/auth";
import { ref, set, getDatabase,remove, onValue, onDisconnect, get } from "firebase/database";
import {
  getDoc,
  getDocs,
  getFirestore,
  collection,
  onSnapshot,
  doc,
  query,
  where,
  updateDoc,
  setDoc,
  deleteDoc,
  orderBy,
  limit,
  addDoc,
} from "firebase/firestore";
import { getStorage, ref as refStorage, getDownloadURL } from "firebase/storage";

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
  storageBucket: "bitsworld-b8246.appspot.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
var user;
var allMarketListings = [];
var allGemMarketListings = [];
let ownedCards = [];
var userData;
const gemType = ["diamond", "ruby", "sapphire", "gem", "coin"];

auth.onAuthStateChanged((u) => {
  if (u) {
    console.log("user logged in");
    user = u;
    setupListeners();
    window.showSearchUI();
  } else {
    console.log("user logged out");
    window.location.href = "login.html";
  }
});

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", (e) => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      console.log("user logged out");
      user = null;
      localStorage.removeItem("rememberMe");
      ref(realtimeDb, "online/" + user.uid).remove();
      window.location.href = "index.html";
    })
    .catch((error) => {
      // An error happened.
      console.log(error);
    });
});


async function setupListeners() {
  onSnapshot(doc(db, "users", user.uid), (snapshot) => {
    userData = snapshot.data();
    UpdateInventoryUser(userData);
    UpdateMarketUser(userData);
  });
  // Get collection of cards that the user owns. This is located at the path "cards" in the database
  const q = query(collection(db, "cards"), where("owner", "==", user.uid));
  onSnapshot(q, (snapshot) => {
    ownedCards = [];
    snapshot.forEach((doc) => {
      ownedCards.push(doc.data());
    });
    updateOwnedCardsUI(ownedCards);
  });
  onSnapshot(collection(db, "market"), (snapshot) => {
    allMarketListings = [];
    snapshot.forEach((doc) => {
      allMarketListings.push(doc.data());
    });
    updateMarketUI(allMarketListings);
  });
  onSnapshot(collection(db, "gemMarket"), (snapshot) => {
    allGemMarketListings = [];
    snapshot.forEach((doc) => {
      allGemMarketListings.push(doc.data());
    });
    UpdateGemInventoryUI(allGemMarketListings);
    UpdateGemMarketUI(allGemMarketListings);
  });

  let onlineRef = ref(realtimeDb, ".info/connected");
  let userRef = ref(realtimeDb, "online/" + user.uid);
  onValue(onlineRef, (snapshot) => {
    if (snapshot.val()) {
      onDisconnect(userRef).remove();
      set(userRef, true);
    }
  });

  // Query most recent 100 messages from worldchat
  const qWorldChat = query(collection(db, "worldchat"), orderBy("time", "desc"), limit(12));
  onSnapshot(qWorldChat, (snapshot) => {
    var chat = document.getElementById("worldchat");
    chat.innerHTML = "";
    let tbody = document.createElement("tbody");
    for (let i = snapshot.docs.length - 1; i >= 0; i--) {
      let doc = snapshot.docs[i];
      var message = doc.data();
      var row = document.createElement("tr");
      var cell = document.createElement("td");
      var color = message.color;
      cell.style.color = color;
      cell.innerHTML = message.username;
      row.appendChild(cell);
      cell = document.createElement("td");
      cell.style.color = color;
      cell.style.overflow = "scroll";
      cell.innerHTML = message.message;
      row.appendChild(cell);
      cell = document.createElement("td");
      cell.style.color = color;
      cell.innerHTML = new Date(message.time.seconds * 1000).toLocaleString();
      row.appendChild(cell);
      tbody.appendChild(row);
    }
    chat.appendChild(tbody);
  });
  const qGameChat = query(collection(db, "gamechat"), orderBy("time", "desc"), limit(12));
  onSnapshot(qGameChat, (snapshot) => {
    var chat = document.getElementById("gamechat");
    chat.innerHTML = "";
    let tbody = document.createElement("tbody");
    for (let i = snapshot.docs.length - 1; i >= 0; i--) {
      let doc = snapshot.docs[i];
      var message = doc.data();
      var row = document.createElement("tr");
      var cell = document.createElement("td");
      var color = message.color;
      cell.style.color = color;
      cell.innerHTML = message.username;
      row.appendChild(cell);
      cell = document.createElement("td");
      cell.style.color = color;
      cell.style.overflow = "scroll";
      cell.innerHTML = message.message;
      row.appendChild(cell);
      cell = document.createElement("td");
      cell.style.color = color;
      cell.innerHTML = new Date(message.time.seconds * 1000).toLocaleString();
      row.appendChild(cell);
      tbody.appendChild(row);
    }
    chat.appendChild(tbody);
  });

  const qHelpChat = query(collection(db, "helpchat"), orderBy("time", "desc"), limit(12));
  onSnapshot(qHelpChat, (snapshot) => {
    var chat = document.getElementById("helpchat");
    chat.innerHTML = "";
    let tbody = document.createElement("tbody");
    for (let i = snapshot.docs.length - 1; i >= 0; i--) {
      let doc = snapshot.docs[i];
      var message = doc.data();
      var row = document.createElement("tr");
      var cell = document.createElement("td");
      var color = message.color;
      cell.style.color = color;
      cell.innerHTML = message.username;
      row.appendChild(cell);
      cell = document.createElement("td");
      cell.style.color = color;
      cell.style.overflow = "scroll";
      cell.innerHTML = message.message;
      row.appendChild(cell);
      cell = document.createElement("td");
      cell.style.color = color;
      cell.innerHTML = new Date(message.time.seconds * 1000).toLocaleString();
      row.appendChild(cell);
      tbody.appendChild(row);
    }
    chat.appendChild(tbody);
  });
}

function UpdateGemMarketUI(listings) {
  var table = document.getElementById("gemMarket");
  table.innerHTML = "";
  for (let i = 0; i < listings.length; i++) {
    if (listings[i].seller === user.uid) {
      continue;
    }

    let button = document.createElement("button");
    button.classList.add("buyBtn");
    button.innerHTML = "Buy";
    button.id = "gemBuyBtn" + i;
    button.index = i;
    button.listing = listings[i];
    button.addEventListener("click", buyGem);

    let row = document.createElement("tr");
    let cell = document.createElement("td");
    let img = document.createElement("img");
    let gem = listings[i].gemType;
    if (gem === "coin") {
      img.src = "images/gems/coin.gif"
    } else {
      img.src = "images/gems/" + listings[i].gemType + ".png";
    }
    cell.appendChild(img);
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.id = "gemBuyPrice_" + i;
    cell.innerHTML = listings[i].price;
    row.appendChild(cell);
    cell = document.createElement("td");
    let input = document.createElement("input");
    input.id = "gemBuyUnits_" + i;
    input.type = "number";
    input.units = listings[i].units;
    input.value = listings[i].units;
    input.index = i;
    input.addEventListener("change", CheckMaxUnits);
    cell.appendChild(input);
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = listings[i].sellerName;
    row.appendChild(cell);

    // Add total price cell
    cell = document.createElement("td");
    cell.innerHTML = listings[i].price * listings[i].units;
    cell.id = "gemBuyTotal_" + i;
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(button);

    row.appendChild(cell);
    table.appendChild(row);
  }
}

function CheckMaxUnits(event) {
  var units = Number(event.target.value);
  var price = Number(
    document.getElementById("gemBuyPrice_" + event.target.index).innerHTML
  );
  if (units > event.target.units) {
    alert("You can't buy more than " + event.target.units + " units");
    event.target.value = event.target.units;
  }

  if (units <= 0) {
    alert("Please enter a valid amount of units");
    event.target.value = event.target.units;
  }

  // Update the total price
  var totalPrice = event.target.value * price;
  document.getElementById("gemBuyTotal_" + event.target.index).innerHTML =
    totalPrice;
}

function buyGem(event) {
  if (user === null || user === undefined) {
    alert("You must be logged in to buy a gem");
    return;
  }

  var listing = event.target.listing;
  var units = Number(
    document.getElementById("gemBuyUnits_" + event.target.index).value
  );
  if (units === NaN || units === undefined || units === null || units <= 0) {
    alert("Please enter a valid amount of units");
    return;
  }

  if (userData.gold < listing.price * units) {
    alert("You don't have enough gold to buy this gem");
    return;
  }

  // Deduct the gold from the buyer
  deductGoldFromUser(listing.price * units);
  addGoldToUser(listing.seller, listing.price * units);
  // Add the gems to the buyer
  transferOwnershipGem(listing, units);
  // Check if the seller has any units left
  if (listing.units === units) {
    deleteDoc(doc(db, "gemMarket", listing.gemType + "-" + listing.seller));
  } else {
    listing.units -= units;
    updateDoc(
      doc(db, "gemMarket", listing.gemType + "-" + listing.seller),
      listing
    );
  }
}

async function transferOwnershipGem(listing, units) {
  await updateDoc(doc(db, "users", user.uid), {
    [listing.gemType]: userData[listing.gemType] + units,
  });
}

function UpdateGemInventoryUI(listings) {
  let gemInventory = document.getElementById("gemInventory");
  gemInventory.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    let row = document.createElement("tr");
    let cell = document.createElement("td");
    let img = document.createElement("img");
    let gem = gemType[i];
    if (gem === "coin") {
      img.src = "images/gems/coin.gif";
    } else {
      img.src = "images/gems/" + gem + ".png";
    }
    cell.appendChild(img);
    row.appendChild(cell);

    cell = document.createElement("td");
    var input = document.createElement("input");
    input.type = "number";
    input.id = "sellGemPrice_" + gemType[i];
    input.addEventListener("change", updateTotalPrice.bind(null, gemType[i]));

    cell.appendChild(input);
    row.appendChild(cell);

    cell = document.createElement("td");
    input = document.createElement("input");
    input.type = "number";
    input.id = "sellGemUnits_" + gemType[i];
    input.addEventListener("change", updateTotalPrice.bind(null, gemType[i]));

    cell.appendChild(input);
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.innerHTML = 0;
    cell.id = "sellGemTotal_" + gemType[i];
    row.appendChild(cell);

    cell = document.createElement("td");
    let button = document.createElement("button");
    button.classList.add("sellBtn");
    button.innerHTML = "Sell";
    button.id = "sellGemBtn_" + gemType[i];
    button.gemType = gemType[i];
    button.addEventListener("click", sellGem);
    cell.appendChild(button);

    button = document.createElement("button");

    button.innerHTML = "Remove Listing";
    button.id = "removeListingBtn_" + gemType[i];
    button.gemType = gemType[i];
    button.addEventListener("click", removeGemListing);
    cell.appendChild(button);

    row.appendChild(cell);
    gemInventory.appendChild(row);
    button.classList.add("removeListingBtn");
    if (
      document.getElementById("sellGemPrice_" + gemType[i]).disabled === false
    ) {
      button.classList.add("hidden");
    }
  }
  // Check if user has gems on market
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < listings.length; j++) {
      if (
        listings[j].gemType === gemType[i] &&
        listings[j].seller === user.uid
      ) {
        document.getElementById("sellGemPrice_" + gemType[i]).value =
          listings[j].price;
        document.getElementById("sellGemPrice_" + gemType[i]).disabled = true;
        document.getElementById("sellGemUnits_" + gemType[i]).value =
          listings[j].units;
        document.getElementById("sellGemUnits_" + gemType[i]).disabled = true;
        document.getElementById("sellGemTotal_" + gemType[i]).innerHTML =
          listings[j].price * listings[j].units;
        document
          .getElementById("sellGemBtn_" + gemType[i])
          .classList.add("hidden");
        document
          .getElementById("removeListingBtn_" + gemType[i])
          .classList.remove("hidden");
        break;
      }
    }
  }
}

function UpdateInventoryUser(userData) {
  document.getElementById("diamondInventoryUI").innerHTML = userData.diamond;
  document.getElementById("rubyInventoryUI").innerHTML = userData.ruby;
  document.getElementById("sapphireInventoryUI").innerHTML = userData.sapphire;
  document.getElementById("gemInventoryUI").innerHTML = userData.gem;
  document.getElementById("goldInventoryUI").innerHTML = userData.gold;
  document.getElementById("coinInventoryUI").innerHTML = userData.coin;
}

async function sellGem(event) {
  var gemType = event.target.gemType;
  var price = Number(document.getElementById("sellGemPrice_" + gemType).value);
  var units = Number(document.getElementById("sellGemUnits_" + gemType).value);

  // Validate price and units
  if (price === NaN || price === undefined || price === null || price <= 0) {
    alert("Please enter a valid price");
    return;
  }

  if (units === NaN || units === undefined || units === null || units <= 0) {
    alert("Please enter a valid amount of units");
    return;
  }

  // User can't sell more than they have
  if (gemType === "diamond") {
    if (units > userData.diamond) {
      alert("You don't have enough diamonds");
      return;
    }
  } else if (gemType === "ruby") {
    if (units > userData.ruby) {
      alert("You don't have enough rubies");
      return;
    }
  } else if (gemType === "sapphire") {
    if (units > userData.sapphire) {
      alert("You don't have enough sapphires");
      return;
    }
  } else if (gemType === "gem") {
    if (units > userData.gem) {
      alert("You don't have enough gems");
      return;
    }
  } else if (gemType === "coin") {
    if (units > userData.coin) {
      alert("You don't have enough coins");
      return;
    }
  }

  // Put the gem on the market
  var listing = {
    gemType: gemType,
    price: price,
    units: units,
    seller: user.uid,
    sellerName: userData.username,
  };
  // Push the listing to the market under random id
  await setDoc(doc(db, "gemMarket", gemType + "-" + user.uid), listing);
  document.getElementById("sellGemPrice_" + gemType).value = price;
  document.getElementById("sellGemUnits_" + gemType).value = units;
  document.getElementById("sellGemTotal_" + gemType).innerHTML = price * units;

  await updateDoc(doc(db, "users", user.uid), {
    // Deduct the gems from the user
    [gemType]: userData[gemType] - units,
  });

  event.target.classList.add("hidden");
}

async function removeGemListing(event) {
  var gemType = event.target.gemType;

  await updateDoc(doc(db, "users", user.uid), {
    [gemType]:
      userData[gemType] +
      Number(document.getElementById("sellGemUnits_" + gemType).value),
  });

  await deleteDoc(doc(db, "gemMarket", gemType + "-" + user.uid));
  document.getElementById("sellGemPrice_" + gemType).value = "";
  document.getElementById("sellGemUnits_" + gemType).value = "";
  document.getElementById("sellGemTotal_" + gemType).innerHTML = 0;
  document.getElementById("sellGemPrice_" + gemType).disabled = false;
  document.getElementById("sellGemUnits_" + gemType).disabled = false;
  event.target.classList.add("hidden");
  document.getElementById("sellGemBtn_" + gemType).classList.remove("hidden");
}

function updateTotalPrice(gemType) {
  var price = Number(document.getElementById("sellGemPrice_" + gemType).value);
  var units = Number(document.getElementById("sellGemUnits_" + gemType).value);

  // Check if units is greater than the amount of gems the user has
  if (gemType === "diamond") {
    if (units > userData.diamond) {
      alert("You don't have enough diamonds");
      document.getElementById("sellGemUnits_" + gemType).value =
        userData.diamond;
      return;
    }
  } else if (gemType === "ruby") {
    if (units > userData.ruby) {
      alert("You don't have enough rubies");
      document.getElementById("sellGemUnits_" + gemType).value = userData.ruby;
      return;
    }
  } else if (gemType === "sapphire") {
    if (units > userData.sapphire) {
      alert("You don't have enough sapphires");
      document.getElementById("sellGemUnits_" + gemType).value =
        userData.sapphire;
      return;
    }
  } else if (gemType === "gem") {
    if (units > userData.gem) {
      alert("You don't have enough gems");
      document.getElementById("sellGemUnits_" + gemType).value = userData.gem;
      return;
    }
  }

  var total = price * units;
  document.getElementById("sellGemTotal_" + gemType).innerHTML = total;
}

function UpdateMarketUser(userData) {
  document.getElementById("diamondMarketUI").innerHTML = userData.diamond;
  document.getElementById("rubyMarketUI").innerHTML = userData.ruby;
  document.getElementById("sapphireMarketUI").innerHTML = userData.sapphire;
  document.getElementById("gemMarketUI").innerHTML = userData.gem;
  document.getElementById("goldMarketUI").innerHTML = userData.gold;
  document.getElementById("coinMarketUI").innerHTML = userData.coin;
}

async function deductGoldFromUser(amount) {
  await updateDoc(doc(db, "users", user.uid), {
    gold: userData.gold - amount,
  });
}

async function deductCoinFromUser(amount) {
  await updateDoc(doc(db, "users", user.uid), {
    coin: userData.coin - amount,
  });
}

async function addGoldToUser(userId, amount) {
  const d = await getDoc(doc(db, "users", userId));
  const data = d.data();
  await updateDoc(doc(db, "users", userId), {
    gold: data.gold + amount,
  });
}

async function transferOwnership(cardName) {
  // Find the card with the cardName
  const q = query(collection(db, "cards"), where("name", "==", cardName));
  const snapshot = await getDocs(q);
  snapshot.docs.forEach((doc) => {
    const card = doc.data();
    card.owner = user.uid;
    card.listed = false;
    updateDoc(doc.ref, card);
  } );
}

function buyCard(event) {
  if (user === null || user === undefined) {
    alert("You must be logged in to buy a card");
    return;
  }

  var listing = event.target.listing;

  if (userData.gold < listing.price) {
    alert("You don't have enough gold to buy this card");
    return;
  }
  // Deduct the gold from the buyer
  deductGoldFromUser(listing.price);
  addGoldToUser(listing.seller, listing.price);
  transferOwnership(listing.cardName);
  // Delete the listing from the market
  deleteDoc(doc(db, "market", listing.cardName));
}

export async function learnFoundCard(name) {
  if (user === null || user === undefined) {
    alert("You must be logged in to buy a card");
    return;
  }

  let card;

  const q = query(collection(db, "cards"), where("name", "==", name));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    card = doc.data();
  }
  );

  // Can only claim if time is more than 6 hours
  if (userData[card.name] !== null && userData[card.name] !== undefined) {
    var lastClaimed = new Date(userData[card.name].seconds * 1000);
    var now = new Date();
    if (now - lastClaimed < 21600000) {
      alert("You can only learn this card every 6 hours");
      return;
    }
  }

  if (!card.owner) {
    alert("No one owns this card yet. You have earned 500 gold!");
    addGoldToUser(user.uid, 500);
    setLastClaimedCard(card.name);
    return;
  }
  if (card.owner !== null && card.owner !== undefined && card.owner !== "") {
    // If the owner is not the user
    if (card.owner !== user.uid) {
      alert("This card has already been claimed by someone else. You have earned 450 gold!");
      addGoldToUser(user.uid, 450);
      addGoldToUser(card.owner, 50);
      setLastClaimedCard(card.name);
      return;
    } else {
      alert("You already own this card");
      return;
    }
  }
}

window.learnFoundCard = learnFoundCard;

async function setLastClaimedCard(cardName) {
  // Set the last claimed card timestamp
  await updateDoc(doc(db, "users", user.uid), {
    [cardName]: new Date(),
  });
}

export async function buyFoundCard() {
  if (user === null || user === undefined) {
    alert("You must be logged in to buy a card");
    return;
  }

  var card = document.getElementById("card-container").card;

  const q = query(collection(db, "cards"), where("name", "==", card.name));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    card = doc.data();
  }
  );

  if (card.owner !== null && card.owner !== undefined && card.owner !== "") {
    if (card.owner === user.uid) {
      alert("You already own this card");
      return;
    } else {
      alert("This card has already been claimed");
      return;
    }
  }

  if (userData.coin < 1) {
    alert("You don't have enough coins to buy this card");
    return;
  }

  // Deduct the Coin from the buyer
  deductCoinFromUser(1);
  transferOwnership(card.name);
  alert("You have bought " + card.name + " for 1 coins");
}

window.buyFoundCard = buyFoundCard;

export async function claimReward(inventoryCard) {
  if (user === null || user === undefined) {
    alert("You must be logged in to claim a reward");
    return;
  }

  var card;
  if (inventoryCard) {
    card = document.getElementById("card-inv-container").card;
  } else {
    var card = document.getElementById("card-container").card;
  }

  const q = query(collection(db, "cards"), where("name", "==", card.name));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    card = doc.data();
  }
  );

  if (card.owner !== null && card.owner !== undefined && card.owner !== "") {
    if (card.owner === user.uid) {
      if (card.rewardClaimed === true) {
        alert("The reward has already been claimed for this card");
        return;
      } else {
        alert(
          "You have claimed the reward for " +
            card.name +
            " and receieved 1 " +
            card.reward
        );
        getReward(card);
      }
    } else {
      alert(
        "This card has already been claimed by someone else so you can't claim the reward!"
      );
      return;
    }
  } else {
    alert(
      "This card has not been bought yet so buy the card to claim the reward!"
    );
    return;
  }
}

window.claimReward = claimReward;

async function sellCard(event) {
  event.stopPropagation();
  let card = event.target.card;
  var price = Number(
    document.getElementById("sellCardPrice_" + card.name).value
  );
  if (price === NaN || price === undefined || price === null || price <= 0) {
    alert("Please enter a valid price");
    return;
  }
  var listing = {
    cardName: card.name,
    price: price,
    seller: user.uid,
    sellerName: userData.username,
  };

  const q = query(collection(db, "cards"), where("name", "==", card.name));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    updateDoc(doc.ref, {
      listed: true,
    });
  });
  await setDoc(doc(db, "market", card.name), listing);
  document.getElementById("sellCardPrice_" + card.name).value = price;
  event.target.classList.add("hidden");
}

function updateOwnedCardsUI(cards) {
  // Filter duplicates by name
  let table = document.getElementById("cardInventory");
  table.innerHTML = "";
  for (let i = 0; i < cards.length; i++) {
    // Insert row with card name and sell button
    let button = document.createElement("button");
    button.classList.add("sellBtn");
    button.innerHTML = "Sell";
    button.id = "sellBtn" + i;
    button.index = i;
    button.card = cards[i];
    button.addEventListener("click", sellCard);

    let row = document.createElement("tr");
    let cell = document.createElement("td");

    // Make name clickable to show card
    let name = document.createElement("a");
    name.innerHTML = cards[i].name;
    name.addEventListener("click", showCard.bind(null, cards[i].name, "inv"));

    if (cards[i].rewardClaimed === false) {
      // Make name glow green
      console.log("GLOWING");
      cell.classList.add("glow-green");
    }

    cell.appendChild(name);
    row.appendChild(cell);
    cell = document.createElement("td");
    var input = document.createElement("input");
    input.type = "number";
    if (cards[i].listed) {
      input.value = cards[i].price;
      input.disabled = true;
      button.classList.add("hidden");
    }

    input.id = "sellCardPrice_" + cards[i].name;
    cell.appendChild(input);
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.appendChild(button);

    button = document.createElement("button");
    button.classList.add("removeListingBtn");
    if (!cards[i].listed) {
      button.classList.add("hidden");
    }
    button.innerHTML = "Remove Listing";
    button.id = "removeListingBtn" + i;
    button.index = i;
    button.card = cards[i];
    button.addEventListener("click", removeListing);

    cell.appendChild(button);
    row.appendChild(cell);
    table.appendChild(row);
  }
}

async function removeListing(event) {
  let card = event.target.card;
  card.listed = false;

  const q = query(collection(db, "cards"), where("name", "==", card.name));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    card = doc.data();
    card.listed = false;
    updateDoc(doc.ref, card);
  });

  await deleteDoc(doc(db, "market", card.name));

  event.target.classList.add("hidden");
  document.getElementById("sellCardPrice_" + card.name).value = "";
  document.getElementById("sellCardPrice_" + card.name).disabled = false;
  document
    .getElementById("sellBtn" + event.target.index)
    .classList.remove("hidden");
}

async function updateMarketUI(listings) {
  var table = document.getElementById("cardMarket");
  table.innerHTML = "";
  for (var i = 0; i < listings.length; i++) {
    if (listings[i].seller === user.uid) {
      document.getElementById("sellCardPrice_" + listings[i].cardName).value =
        listings[i].price;
      continue;
    }
    var button = document.createElement("button");
    button.classList.add("buyBtn");
    button.innerHTML = "Buy";
    button.id = "buyBtn" + i;
    button.index = i;
    button.listing = listings[i];
    button.addEventListener("click", buyCard);

    let row = document.createElement("tr");
    let cell = document.createElement("td");

    const q = query(collection(db, "cards"), where("name", "==", listings[i].cardName));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      if (doc.data().rewardClaimed === false) {
        cell.classList.add("glow-green");
      }
    });

    cell.innerHTML = listings[i].cardName;
    cell.addEventListener("click", showCard.bind(null, listings[i].cardName, "market"));
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = listings[i].price;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.innerHTML = listings[i].sellerName;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.appendChild(button);
    row.appendChild(cell);
    table.appendChild(row);
  }
}

async function getReward(card) {
  // Find the card with the cardName in allCards

  const q = query(collection(db, "cards"), where("name", "==", card.name));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docQuery) => {
    card = docQuery.data();
    card.rewardClaimed = true;
    updateDoc(docQuery.ref, card);
    // Add the reward to the user
    updateDoc(doc(db, "users", user.uid), {
      [card.reward]: userData[card.reward] + 1,
    });
  });
}

async function showCard(name, type) {
  const q = query(collection(db, "cards"), where("name", "==", name));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    var card = doc.data();
    document.getElementById("card-"+type+"-container").card = card;
    document.getElementById("card-"+type+"-name").innerHTML = card.name;
    document.getElementById("card-"+type+"-description").innerHTML = card.description;
    document.getElementById("card-"+type+"-description").classList.add("hidden");
    document.getElementById("card-"+type+"-container").classList.remove("hidden");
    document.getElementById("front-"+type+"-card").classList.add("hidden");
    document.getElementById("back-"+type+"-card").classList.remove("hidden");
    if (type === "inv") {
      document.getElementById("inventoryBox").classList.add("hidden");
      document.getElementById("itemsBackBtn").classList.remove("hidden"); 
    }
    else if (type === "market") {
      document.getElementById("marketBox").classList.add("hidden");
      document.getElementById("marketBackBtn").classList.remove("hidden");
    }
    const imageRef = refStorage(storage, "Image/" + card.name + ".png");
    getDownloadURL(imageRef).then((url) => {
      document.getElementById("card-"+type+"-image").src = url;
    });
  });
}

async function getCardsInBoundary(lon, lat) {
  // Get all cards in the boundary around the longitude and latitude with a radius of 0.2

  let cards = [];
  let images = [];

  const q = query(collection(db, "cards"), where("lon", ">", lon - 0.5), where("lon", "<", lon + 0.5), where("lat", ">", lat - 0.5), where("lat", "<", lat + 0.5), orderBy("lon", "asc"), orderBy("lat", "asc"));
  const querySnapshot = await getDocs(q);
  await querySnapshot.forEach((doc) => {
    cards.push(doc.data());
  });

  for (let i = 0; i < cards.length; i++) {
    const imageRef = refStorage(storage, "Image/" + cards[i].name + ".png");
    let url = await getDownloadURL(imageRef);
    images.push(url);
  }
  return [cards, images];
}

window.getCardsInBoundary = getCardsInBoundary;

const worldChatButton = document.getElementById("worldchatsend");
worldChatButton.addEventListener("click", function(e) {
  sendChatMessage("worldchat");
});

const gameChatButton = document.getElementById("gamechatsend");
gameChatButton.addEventListener("click", function(e) {
  sendChatMessage("gamechat");
});

const helpChatButton = document.getElementById("helpchatsend");
helpChatButton.addEventListener("click", function(e) {
  sendChatMessage("helpchat");
});

function submitChat(event) {
  if (event.key === "Enter") {
    let type = event.target.id.split("input")[0];
    sendChatMessage(type);
  }

}

window.submitChat = submitChat;

async function sendChatMessage(type) {

  var message = document.getElementById(type + "input").value;
  if (message === "") {
    alert("Please enter a message");
    return;
  }

  let chatObject = {
    username: userData.username,
    message: message,
    time: new Date(),
    color: "blue",
  };

  if (type == "worldchat") {
    // Cost 50 gold to send a message
    if (userData.gold < 50) {
      alert("You don't have enough gold to send a message");
      return;
    }
    // Check if 5 min cooldown has passed
    if (userData.lastWorldChat !== null && userData.lastWorldChat !== undefined) {
      var lastWorldChat = new Date(userData.lastWorldChat.seconds * 1000);
      var now = new Date();
      if (now - lastWorldChat < 300000) {
        alert("You can only send a message every 5 minutes");
        return;
      }
    }
    await setDoc(doc(db, "worldchat", new Date().getTime().toString()), chatObject);
    await deductGoldFromUser(50);
    await updateDoc(doc(db, "users", user.uid), {
      lastWorldChat: new Date(),
    });
  } else if (type == "gamechat") {
    // Cost 10 gold to send a message
    if (userData.gold < 10) {
      alert("You don't have enough gold to send a message");
      return;
    }
    // Check if 1 min cooldown has passed
    if (userData.lastGameChat !== null && userData.lastGameChat !== undefined) {
      var lastGameChat = new Date(userData.lastGameChat.seconds * 1000);
      var now = new Date();
      if (now - lastGameChat < 60000) {
        alert("You can only send a message every minute");
        return;
      }
    }
    await setDoc(doc(db, "gamechat", new Date().getTime().toString()), chatObject);
    await deductGoldFromUser(10);
    await updateDoc(doc(db, "users", user.uid), {
      lastGameChat: new Date(),
    });
  } else if (type == "helpchat") {
    await setDoc(doc(db, "helpchat", new Date().getTime().toString()), chatObject);
  }
  document.getElementById(type + "input").value = "";
}

window.sendChatMessage = sendChatMessage;

async function createCheckoutSession(priceId) {
  let checkoutSessionData = {
    price: priceId,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
    mode: "payment"
  }

  const checkoutSessionRef = await addDoc(collection(db, `customers/${user.uid}/checkout_sessions`), checkoutSessionData);

  onSnapshot(checkoutSessionRef, (snap) => {
    const {error, url} = snap.data();
    if (error) {
      alert(`An error occured: ${error.message}`);
    }
    if (url) {
      console.log(url);
      window.location.assign(url);
    }
  });
}

window.createCheckoutSession = createCheckoutSession;