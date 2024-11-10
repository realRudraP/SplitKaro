const params=new URLSearchParams(window.location.search);
const eventID=params.get("eventid");
function showAddParticipantModal(){
    document.getElementById('participantModal').classList.remove('hidden');
}
function closeAddParticipantModal(){
    document.getElementById('participantModal').classList.add('hidden');
}
function getEventID(){
    const params=new URLSearchParams(window.location.search);
    const eventID=params.get("eventid");
    return eventID;
}
async function renderDetails(eventID){
    let db=await initDB();
    let event=await db.get("trips",eventID);
    let eventName=event.name;
    let rawEventDate=event.date;
    const date=new Date(rawEventDate);
    let eventDate=date.toLocaleDateString("en-US",{
        year:"numeric",
        month:"short",
        day:"2-digit"
    })
    const eventNameHolder=document.getElementById("eventNameHolder");
    const eventDateHolder=document.getElementById("eventDateHolder");
    eventNameHolder.innerText=eventName;
    eventDateHolder.innerText=eventDate;
    let participantsList=event.participants;
    const participantsContainer=document.getElementById("participantsHolder");
    participantsList.forEach(participant => {
        const participantElement=document.createElement("span");
        participantElement.className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold";
        participantElement.textContent=participant.name;
        participantsContainer.append(participantElement);
    });
    const addParticipantElement=document.createElement("button");
    addParticipantElement.className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition duration-300";
    addParticipantElement.textContent="+ Add";
    addParticipantElement.onclick=function(){
        showAddParticipantModal();
    }
    participantsContainer.appendChild(addParticipantElement);
}
renderDetails(eventID);
async function addParticipant(){
    const params=new URLSearchParams(window.location.search);
    const eventID=params.get("eventid");
    let db=await initDB();
    const tx=db.transaction("trips","readwrite");
    const store=tx.objectStore("trips");
    const event=await store.get(eventID);
    const newName=document.getElementById("newParticipantName").value;
    if(event){
        const newParticipant={
            id:participantID(),
            name:newName
        }
        event.participants.push(newParticipant);
        await store.put(event);
        
    }else{
        console.error("Event not found");
        
    }
    await tx.done;
    newName.textContent="";
    window.location.href="/details.html?eventid="+eventID;
}
async function editTripName() {
    const params=new URLSearchParams(window.location.search);
const eventID=params.get("eventid");
    let db=await initDB();
    const tx=db.transaction("trips","readwrite");
    const store=tx.objectStore("trips");
    const event=await store.get(eventID);
    if(event){
        const newName=prompt("Enter new event name");
        event.name=newName;
        await store.put(event);
    }
    window.location.href="/details.html?eventid="+getEventID();
}
