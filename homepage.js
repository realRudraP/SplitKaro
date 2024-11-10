let username=localStorage.getItem("username")||"User";

function getUsername(){
    return localStorage.getItem("username")||null;
}

function redirect(tripID){
    let db= initDB();
    window.location.href="/details.html?eventid="+tripID;

}

function addTripCard(tripName, tripDate, participants,tripID) {
    const tripsGrid = document.getElementById("tripsGrid");

    if (!tripsGrid) {
        console.error("Element with ID 'tripsGrid' not found.");
        return;
    }

    tripCard = document.createElement("div");
    tripCard.className = "bg-white shadow-md rounded-lg p-5 hover:shadow-lg transition duration-300";

    const tripNameElement = document.createElement("h2");
    tripNameElement.className = "text-xl font-semibold text-gray-800";
    tripNameElement.textContent = tripName;
    tripCard.appendChild(tripNameElement);

    const tripDateElement = document.createElement("p");
    tripDateElement.className = "text-gray-600 mt-1";
    let date=new Date(tripDate);
    tripDate=date.toLocaleDateString("en-US",{
        month:"short",
        year:"numeric",
        day:"2-digit"
    })
    tripDateElement.textContent = tripDate;
    tripCard.appendChild(tripDateElement);

    const participantsElement = document.createElement("p");
    participantsElement.className = "text-gray-700 mt-4 text-sm";
    participants=participants.map(participant=>participant.name)
    participantsElement.textContent = `Participants: ${(participants).join(", ")}`;
    tripCard.appendChild(participantsElement);

    const viewButton = document.createElement("button");
    viewButton.className = "mt-4 text-blue-500 hover:text-blue-700 transition duration-200";
    viewButton.textContent = "View Details";
    viewButton.onclick=function(){
        redirect(tripID);
    };
    tripCard.appendChild(viewButton);

    tripsGrid.appendChild(tripCard);
}

async function fetchTrips() {
    const db=await initDB();
    const trips=await db.getAll("trips");
    console.log(trips);
    trips.forEach(trip => {
        let tripName=trip.name;
        let tripDate=trip.date;
        let participants=trip.participants;
        let tripID=trip.id;
        addTripCard(tripName,tripDate,participants,tripID);
    });
    
}


function renderHomeScreen(){
    const usernameContainer=document.getElementById("usernameholder");
    usernameContainer.innerText=username;
    fetchTrips();
}