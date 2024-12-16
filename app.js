// UUID generator for trip IDs
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
              v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// ID generator for participant IDs
function participantID() {
    return "xxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
              v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Initialize the IndexedDB database
async function initDB() {
    const db = await idb.openDB("SplitKaro", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("trips")) {
                db.createObjectStore("trips", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("transactions")) {
                const transactionStore=db.createObjectStore("transactions", { keyPath: "transactionID" });
                transactionStore.createIndex("eventID","eventID",{unique:false});
            }
        },
    });
    return db;
}

// Save a new trip with participants
async function saveTrip() {
    const db = await initDB();
    if (!db) {
        return;
    }

    const tripName = document.getElementById("tripName").value;
    const tripDate = document.getElementById("tripDate").value;
    const participantInputs = document.querySelectorAll("#participantsList input");
    const participants = Array.from(participantInputs)
        .map((input) => {
            const name = input.value.trim();
            if (!name) return null;
            return {
                id: participantID(),
                name: name,
            };
        })
        .filter((participant) => participant);

    if (!tripDate || !tripName || participants.length === 0) {
        alert("All the fields must be filled");
        return;
    }

    const tripData = {
        id: uuidv4(),
        name: tripName,
        date: tripDate,
        participants: participants,
        totalAmountSpent:0,
        debts:[]
    };

    try {
        await db.add("trips", tripData);
        document.getElementById("tripName").value = "";
        document.getElementById("tripDate").value = "";
        closeModal();
        renderHomeScreen();
    } catch (error) {
        console.error("Error saving trip.", error);
    }
    window.location.href = "/index.html";
}

