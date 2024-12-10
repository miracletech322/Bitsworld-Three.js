/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const {getDatabase} = require("firebase-admin/database");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

initializeApp();

exports.getGlobalStats = onRequest(async (request, response) => {
  // Get all gold and gems from all users
  const db = getFirestore();
  const users = await db.collection("users").get();
  let totalGold = 0;
  let totalDiamonds = 0;
  let totalSapphire = 0;
  let totalRuby = 0;
  let totalGem = 0;
  let totalCoin = 0;

  users.forEach((user) => {
    const data = user.data();
    totalGold += data.gold;
    totalDiamonds += data.diamond;
    totalSapphire += data.sapphire;
    totalRuby += data.ruby;
    totalGem += data.gem;
    totalCoin += data.coin;
  });

  const gems = await db.collection("gemMarket").get();
  gems.forEach((gem) => {
    const data = gem.data();
    switch (data.gemType) {
      case "coin":
        totalCoin += data.units;
        break;
      
      case "diamond":
        totalDiamonds += data.units;
        break;
      
      case "sapphire":
        totalSapphire += data.units;
        break;

      case "ruby":
        totalRuby += data.units;
        break;

      case "gem":
        totalGem += data.units;
        break;

      default:
        break;
    }
  })

  // Query all cards and count the number of cards that are owned (use query to filter out cards that are not owned)
  const cards = (await db.collection("cards").where("owner", "!=", "").get())
    .size;

  const realtimeDB = getDatabase();
  // Get count from "online" in realtime database
  let online = (await realtimeDB.ref("online").get()).val();
  if (online === null) {
    online = 0;
  } else {
    online = Object.keys(online).length;
  }

  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, POST");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  response.set("Content-Type", "application/json");
  response.send({
    data: {
      gold: totalGold,
      diamond: totalDiamonds,
      sapphire: totalSapphire,
      ruby: totalRuby,
      gem: totalGem,
      coin: totalCoin,
      cards: cards,
      online: online,
    },
  });
  return;
});

exports.clearChat = onSchedule("every day 00:00", async (event) => {
  // Clear all messages in the worldchat, gamechat and helpchat collection
  const db = getFirestore();
  const worldchat = db.collection("worldchat");
  const gamechat = db.collection("gamechat");
  const helpchat = db.collection("helpchat");

  const worldchatMessages = await worldchat.get();
  const gamechatMessages = await gamechat.get();
  const helpchatMessages = await helpchat.get();

  const batch = db.batch();
  worldchatMessages.forEach((message) => {
    batch.delete(message.ref);
  });

  gamechatMessages.forEach((message) => {
    batch.delete(message.ref);
  });

  helpchatMessages.forEach((message) => {
    batch.delete(message.ref);
  });

  await batch.commit();
  return;
});

exports.onCheckoutSessionCompleted = onRequest(async (request, response) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  let event;

  try {
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

    event = stripe.webhooks.constructEvent(
      request.rawBody,
      request.headers["stripe-signature"],
      whSecret
    );
  } catch (error) {
    console.error(`Webhook Error: ${error.message}`);
    response.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  const dataObject = event.data.object;

  // Get the customer who made the purchase from firestore using payment intent
  const db = getFirestore();
  const stripeCustomerId = dataObject.customer;
  // User id is the document id in customers collection 
  const userId = (
    await db.collection("customers").where("stripeId", "==", stripeCustomerId).get()
  ).docs[0].id;
  console.log(userId);

  const user = await db.collection("users").doc(userId).get();

  // Get price id from payments collection
  const paymentIntent = await db.collection("customers").doc(userId).collection("payments").doc(dataObject.payment_intent).get();
  const priceId = paymentIntent.data().items[0].price.id;


  switch (priceId) {
    case "price_1PyF82DDfDFD0xqNoIjZzDRA":
      // Add 1000000 gold
      await db.collection("users").doc(userId).update({
        gold: user.data().gold + 1000000,
      });
      break;

    case "price_1PyFDGDDfDFD0xqN6pCLGB0X":
      // Add 5000000 gold and 200 coins
      await db.collection("users").doc(userId).update({
        gold: user.data().gold + 5000000,
        coin: user.data().coin + 200,
      });
      break;

      case "price_1PyFDmDDfDFD0xqN2v5teOe2":
      // Add 10000000 gold and 400 coins
      await db.collection("users").doc(userId).update({
        gold: user.data().gold + 10000000,
        coin: user.data().coin + 400,
      });
      break;

      case "price_1PyFEGDDfDFD0xqNWf6BSYvr":
      // Add 20000000 gold and 800 coins
      await db.collection("users").doc(userId).update({
        gold: user.data().gold + 20000000,
        coin: user.data().coin + 800,
      });
      break;

      case " price_1PyFEkDDfDFD0xqN52wuZxlw":
      // Add 50000000 gold and 2000 coins
      await db.collection("users").doc(userId).update({
        gold: user.data().gold + 50000000,
        coin: user.data().coin + 2000,
      });
      break;
  }
  response.status(200).send("Success");
  return;
});