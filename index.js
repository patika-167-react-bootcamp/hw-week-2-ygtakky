// Default state
const state = {
  accountList: [],
  historyList: [],
  filterList: [{ sender: "", receiver: ""}],
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
  // Generate list items depending on the subscriber
  if (subscriber.id === "accountsList") {
    list.forEach((element) => {
      const newLi = document.createElement("li");
      newLi.setAttribute(
        "class",
        "list-group-item d-flex justify-content-between align-items-center"
      );
      newLi.setAttribute("account-id", element.id); // Give the list item the unique account id
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
      newLi.setAttribute("history-id", element.id); // Give the list item the unique history id
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
    const newOption = document.createElement("option"); // Create the option element
    newOption.setAttribute("value", element.id); // Set option value to the account id
    newOption.innerText = element.name; // Write the account name into the option
    subscriber.appendChild(newOption);
  });
}

// Account list render function
function renderAccounts() {
  const accountList = document.getElementById("accountsList"); // Get account list element
  accountList.innerHTML = ""; // Clear the account list element
  Li(state.accountList, accountList); // Create list items for each account in the state to the account list
}

// Selection list render function
function renderOptions() {
  // Get select list element
  const optionList = [
    document.getElementById("senderNames"),
    document.getElementById("receiverNames"),
    document.getElementById("senderFilter"),
    document.getElementById("receiverFilter")
  ];
  // Generate default options and required options for the sender and receiver lists
  optionList.forEach(function (subscriber) {
    switch (subscriber.id) {
      case "senderNames":
        subscriber.innerHTML = `<option value="" disabled selected hidden>From</option>`;
        break;
      case "receiverNames":
        subscriber.innerHTML = `<option value="" disabled selected hidden>To</option>`;
        break;
      case "senderFilter":
        subscriber.innerHTML = `<option value="" selected>Sender</option>`;
        break;
      case "receiverFilter":
        subscriber.innerHTML = `<option value="" selected>Receiver</option>`;
        break;
      default:
        break;
    }
    Option(state.accountList, subscriber);
  });
}

// Filtration list handling function
function addFilter() {
  const senderFilter = document.getElementById("senderFilter").value;
  const receiverFilter = document.getElementById("receiverFilter").value;
  setState("filterList", [
    {
      sender: senderFilter,
      receiver: receiverFilter
    }
  ])
  renderHistory();
}

// Filter the history list for rendering
function filterList() {
  const filterList = state.filterList[0]; // Get the filter from the state
  const historyList = state.historyList; // Get the history list from the state
  if (filterList.sender === "" && filterList.receiver === "") { // By default dont filter history
    return historyList;
  } else if (filterList.receiver === "") { // If the receiver filter is empty filter by sender filter
    return historyList.filter(history => history.senderId === filterList.sender);
  } else if (filterList.sender === "") { // If the sender filter is empty filter by receiver filter
    return historyList.filter(history => history.receiverId === filterList.receiver);
  } else if (filterList.sender === filterList.receiver) { // If sender and receiver filter is the same bring the all transactions with that account id
    return historyList.filter(history => {
      return history.senderId === filterList.sender || history.receiverId === filterList.receiver
    });
  } else { // If there is a sender and receiver filter bring all the transactions of the sender to receiver
    return historyList.filter(history => {
      return history.senderId === filterList.sender && history.receiverId === filterList.receiver
    });
  }
}

// History list render function
function renderHistory() {
  const historyList = document.getElementById("historyList"); // Get the history list element
  historyList.innerHTML = ""; // Clear the history list element
  const filteredHistoryList = filterList();
  Li(filteredHistoryList, historyList); // Create list items for each history in the state to the history list
}

// Account adding function
function addAccount(event) {
  event.preventDefault(); // Prevent page refresh on submit
  const accountName = document.getElementById("accountName"); // Get the name input element
  const accountBalance = document.getElementById("accountBalance"); // Get the balance input element
  // Check if the inputs are correct
  if (!accountName.value || !accountBalance.value) {
    return alert("Invalid account!");
  }
  // Add the new account into the state
  setState("accountList", [
    ...state.accountList,
    {
      id: String(Math.round(Math.random() * 10000)),
      name: accountName.value,
      balance: accountBalance.value,
    },
  ]);
  // Reset input values
  accountName.value = "";
  accountBalance.value = "";
  // Render accounts and select menu options
  renderAccounts();
  renderOptions();
}

// Account removing function
function removeAccount(event) {
  const accountId = event.target.parentElement.attributes["account-id"].value; // Get the account id of the target account
  const accountList = state.accountList.filter(
    (account) => account.id !== accountId
  ); // Remove the account from the account list
  setState("accountList", accountList); // Update the state with the new account list
  // Render account list and select menu options
  renderAccounts();
  renderOptions();
}

// Money sending function
function sendMoney() {
  const senderOptions = document.getElementById("senderNames"); // Get all the sender options
  const receiverOptions = document.getElementById("receiverNames"); // Get all the receiver options
  const senderId = senderOptions.options[senderOptions.selectedIndex].value; // Get the id of the sender from the option value
  const receiverId =
    receiverOptions.options[receiverOptions.selectedIndex].value; // Get the id of the receiver from the option value
  const amount = document.getElementById("transferAmount").value; // Get the transfer amount from the option value
  // Check if the sender and receiver is different by the id
  if (senderId === receiverId || !amount) {
    return alert("Invalid transaction!");
  }
  // Add transaction to the history
  addHistory(senderId, receiverId, amount);
  // Do the transaction between the sender and receiver
  changeBalance(senderId, receiverId, amount);
}

// History adding function
function addHistory(senderId, receiverId, amount) {
  const sender = state.accountList.find((account) => account.id === senderId); // Get the sender account object by it's id
  const receiver = state.accountList.find(
    (account) => account.id === receiverId
  ); // Get the receiver account object by it's id
  // Add the transaction to the top of the history state
  setState("historyList", [
    {
      id: String(Math.round(Math.random() * 10000)), // A random unique id
      time: new Date(), // Transaction time (current time)
      sender: sender.name,
      senderId: sender.id,
      receiverId: receiver.id,
      receiver: receiver.name,
      amount: amount,
    },
    ...state.historyList,
  ]);
  // Render history list
  renderHistory(state.historyList);
}

// History deleting function bt history id
function deleteHistory(historyId) {
  const historyList = state.historyList.filter(
    (history) => history.id !== historyId
  ); // Remove the history from the history state with by it's id
  setState("historyList", historyList); // Update the history state
  // Render history list
  renderHistory(state.historyList);
}

// Cancel transaction function
function cancelTransaction(event) {
  const historyId = event.target.parentElement.attributes["history-id"].value; // Get the history id of the target history
  const history = state.historyList.find((history) => history.id === historyId); // Get the history object from state by it's id
  // Check if the accounts still exists
  const sender = state.accountList.find(
    (account) => account.id === history.senderId
  ); // Get the sender object from state by it's id
  const receiver = state.accountList.find(
    (account) => account.id === history.receiverId
  ); // Get the receiver object from state by it's id
  // Show a alert if the account is deleted
  if (!sender || !receiver) {
    return alert(
      "One of the accounts is deleted. You cannot cancel this transaction!"
    );
    // Cancel the transaction if the accounts still exist
  } else {
    changeBalance(history.receiverId, history.senderId, history.amount); // Revert the transaction by sending money back
    deleteHistory(historyId); // Delete the history from the history state and render history list
  }
}

// Account balance changing function
function changeBalance(senderId, receiverId, amount) {
  const accountList = state.accountList; // Get the account state
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
  setState("accountList", accountList); // Set the account state to the new values
  renderAccounts(); // Render account list
}