// Default state
const state = {
  accountList: [],
  historyList: []
}

// Render options on document load
window.addEventListener('load', (event) => {
  renderOptions();
})

// List item creation function
function Li(list, subscriber) {
  if (subscriber.id === "accountsList") {
    list.forEach(element => {
      const newLi = document.createElement("li");
      newLi.setAttribute("class", "list-group-item");
      newLi.setAttribute("account-id", element.id);
      newLi.innerHTML = `<div>${element.name}<span style="float: right;">${element.balance} &#8378</span></div>`;
      subscriber.appendChild(newLi);
    });
  } else {
    list.forEach(element => {
      const newLi = document.createElement("li");
      newLi.setAttribute("class", "list-group-item");
      newLi.setAttribute("history-id", element.id);
      newLi.innerHTML = `<div">${element.sender} just sent ${element.receiver} ${element.amount} &#8378<span style="float: right;">&#10003</span></div>`;
      subscriber.appendChild(newLi);
    });
  }
}

// Option creation function for the selection menu
function Option(list, subscriber) {
  list.forEach(element => {
    const newOption = document.createElement("option");
    newOption.setAttribute("value", element.name);
    newOption.innerText = element.name;
    subscriber.appendChild(newOption);
  })
}

// Account render function
function renderAccounts() {
  const accountList = document.getElementById("accountsList");
  accountList.innerHTML = "";
  Li(state.accountList, accountList);
}

// Option rendering function
function renderOptions() {
  const optionList = [document.getElementById("senderNames"), document.getElementById("receiverNames")];
  optionList.forEach(function(subscriber) {
    if (subscriber.id === "senderNames")
    {
      subscriber.innerHTML = `<option value="" selected>From</option>`;
    } else {
      subscriber.innerHTML = `<option value="" selected>To</option>`;
    }
    Option(state.accountList, subscriber);
  })
}

// History rendering function
function renderHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  Li(state.historyList, historyList)
}

// State changing function
function setState(stateName, newValue) {
    state[stateName] = newValue;
}

// Account adding function
function addAccount(event) {
  event.preventDefault();
  const accountName = document.getElementById("accountName").value;
  const accountBalance = document.getElementById("accountBalance").value;
  if (!(accountName) || !(accountBalance)) {
    return
  }
  setState("accountList", [
    ...state.accountList,
    {
      id: Math.round(Math.random()*10000),
      name: accountName,
      balance: accountBalance
    }
  ]);
  renderAccounts();
  renderOptions();
}

// Money sending function
function sendMoney() {
  const senderOptions = document.getElementById("senderNames");
  const receiverOptions = document.getElementById("receiverNames");
  const senderName = senderOptions.options[senderOptions.selectedIndex].value;
  const receiverName = receiverOptions.options[receiverOptions.selectedIndex].value;
  const amount = document.getElementById("transferAmount").value;
  addHistory(senderName, receiverName, amount)
  changeBalance(senderName, receiverName, amount)
}

// History adding function
function addHistory(senderName, receiverName, amount) {
  setState("historyList", [
    ...state.historyList,
    {
      id: Math.round(Math.random()*10000),
      sender: senderName,
      receiver: receiverName,
      amount: amount
    }
  ])
  renderHistory();
}

// Account balance changing function
function changeBalance(senderName, receiverName, amount) {
  const accountList = state.accountList;
  const senderIndex = accountList.findIndex(account => account.name === senderName); // Get the index of the sender
  const receiverIndex = accountList.findIndex(account => account.name === receiverName); // Get the index of the receiver
  accountList[senderIndex] = {...accountList[senderIndex], balance: String(Number(accountList[senderIndex].balance) - Number(amount))} // Decrease the balance of sender by sent amount
  accountList[receiverIndex] = {...accountList[receiverIndex], balance: String(Number(accountList[receiverIndex].balance) + Number(amount))} // Increase the balance of receiver by the received amount
  setState("accountList", accountList)
  renderAccounts();
}