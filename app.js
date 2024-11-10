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
        totalAmountSpent:0
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
        transactionID:uuidv4(),
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
    closeModal();
    window.location.href="/details.html?eventid="+eventID;
}

function createTransactionDiv(title, payer, debts, payerID, commonCharges, totalAmount) {
    // Create the main container div
    const container = document.createElement("div");
    container.className = "bg-gray-50 p-4 rounded-lg border border-gray-200";

    // Title (e.g., "Taxi")
    const titleEl = document.createElement("p");
    titleEl.className = "text-gray-800 font-medium";
    titleEl.textContent = title;
    container.appendChild(titleEl);

    // Payer (e.g., "Paid by: Bob")
    const payerEl = document.createElement("p");
    payerEl.className = "text-sm text-gray-600";
    payerEl.textContent = `Paid by: ${payer}`;
    container.appendChild(payerEl);

    // Total amount paid by the payer
    const totalAmountEl = document.createElement("p");
    totalAmountEl.className = "text-sm text-gray-600";
    totalAmountEl.textContent = `Total Amount Paid: $${totalAmount}`;
    container.appendChild(totalAmountEl);

    // Common charges (e.g., "Common Charges: $10")
    if (commonCharges > 0) {
        const commonChargesEl = document.createElement("p");
        commonChargesEl.className = "text-gray-600 text-sm";
        commonChargesEl.textContent = `Common Charges: $${commonCharges}`;
        container.appendChild(commonChargesEl);
    }

    // Container for debts
    const debtsContainer = document.createElement("div");
    debtsContainer.className = "flex justify-between items-center text-gray-700 text-sm mt-2";

    // Loop through each debt and add it to the debts container
    debts.forEach(({ name, amount, id }) => {
        if (id !== payerID) {
            const debtEl = document.createElement("span");
            debtEl.innerHTML = `${name} owes <strong>$${amount}</strong>`;
            debtsContainer.appendChild(debtEl);
        }
    });

    // Append debts container to main container
    container.appendChild(debtsContainer);

    return container;
}


async function populateTransactions(){
    const params = new URLSearchParams(window.location.search);
    const eventID = params.get("eventid");
    let db=await initDB();
    let tx=db.transaction(["trips","transactions"],"readwrite");
    const transactionStore=tx.objectStore("transactions");
    const index=transactionStore.index("eventID");
    const results=await index.getAll(eventID);
    const bigContainer=document.getElementById("allTransactionsContainer");
    results.forEach(result => {
        const transactionContainer=createTransactionDiv(result["transacationName"],result["payerName"],result["payees"],result["payerID"],result["commonCharges"],result["amount"]);
        bigContainer.appendChild(transactionContainer);
    });
    await tx.done;
}

