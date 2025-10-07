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
constaddBtn = document.getElementById("add-btn");

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
            ev,dataset.id = e.id;
            addDragEvents(ev);
            col.appendChild(ev);
        });
        daysContainer.appendChild(col);
    });

    // Update of select
}