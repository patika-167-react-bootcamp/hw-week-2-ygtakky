// Default state
const state = {
  accountList: [],
  historyList: [],
};

// State changing function
function setState(stateName, newValue) {
  state[stateName] = newValue;
}

// Render options on document load
window.addEventListener("load", () => {
  renderOptions();
});

// List item creation function
function Li(list, subscriber) {
  if (subscriber.id === "accountsList") {
    list.forEach((element) => {
      const newLi = document.createElement("li");
      newLi.setAttribute(
        "class",
        "list-group-item d-flex justify-content-between align-items-center"
      );
      newLi.setAttribute("account-id", element.id);
      newLi.innerHTML = `<div class="ms-2 me-auto">${element.name}</div><div class="me-4">${element.balance} &#8378</div><button class="btn btn-danger btn-sm" onclick="removeAccount(event)">X</button>`;
      subscriber.appendChild(newLi);
    });
  } else {
    list.forEach((element) => {
      const newLi = document.createElement("li");
      newLi.setAttribute(
        "class",
        "list-group-item d-flex justify-content-between align-items-center"
      );
      newLi.setAttribute("history-id", element.id);
      newLi.innerHTML = `<div class="ms-2 me-auto">${element.time.toLocaleTimeString()} - ${
        element.sender
      } sent ${element.receiver} ${
        element.amount
      } &#8378</div><button class="btn btn-danger btn-sm" onclick="cancelTransaction(event)">Cancel</button>`;
      subscriber.appendChild(newLi);
    });
  }
}

// Option creation function for the selection menu
function Option(list, subscriber) {
  list.forEach((element) => {
    const newOption = document.createElement("option");
    newOption.setAttribute("value", element.id);
    newOption.innerText = element.name;
    subscriber.appendChild(newOption);
  });
}

// Account render function
function renderAccounts() {
  const accountList = document.getElementById("accountsList");
  accountList.innerHTML = "";
  Li(state.accountList, accountList);
}

// Option rendering function
function renderOptions() {
  const optionList = [
    document.getElementById("senderNames"),
    document.getElementById("receiverNames"),
  ];
  optionList.forEach(function (subscriber) {
    if (subscriber.id === "senderNames") {
      subscriber.innerHTML = `<option value="" selected>From</option>`;
    } else {
      subscriber.innerHTML = `<option value="" selected>To</option>`;
    }
    Option(state.accountList, subscriber);
  });
}

// History rendering function
function renderHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  Li(state.historyList, historyList);
}

// Account adding function
function addAccount(event) {
  event.preventDefault();
  const accountName = document.getElementById("accountName");
  const accountBalance = document.getElementById("accountBalance");
  if (!accountName.value || !accountBalance.value) {
    return;
  }
  setState("accountList", [
    ...state.accountList,
    {
      id: String(Math.round(Math.random() * 10000)),
      name: accountName.value,
      balance: accountBalance.value,
    },
  ]);
  accountName.value = "";
  accountBalance.value = "";
  renderAccounts();
  renderOptions();
}

// Account removing function
function removeAccount(event) {
  const accountId = event.target.parentElement.attributes["account-id"].value;
  const accountList = state.accountList.filter(account => account.id !== accountId);
  setState("accountList", accountList);
  renderAccounts();
  renderOptions();
}

// Money sending function
function sendMoney() {
  const senderOptions = document.getElementById("senderNames");
  const receiverOptions = document.getElementById("receiverNames");
  const senderId = senderOptions.options[senderOptions.selectedIndex].value;
  const receiverId =
    receiverOptions.options[receiverOptions.selectedIndex].value;
  const amount = document.getElementById("transferAmount").value;
  if (senderId === receiverId || !amount) {
    return alert("Invalid transaction!");
  }
  addHistory(senderId, receiverId, amount);
  changeBalance(senderId, receiverId, amount);
}

// History adding function
function addHistory(senderId, receiverId, amount) {
  const sender = state.accountList.find(
    (account) => account.id === senderId
  );
  const receiver = state.accountList.find(
    (account) => account.id === receiverId
  );
  setState("historyList", [
    {
      id: String(Math.round(Math.random() * 10000)),
      time: new Date(),
      sender: sender.name,
      senderId: sender.id,
      receiverId: receiver.id,
      receiver: receiver.name,
      amount: amount,
    },
    ...state.historyList,
  ]);
  renderHistory();
}

// History deleting function
function deleteHistory(historyId) {
  const historyList = state.historyList.filter(history => history.id !== historyId);
  setState("historyList", historyList);
  renderHistory();
}

// Cancel transaction function
function cancelTransaction(event) {
  const historyId = event.target.parentElement.attributes["history-id"].value;
  const history = state.historyList.find(history => history.id === historyId);
  // Check if the accounts still exists
  const sender = state.accountList.find(account => account.id === history.senderId);
  const receiver = state.accountList.find(account => account.id === history.receiverId);
  // Show a alert if the account is deleted
  if (!(sender) || !(receiver)) {
    return alert("One of the accounts is deleted. You cannot cancel this transaction!")
    // Cancel the transaction if the accounts still exist
  } else {
    changeBalance(history.receiverId, history.senderId, history.amount);
    deleteHistory(historyId);
  }
}

// Account balance changing function
function changeBalance(senderId, receiverId, amount) {
  const accountList = state.accountList;
  const senderIndex = accountList.findIndex(
    (account) => account.id === senderId
  ); // Get the index of the sender
  const receiverIndex = accountList.findIndex(
    (account) => account.id === receiverId
  ); // Get the index of the receiver
  accountList[senderIndex] = {
    ...accountList[senderIndex],
    balance: String(Number(accountList[senderIndex].balance) - Number(amount)),
  }; // Decrease the balance of the sender by sent amount
  accountList[receiverIndex] = {
    ...accountList[receiverIndex],
    balance: String(
      Number(accountList[receiverIndex].balance) + Number(amount)
    ),
  }; // Increase the balance of receiver by the received amount
  setState("accountList", accountList);
  renderAccounts();
}