// Show the Add Transaction Modal
async function showAddTransactionModal() {
    const payerDropDown = document.getElementById("selectPayer");
    const payeeDropdown = document.getElementById("selectPayees");
    let db = await initDB();
    if (!db) {
        console.error("Error opening Database while showing Transaction Modal");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const eventID = params.get("eventid");
    const tx = db.transaction("trips", "readonly");
    const tripsStore = tx.objectStore("trips");
    const event = await tripsStore.get(eventID);

    if (!event) {
        console.error("Event not found.");
        return;
    }

    // Clear previous dropdown options (in case modal was opened before)
    payerDropDown.innerHTML = "";
    payeeDropdown.innerHTML = "";

    // Populate the payer and payee dropdowns with participants
    const participants = event.participants;
    participants.forEach(participant => {
        const payerOption = document.createElement("option");
        payerOption.value = participant.id;
        payerOption.text = participant.name;
        payerDropDown.appendChild(payerOption);

        const payeeOption = document.createElement("option");
        payeeOption.value = participant.id;
        payeeOption.text = participant.name;
        payeeDropdown.appendChild(payeeOption);
    });
    const transactionModal = document.getElementById("addTransactionModalBackground");
    transactionModal.classList.remove("hidden");
}

async function submitTransaction() {
    const newTransactionID=uuidv4();
    const params = new URLSearchParams(window.location.search);
    const eventID = params.get("eventid");
    const payerDropDown=document.getElementById("selectPayer");
    let db=await initDB();
    if(!db){
        console.error("Error opening DB!");
        window.location.href="/details.html?eventid="+eventID;
        return;
    }
    let tx=db.transaction(["trips","transactions"],"readwrite");
    let tripsStore=tx.objectStore("trips");
    let transactionsStore=tx.objectStore("transactions");
    let event=tripsStore.get(eventID);
    const transactions=await transactionsStore.index("eventID").getAll(eventID);
    
    const transactionNameContainer=document.getElementById("transactionNameInput");
    let transactionName=transactionNameContainer.value;
    const amountHolder=document.getElementById("totalAmount");
    if(transactionName===''||amountHolder.value===''){
        alert("Please fill all the fields");
        return;
    }
    const customSplitContainer = document.getElementById("customSplit");
    const payeeElements = customSplitContainer.querySelectorAll(".flex");
    const payeeAmounts = [];
    
    let currentTotal=0;
    let totalAmount=parseFloat(amountHolder.value);
    const splitRemainingEquallyHolder=document.getElementById("splitRemainingEqually");
    let splitRemainingEqually=splitRemainingEquallyHolder.checked;
    if(payeeElements.length===0){
        alert("Please select the payees!");
    }
    let numberOfPeople=0;
  payeeElements.forEach(payeeElement => {
    numberOfPeople++;
    const payeeName = payeeElement.querySelector("input[readonly]").value;

    // Extracting payee ID (stored in the hidden input)
    const payeeId = payeeElement.querySelector("input[type='hidden']").value;

    const payableAmount = parseFloat(payeeElement.querySelector("input[data-amount]").value) || 0;
    currentTotal+=payableAmount;
    payeeAmounts.push({
      id: payeeId,
      name: payeeName,
      amount: payableAmount
    });
  });
  let commonCharges=0;
  if(currentTotal>totalAmount){
    alert("Individual amounts sum exceed total amount");
    return;
    }else if((totalAmount-currentTotal)>0.1){
        if(!splitRemainingEqually){
        alert("Individual amounts sum is not equal to total amount");
        return;
    }else{
        commonCharges=(totalAmount-currentTotal)/numberOfPeople;
        }
    }
    
    
    const transacation={
        transactionID:newTransactionID,
        eventID:eventID,
        transacationName:transactionName,
        payerName:payerDropDown.options[payerDropDown.selectedIndex].text,
        payerID:payerDropDown.value,
        amount:parseFloat(amountHolder.value),
        payees:payeeAmounts,
        commonCharges:parseFloat(commonCharges),
        timestamp:Date.now()
    }
    event["totalAmountSpent"]+=parseFloat(amountHolder.value);
    
    await transactionsStore.put(transacation);
    await tx.done;
    localStorage.setItem("lastTransaction",String(Date.now()));
    closeModal();
    updateDebts();
    window.location.href="/details.html?eventid="+eventID;
}

function createTransactionDiv(transaction, participants) {
    const container = document.createElement("div");
    container.className = "bg-gray-50 p-4 rounded-lg border border-gray-200";

    // Title (e.g., "Taxi")
    const titleEl = document.createElement("p");
    titleEl.className = "text-gray-800 font-medium";
    titleEl.textContent = transaction.name;
    container.appendChild(titleEl);

    // Payer (e.g., "Paid by: Bob")
    const payerName = participants.find(p => p.id === transaction.payerID)?.name || 'Unknown';
    const payerEl = document.createElement("p");
    payerEl.className = "text-sm text-gray-600";
    payerEl.textContent = `Paid by: ${payerName}`;
    container.appendChild(payerEl);

    // Total amount paid by the payer
    const totalAmountEl = document.createElement("p");
    totalAmountEl.className = "text-sm text-gray-600";
    totalAmountEl.textContent = `Total Amount Paid: ₹${transaction.amount.toFixed(2)}`;
    container.appendChild(totalAmountEl);

    // Common charges (e.g., "Common Charges: 10")
    if (transaction.commonCharges > 0) {
        const commonChargesEl = document.createElement("p");
        commonChargesEl.className = "text-gray-600 text-sm";
        commonChargesEl.textContent = `Common Charges: ₹${transaction.commonCharges.toFixed(2)}`;
        container.appendChild(commonChargesEl);
    }

    // Container for debts
    const debtsContainer = document.createElement("div");
    debtsContainer.className = "mt-2";

    // Loop through each debt and add it to the debts container
    transaction.payees.forEach(payee => {
        if (payee.id !== transaction.payerID) {
            const payeeName = participants.find(p => p.id === payee.id)?.name || 'Unknown';
            const debtEl = document.createElement("p");
            debtEl.className = "text-gray-600 text-sm";
            debtEl.innerHTML = `${payeeName} owes <strong>₹${payee.amount.toFixed(2)}</strong>`;
            debtsContainer.appendChild(debtEl);
        }
    });

    // Append debts container to main container
    container.appendChild(debtsContainer);

    // Add delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
        deleteTransaction(transaction.transactionID);
    });
    container.appendChild(deleteButton);

    return container;
}

