const accountUI = document.getElementById("accountUI");

const itemsUI = document.getElementById("itemsUI");
const inventoryBox = document.getElementById("inventoryBox");
const cardInvContainer = document.getElementById("card-inv-container");
const cardInvTable = document.getElementById("cardInventoryTable");
const gemInvTable = document.getElementById("gemInventoryTable");
const frontInvCard = document.getElementById("front-inv-card");
const backInvCard = document.getElementById("back-inv-card");

const tradeUI = document.getElementById("tradeUI");
const cardMarketTable = document.getElementById("cardMarketTable");
const gemMarketTable = document.getElementById("gemMarketTable");
const frontMarketCard = document.getElementById("front-market-card");
const backMarketCard = document.getElementById("back-market-card");
const marketBox = document.getElementById("marketBox");
const cardMarketContainer = document.getElementById("card-market-container");

const searchUI = document.getElementById("searchUI");
const frontCard = document.getElementById("front-card");
const backCard = document.getElementById("back-card");

const chatUI = document.getElementById("chatUI");
const worldChat = document.getElementById("worldChatBox");
const gameChat = document.getElementById("gameChatBox");
const helpChat = document.getElementById("helpChatBox");
const chatTitle = document.getElementById("chatTitle");

const shopUI = document.getElementById("shopUI");

function showAccountUI() {
   itemsUI.classList.add("hidden");
   tradeUI.classList.add("hidden");
   searchUI.classList.add("hidden");
   chatUI.classList.add("hidden");
   shopUI.classList.add("hidden");
   accountUI.classList.remove("hidden");
}

window.showAccountUI = showAccountUI;

function showChatUI() {
   accountUI.classList.add("hidden");
   itemsUI.classList.add("hidden");
   tradeUI.classList.add("hidden");
   searchUI.classList.add("hidden");
   shopUI.classList.add("hidden");
   chatUI.classList.remove("hidden");
}

window.showChatUI = showChatUI;

function showItemsUI() {
   accountUI.classList.add("hidden");
   tradeUI.classList.add("hidden");
   searchUI.classList.add("hidden");
   chatUI.classList.add("hidden");
   itemsUI.classList.remove("hidden");
   shopUI.classList.add("hidden");
   document.getElementById('itemsBackBtn').classList.add('hidden');
   inventoryBox.classList.remove("hidden");
   cardInvContainer.classList.add("hidden");
}

window.showItemsUI = showItemsUI;

export function showCardInventory() {
   cardInvTable.classList.remove("hidden");
   gemInvTable.classList.add("hidden");
}

window.showCardInventory = showCardInventory;

export function showGemInventory() {
   cardInvTable.classList.add("hidden");
   gemInvTable.classList.remove("hidden");
}

window.showGemInventory = showGemInventory;

export function showTradeUI() {
   accountUI.classList.add("hidden");
   itemsUI.classList.add("hidden");
   searchUI.classList.add("hidden");
   chatUI.classList.add("hidden");
   tradeUI.classList.remove("hidden");
   shopUI.classList.add("hidden");
   document.getElementById('marketBackBtn').classList.add('hidden');
   marketBox.classList.remove("hidden");
   cardMarketContainer.classList.add("hidden");
}

window.showTradeUI = showTradeUI;

export function showCardMarket() {
   cardMarketTable.classList.remove("hidden");
   gemMarketTable.classList.add("hidden");
}

window.showCardMarket = showCardMarket;

export function showGemMarket() {
   cardMarketTable.classList.add("hidden");
   gemMarketTable.classList.remove("hidden");
}

window.showGemMarket = showGemMarket;

export function showSearchUI() {
   accountUI.classList.add("hidden");
   itemsUI.classList.add("hidden");
   tradeUI.classList.add("hidden");
   chatUI.classList.add("hidden");
   shopUI.classList.add("hidden");
   searchUI.classList.remove("hidden");
   window.setupSearchListeners();
}

window.showSearchUI = showSearchUI;

export function showFrontInvCard() {
   frontInvCard.classList.remove("hidden");
   backInvCard.classList.add("hidden");
}

window.showFrontInvCard = showFrontInvCard;

export function showFrontMarketCard() {
   frontMarketCard.classList.remove("hidden");
   backMarketCard.classList.add("hidden");
}

window.showFrontMarketCard = showFrontMarketCard;

export function showFrontCard() {
   frontCard.classList.remove("hidden");
   backCard.classList.add("hidden");
}

window.showFrontCard = showFrontCard;

export function showWorldChat() {
   worldChat.classList.remove("hidden");
   gameChat.classList.add("hidden");
   helpChat.classList.add("hidden");
   chatTitle.innerHTML = "WORLD CHAT";
}

window.showWorldChat = showWorldChat;

export function showGameChat() {
   worldChat.classList.add("hidden");
   gameChat.classList.remove("hidden");
   helpChat.classList.add("hidden");
   chatTitle.innerHTML = "GAME CHAT";
}

window.showGameChat = showGameChat;

export function showHelpChat() {
   worldChat.classList.add("hidden");
   gameChat.classList.add("hidden");
   helpChat.classList.remove("hidden");
   chatTitle.innerHTML = "HELP CHAT";
}

window.showHelpChat = showHelpChat;

export function showShopUI() {
   accountUI.classList.add("hidden");
   itemsUI.classList.add("hidden");
   tradeUI.classList.add("hidden");
   searchUI.classList.add("hidden");
   chatUI.classList.add("hidden");
   shopUI.classList.remove("hidden");
}

window.showShopUI = showShopUI;

showSearchUI();