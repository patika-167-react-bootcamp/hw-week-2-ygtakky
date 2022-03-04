// Default state
const state = {
  accountList: [],
  historyList: [],
  filterList: [{ sender: "", receiver: "" }],
  productList: [],
  cart: [{ currentUser: "",cartTotal: 0 , products: []}],
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
  switch (subscriber.id) {
    case "accountsList":
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
      break;
    case "historyList":
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
      break;
    case "productList":
      list.forEach((element) => {
        const newLi = document.createElement("li");
        newLi.setAttribute(
          "class",
          "list-group-item d-flex align-items-center justify-content-between"
        );
        newLi.setAttribute("product-id", element.id); // Give the list item the unique history id
        newLi.innerHTML = `${element.name} - ${element.quantity} in stock - ${element.price} &#8378 <button class="btn btn-sm btn-success" onclick="addToCart(event)">Add to cart</button>`;
        subscriber.appendChild(newLi);
      });
      break;
    case "cart":
      list[0].products.forEach((element) => {
        const newLi = document.createElement("li");
        newLi.setAttribute(
          "class",
          "list-group-item d-flex align-items-center justify-content-between"
        );
        newLi.setAttribute("cartProduct-id", element.id); // Give the list item the unique history id
        newLi.innerHTML = `${element.name} - ${element.quantity} in cart - ${element.price} &#8378`;
        subscriber.appendChild(newLi);
      });
      break;
    default:
      break;
  }
}

// Option creation function for the selection menu
function Option(list, subscriber) {
  list.forEach((element) => {
    const newOption = document.createElement("option"); // Create the option element
    if (state.cart[0].currentUser === element.id) {
      newOption.setAttribute("selected", true)
    }
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
    document.getElementById("receiverFilter"),
    document.getElementById("cartUser"),
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
      case "cartUser":
        if (state.cart[0].currentUser === "") {
          subscriber.innerHTML = `<option value="" disabled selected hidden>User</option>`;
        } else {
          subscriber.innerHTML = ``
        }
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
      receiver: receiverFilter,
    },
  ]);
  renderHistory();
}

// Filter the history list for rendering
function filterList() {
  const filterList = state.filterList[0]; // Get the filter from the state
  const historyList = state.historyList; // Get the history list from the state
  if (filterList.sender === "" && filterList.receiver === "") {
    // By default dont filter history
    return historyList;
  } else if (filterList.receiver === "") {
    // If the receiver filter is empty filter by sender filter
    return historyList.filter(
      (history) => history.senderId === filterList.sender
    );
  } else if (filterList.sender === "") {
    // If the sender filter is empty filter by receiver filter
    return historyList.filter(
      (history) => history.receiverId === filterList.receiver
    );
  } else if (filterList.sender === filterList.receiver) {
    // If sender and receiver filter is the same bring the all transactions with that account id
    return historyList.filter((history) => {
      return (
        history.senderId === filterList.sender ||
        history.receiverId === filterList.receiver
      );
    });
  } else {
    // If there is a sender and receiver filter bring all the transactions of the sender to receiver
    return historyList.filter((history) => {
      return (
        history.senderId === filterList.sender &&
        history.receiverId === filterList.receiver
      );
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
function addAccount() {
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
      id: idGen(),
      name: accountName.value,
      balance: Number(accountBalance.value),
    },
  ]);
  // Reset input values
  accountName.value = "";
  accountBalance.value = null;
  // Render accounts and select menu options
  renderAccounts();
  renderOptions();
}

// Account removing function
function removeAccount(event) {
  const accountId = event.target.parentElement.attributes["account-id"].value; // Get the account id of the target account
  const accountIndex = state.accountList.findIndex(account => account.id === accountId);
  const accountList = state.accountList.slice(accountIndex, 1); // Remove the account from the account list
  console.log(accountList)
  setState("accountList", accountList); // Update the state with the new account list
  if (state.cart[0].currentUser === accountId) {
    setState("cart", [{
      currentUser: "",
      products: [],
      total: 0
    }])
  }
  // Render account list and select menu options
  renderCart();
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
  changeBalance(senderId, -amount);
  changeBalance(receiverId, amount);
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
      id: idGen(), // A random unique id
      time: new Date(), // Transaction time (current time)
      sender: sender.name,
      senderId: sender.id,
      receiverId: receiver.id,
      receiver: receiver.name,
      amount: Number(amount),
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
    // Revert the transaction by sending money back
    changeBalance(history.receiverId, -history.amount);
    changeBalance(history.senderId, history.amount);
    deleteHistory(historyId); // Delete the history from the history state and render history list
  }
}

