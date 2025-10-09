//Variable date and events for the agenda
let currentDate=new Date();
let events=[];
//Constant varriable for the agenda
const startHour = 8;
const endHour = 24;
const daysContainer = document.getElementById("days-container");
const timeColumn = document.getElementById("time-column");
const weekRange = document.getElementById("week-range");
const modal = document.getElementById("event-modal");
const addBtn = document.getElementById("add-btn");

//Used for the calendar in the header near the profile pic
$(document).ready(function () {

    var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; 
    var dayNames= [ "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday" ];
    
    var newDate = new Date();
    newDate.setDate(newDate.getDate());
        
    setInterval( function() {
        var hours = new Date().getHours();
        $(".hour").html(( hours < 10 ? "0" : "" ) + hours);
        var seconds = new Date().getSeconds();
        $(".second").html(( seconds < 10 ? "0" : "" ) + seconds);
        var minutes = new Date().getMinutes();
        $(".minute").html(( minutes < 10 ? "0" : "" ) + minutes);
        
        $(".month span,.month2 span").text(monthNames[newDate.getMonth()]);
        $(".date span,.date2 span").text(newDate.getDate());
        $(".day span,.day2 span").text(dayNames[newDate.getDay()]);
        $(".year span").html(newDate.getFullYear());
    }, 1000);    
    });

//Function for the days
function getWeekDays(date){
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const days = [];
    for (let i = 0; i < 7; i++){
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        days.push(d);
    }
    return days;
}
//Fuctions to build the calendar
function renderTimeColumn(){
    timeColumn.innerHTML = "";
    for (let h = startHour; h <= endHour; h++){
        const div = document.createElement("div");
        div.classList.add("time-slot");
        div.textContent = `${h}:00`;
        timeColumn.appendChild(div);
    }
}
function renderCalendar(){
    const weekDays = getWeekDays(currentDate);
    daysContainer.innerHTML = "";
    const start = weekDays[0].toLocaleDateString("it-IT",{ day: "numeric", month: "short" });
    const end = weekDays[6].toLocaleDateString("it-IT",{day: "numeric", month:"short"});
    weekRange.textContent = `${start} - ${end}`;

    weekDays.forEach(day =>{
        const col = document.createElement("div");
        col.classList.add("day-column");
        col.dataset.date = day.toISOString();

        const header = document.createElement("div");
        header.classList.add("day-header");
        header.textContent = day.toLocaleDateString("it-IT", {weekday: "short", day: "numeric"});
        col.appendChild(header);

        for (let j = startHour; j < endHour; j++){
            const hourBlock = document.createElement("div");
            hourBlock.classList.add("hour-block");
            col.appendChild(hourBlock);
        }

        const dayEvents = events.filter(e => e.date.toDateString() === day.toDateString());
        dayEvents.forEach(e =>{
            const ev = document.createElement("div");
            ev.classList.add("event");
            ev.textContent = e.title;
            ev.style.top = `${(e.startHour - startHour) * 40 + 25}px`;
            ev.style.height = `${(e.endHour - e.startHour) * 40 - 5}px`;
            ev.dataset.id = e.id;
            addDragEvents(ev);
            col.appendChild(ev);
        });
        daysContainer.appendChild(col);
    });

    // Update of select
    const select = document.getElementById("day-select");
    select.innerHTML="";
    weekDays.forEach(d=> {
        const opt = document.createElement("option");
        opt.value = d.toISOString();
        opt.textContent = d.toLocaleDateString("it-IT", {weekday: "short",day: "numeric"});
        select.appendChild(opt);
    });
}
//Drag and Drop Fuction
function addDragEvents(ev){
    let offsetY, originCol,originTop;
    ev.addEventListener("mousedown", (e)=>{
        offsetY = e.offsetY;
        originCol = ev.parentElement;
        originTop = ev.offsetTop;
        ev.style.zIndex= 1000;
        ev.classList.add("dragging");

        const onMouseMove = (moveEvent) =>{
            ev.style.top = (moveEvent.clientY - originCol.getBoundingClientRect().top - offsetY) + "px";
            //Changes the day if it enters in another colums
            const allCols = document.querySelectorAll(".day-column");
            allCols.forEach(col =>{
                const rect = col.getBoundingClientRect();
                if(
                    moveEvent.clientX >= rect.left &&
                    moveEvent.clientX <= rect.right &&
                    moveEvent.clientY >= rect.top &&
                    moveEvent.clientY <= rect.bottom
                ){
                    if (col !== ev.parentElement) col.appendChild(ev);
                }
            });
        };

        const onMouseUp = ()=>{
            ev.classList.remove("dragging");
            ev.style.zIndex = 1;
            document.removeEventListener("mousemove",onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);

            const newTop = parseInt(ev.style.top);
            const newCol = ev.parentElement;
            const newDay = new Date(newCol.dataset.date);

            let newStart = Math.max(startHour, startHour + Math.floor((newTop - 25) / 40));
            let newEnd = newStart + (parseInt(ev.style.height) / 40);

            const eventObj = events.find(e => e.id == ev.dataset.id);
            if (eventObj){
                eventObj.date = newDay;
                eventObj.startHour = Math.round(newStart);
                eventObj.endHour = Math.round(newEnd);
            }
            renderCalendar();
        };

        document.addEventListener("mousemove",onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}

//Add of events
document.getElementById("save-event").addEventListener("click",() =>{
    const title = document.getElementById("title-input").value.trim();
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;
    const day = new Date (document.getElementById("day-select").value);

    if(!title || !startTime || !endTime){
        alert("Compila tutti i campi");
        return;
    }
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    if (endHour <= startHour){
        alert ("L'ora di fine deve essere dopo  l'inizio");
        return;
    }

    if (day < new Date().setHours(0,0,0,0)){
        alert("Non puoi aggiungere eventi nel passato!");
        return;
    }
    events.push({id: Date.now(), title, date: day, startHour, endHour});
    modal.style.display = "none";
    document.getElementById("title-input").value = "";
    renderCalendar();
});

//This is for the change to the previous and next week
document.getElementById("prev-week").addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 7);
    renderCalendar();
});
document.getElementById("next-week").addEventListener("click", ()=>{
    currentDate.setDate(currentDate.getDate() + 7);
    renderCalendar();
});

addBtn.addEventListener("click", ()=> modal.style.display = "flex");
document.getElementById("close-event").addEventListener("click", () => modal.style.display = "none" );

renderTimeColumn();
renderCalendar();