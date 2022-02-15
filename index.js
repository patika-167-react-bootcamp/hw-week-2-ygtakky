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
      newLi.innerHTML = `<div">${element.time.toLocaleTimeString()} - ${element.sender} sent ${element.receiver} ${element.amount} &#8378<span style="float: right;">&#10003</span></div>`;
      subscriber.appendChild(newLi);
    });
  }
}

// Option creation function for the selection menu
function Option(list, subscriber) {
  list.forEach(element => {
    const newOption = document.createElement("option");
    newOption.setAttribute("value", element.id);
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
  const accountName = document.getElementById("accountName");
  const accountBalance = document.getElementById("accountBalance");
  if (!(accountName) || !(accountBalance)) {
    return
  }
  setState("accountList", [
    ...state.accountList,
    {
      id: String(Math.round(Math.random()*10000)),
      name: accountName.value,
      balance: accountBalance.value
    }
  ]);
  accountName.value = "";
  accountBalance.value = "";
  renderAccounts();
  renderOptions();
}

// Money sending function
function sendMoney() {
  const senderOptions = document.getElementById("senderNames");
  const receiverOptions = document.getElementById("receiverNames");
  const senderId = senderOptions.options[senderOptions.selectedIndex].value;
  const receiverId = receiverOptions.options[receiverOptions.selectedIndex].value;
  const amount = document.getElementById("transferAmount").value;
  if (senderId === receiverId) {
    return
  }
  addHistory(senderId, receiverId, amount)
  changeBalance(senderId, receiverId, amount)
}

// History adding function
function addHistory(senderId, receiverId, amount) {
  const senderName = state.accountList.find(account => account.id === senderId)
  const receiverName = state.accountList.find(account => account.id === receiverId)
  setState("historyList", [
    {
      id: String(Math.round(Math.random()*10000)),
      time: new Date(),
      sender: senderName.name,
      receiver: receiverName.name,
      amount: amount
    },
    ...state.historyList
  ])
  renderHistory();
}

// Account balance changing function
function changeBalance(senderId, receiverId, amount) {
  const accountList = state.accountList;
  const senderIndex = accountList.findIndex(account => account.id === senderId); // Get the index of the sender
  const receiverIndex = accountList.findIndex(account => account.id === receiverId); // Get the index of the receiver
  accountList[senderIndex] = {...accountList[senderIndex], balance: String(Number(accountList[senderIndex].balance) - Number(amount))} // Decrease the balance of sender by sent amount
  accountList[receiverIndex] = {...accountList[receiverIndex], balance: String(Number(accountList[receiverIndex].balance) + Number(amount))} // Increase the balance of receiver by the received amount
  setState("accountList", accountList)
  renderAccounts();
}