// Account balance change function
function changeBalance(accountId, amount) {
  const accountList = state.accountList; // Get the account state
  const accountIndex = accountList.findIndex(
    (account) => account.id === accountId
  ); // Get the index of the account
  accountList[accountIndex] = {
    ...accountList[accountIndex],
    balance: accountList[accountIndex].balance + Number(amount),
  };
  setState("accountList", accountList); // Set the account state to the new values
  renderAccounts(); // Render account list
}

// Product stock change function
function changeStock(cartProductList, sign) {
  const productList = state.productList;
  if (sign === "+")
  {
    cartProductList.forEach((cartProduct, index) => {
      const productIndex = productList.findIndex(product => product.id === cartProduct.id);
      productList[productIndex] = {
        ...productList[productIndex],
        quantity: productList[productIndex] + cartProductList[index].quantity
      };
    })
  } else if (sign === "-") {
    cartProductList.forEach((cartProduct, index) => {
      const productIndex = productList.findIndex(product => product.id === cartProduct.id);
      productList[productIndex] = {
        ...productList[productIndex],
        quantity: productList[productIndex].quantity - cartProductList[index].quantity
      };
    })
  }
  setState("productList", productList);
  renderProducts();
}

// Product add function
function addProduct() {
  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const productQuantity = document.getElementById("productQuantity");
  if (productName && productPrice && productQuantity) {
    setState("productList", [
      ...state.productList,
      {
        id: idGen(),
        name: productName.value,
        price: Number(productPrice.value),
        quantity: Number(productQuantity.value),
      },
    ]);
    // Reset product input values
    productName.value = "";
    productPrice.value = null;
    productQuantity.value = null;
    renderProducts();
  } else {
    alert("Invalid product input!");
  }
}

// Render products function
function renderProducts() {
  const productList = document.getElementById("productList"); // Get the product list element
  productList.innerHTML = ""; // Clear the product list element
  Li(state.productList, productList); // Create list items for each history in the state to the history list
}

// Set cart user function
function setCartUser() {
  const cartUser = document.getElementById("cartUser").value;
  setState("cart", [
    {
      currentUser: cartUser,
      products: [],
      total: 0,
    },
  ]);
  renderCart();
}

// Add cart function
function addToCart(event) {
  if (!state.cart[0].currentUser) {
    alert("No user selected for cart!");
  } else {
    const cartProducts = state.cart[0].products;
    const productId = event.target.parentElement.attributes["product-id"].value;
    const productIndex = cartProducts.findIndex(
      (product) => product.id === productId
    );
    if (productIndex !== -1) {
      cartProducts[productIndex] = {
        ...cartProducts[productIndex],
        quantity: cartProducts[productIndex].quantity + 1,
      };
    } else {
      const product = state.productList.find(
        (product) => product.id === productId
      );
      cartProducts.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }
    const cartTotal = state.cart[0].products.reduce((acc, curr) => {
      return acc + curr.quantity * curr.price;
    }, 0);
    setState("cart", [
      {
        currentUser: state.cart[0].currentUser,
        products: cartProducts,
        total: cartTotal
      },
    ]);
    renderCart();
  }
}

// Checkout function
function checkout() {
  const currentAccountId = state.cart[0].currentUser;
  const total = state.cart[0].total;
  changeBalance(currentAccountId, -total);
  changeStock(state.cart[0].products, "-");
  setState("cart", [
    {
      currentUser: currentAccountId,
      products: [],
      total: 0
    }
  ])
  renderAccounts();
  renderCart();
}

// Render cart function
function renderCart() {
  const cart = document.getElementById("cart");
  const cartTotalElement = document.getElementById("cartTotal");
  const cartTotal = state.cart[0].total;
  cartTotalElement.innerHTML = `${cartTotal} &#8378`;
  cart.innerHTML = "";
  Li(state.cart, cart);
}

// Id generator helper function
function idGen() {
  return String(Math.round(Math.random() * 10000));
}