async function populateTransactions() {
    const db=await initDB();
    let tx = db.transaction(["transactions","trips"], "readonly");
    const transactionStore = tx.objectStore("transactions");
    const index = transactionStore.index("eventID");
    const transactions = await index.getAll(eventID);
    const tripStore=tx.objectStore("trips");
    const trip=await tripStore.get(eventID)
    console.log(trip);
    

    if (!transactions) {
        console.error("Event not found");
        return;
    }

    const participants = trip.participants || [];
    
    console.log(transactions);
    

    // Populate payer and payee dropdowns in the modal
    const selectPayer = document.getElementById("selectPayer");
    const selectPayees = document.getElementById("selectPayees");

    selectPayer.innerHTML = "";
    selectPayees.innerHTML = "";

    participants.forEach(participant => {
        const option = document.createElement("option");
        option.value = participant.id;
        option.text = participant.name;
        selectPayer.add(option.cloneNode(true));
        selectPayees.add(option);
    });

    // Display transactions in the allTransactionsContainer
    const allTransactionsContainer = document.getElementById("allTransactionsContainer");
    allTransactionsContainer.innerHTML = ""; // Clear existing transactions

    transactions.forEach(transaction => {
        const transactionElement = createTransactionDiv(transaction, participants);
        allTransactionsContainer.appendChild(transactionElement);
    });
}

async function calculateDebts(transactions, participants) {
    const balances = {}; 
    const participantMap = {}; 
    const debtsMap = {}; 
    
    participants.forEach(participant => {
        balances[participant.id] = 0;
        participantMap[participant.id] = participant.name;
    });

    transactions.forEach(transaction => {
        const payerId = transaction.payerID;
        const totalAmount = transaction.amount;
        const commonCharges = transaction.commonCharges;

        balances[payerId] += totalAmount;

        transaction.payees.forEach(payee => {
            const payeeId = payee.id;
            const amountOwed = payee.amount + commonCharges;
            balances[payeeId] -= amountOwed;
        });
    });

    // Create consolidated debts
    transactions.forEach(transaction => {
        const payerId = transaction.payerID;
        const payerName = participantMap[payerId];
        const commonCharges = transaction.commonCharges;

        transaction.payees.forEach(payee => {
            const payeeId = payee.id;
            if (payeeId !== payerId) {
                const payeeName = participantMap[payeeId];
                const amount = payee.amount + commonCharges;

                // Use a unique key for each payer-payee pair
                const debtKey = `${payeeId}-${payerId}`; // Note: payeeId comes first

                if (!debtsMap[debtKey]) {
                    // Create a new debt entry if it doesn't exist
                    debtsMap[debtKey] = {
                        from: payeeName,
                        to: payerName,
                        amount:0
                    };
                }

                // Update the amount for the payer-payee pair
                debtsMap[debtKey].amount += amount;
            }
        });
    });

    // Convert debtsMap to an array
    const debts = Object.values(debtsMap);
    localStorage.setItem("lastDebtCache", String(Date.now()));
    return debts;
}

async function updateDebts() {
    const params = new URLSearchParams(window.location.search);
    const eventID = params.get("eventid");
    const lastTransaction = localStorage.getItem("lastTransaction");
    const lastDebtCache = localStorage.getItem("lastDebtCache");
    let debts;
    const db = await initDB();

    let tx = db.transaction(["trips", "transactions"], "readwrite");
    const transactionStore = tx.objectStore("transactions");
    const index = transactionStore.index("eventID");
    const transactions = await index.getAll(eventID);
    const tripsStore = tx.objectStore("trips");
    const event = await tripsStore.get(eventID);
    const participants = event.participants;

    if (lastTransaction && lastDebtCache && lastTransaction <= lastDebtCache && event.debts) {
        debts = event.debts;
        alert("Using last debt cache.");
    } else {
        debts = await calculateDebts(transactions, participants);
        event.debts = debts;
        event.lastDebtCache = String(Date.now());
        localStorage.setItem("lastDebtCache", event.lastDebtCache);
        tripsStore.put(event);
        await tx.done;

        alert("Debts recalculated.");
    }
}

async function deleteTransaction(transactionId) {
    if (!confirm("Are you sure you want to delete this transaction?")) {
        return; 
    }
    const db=await initDB();
    let tx = db.transaction(["transactions"], "readwrite");
    const transactionStore = tx.objectStore("transactions");
    transactionStore.delete(transactionId);
    await tx.done;
    localStorage.setItem("lastTransaction",String(Date.now()))
    calculateDebts();
}