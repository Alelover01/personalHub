// ==========================
// Variable date and events
// ==========================
let currentDate = new Date();
let events = [];

// ==========================
// Constant variables
// ==========================
const startHour = 8;
const endHour = 24;
const daysContainer = document.getElementById("days-container");
const timeColumn = document.getElementById("time-column");
const weekRange = document.getElementById("week-range");
const modal = document.getElementById("event-modal");
const addBtn = document.getElementById("add-btn");

// ==========================
// Header clock/calendar
// ==========================
$(document).ready(function () {
  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  ];

  var newDate = new Date();

  setInterval(function () {
    var now = new Date();
    $(".hour").html((now.getHours() < 10 ? "0" : "") + now.getHours());
    $(".minute").html((now.getMinutes() < 10 ? "0" : "") + now.getMinutes());
    $(".second").html((now.getSeconds() < 10 ? "0" : "") + now.getSeconds());

    $(".month span,.month2 span").text(monthNames[newDate.getMonth()]);
    $(".date span,.date2 span").text(newDate.getDate());
    $(".day span,.day2 span").text(dayNames[newDate.getDay()]);
    $(".year span").html(newDate.getFullYear());
  }, 1000);
});

// ==========================
// Calendar core functions
// ==========================
function getWeekDays(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function renderTimeColumn() {
  timeColumn.innerHTML = "";
  for (let h = startHour; h <= endHour; h++) {
    const div = document.createElement("div");
    div.classList.add("time-slot");
    div.textContent = `${h}:00`;
    timeColumn.appendChild(div);
  }
}

// ==========================
// Render calendar + events
// ==========================
function renderCalendar() {
  const weekDays = getWeekDays(currentDate);
  daysContainer.innerHTML = "";
  const start = weekDays[0].toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const end = weekDays[6].toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  weekRange.textContent = `${start} - ${end}`;

  weekDays.forEach(day => {
    const col = document.createElement("div");
    col.classList.add("day-column");
    col.dataset.date = day.toISOString();
    col.style.position = "relative";

    const header = document.createElement("div");
    header.classList.add("day-header");
    header.textContent = day.toLocaleDateString("it-IT", { weekday: "short", day: "numeric" });
    col.appendChild(header);

    for (let j = startHour; j < endHour; j++) {
      const hourBlock = document.createElement("div");
      hourBlock.classList.add("hour-block");
      col.appendChild(hourBlock);
    }

    const dayEvents = events.filter(e => e.date.toDateString() === day.toDateString());
    dayEvents.sort((a, b) => a.startHour - b.startHour);

    const overlaps = [];
    dayEvents.forEach(e => {
      let placed = false;
      for (let group of overlaps) {
        if (e.startHour < group[group.length - 1].endHour) {
          group.push(e);
          placed = true;
          break;
        }
      }
      if (!placed) overlaps.push([e]);
    });

    overlaps.forEach(group => {
      const total = group.length;
      group.forEach((e, i) => {
        const ev = document.createElement("div");
        ev.classList.add("event");
        ev.textContent = e.title;
        ev.style.background = e.color || "var(--footer-bg)";
        ev.dataset.id = e.id;

        ev.style.top = `${(e.startHour - startHour) * 41 + 30}px`;
        ev.style.height = `${(e.endHour - e.startHour) * 41 - 6}px`;
        ev.style.left = `${(i / total) * 100}%`;
        ev.style.width = `${100 / total - 3}%`;

        addDragEvents(ev);
        col.appendChild(ev);
      });
    });

    daysContainer.appendChild(col);
  });

  const select = document.getElementById("day-select");
  select.innerHTML = "";
  weekDays.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.toISOString();
    opt.textContent = d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric" });
    select.appendChild(opt);
  });
}

// ==========================
// Show / Hide event popup
// ==========================
function showEventInfo(eventData, element) {
  const popup = document.getElementById("event-info-popup");
  const container = document.querySelector(".calendar-grid");
  const containerRect = container.getBoundingClientRect();

  // Contenuto del popup con pulsanti
  popup.innerHTML = `
    <h4>${eventData.title}</h4>
    <p><em>${eventData.startHour}:00 - ${eventData.endHour}:00</em></p>
    <p>${eventData.description ? eventData.description : "Nessuna descrizione"}</p>
    <div class="popup-actions">
      <button class="close-btn">Chiudi</button>
      <button class="delete-btn">Elimina</button>
    </div>
  `;

  // Posizionamento intelligente
  const rect = element.getBoundingClientRect();
  let left = rect.right + 10;
  if (left + 250 > containerRect.right) {
    left = rect.left - 260;
  }
  popup.style.left = `${left + window.scrollX}px`;
  popup.style.top = `${rect.top + window.scrollY}px`;
  popup.style.display = "block";

  // Listener per pulsante Chiudi
  popup.querySelector(".close-btn").addEventListener("click", () => {
    popup.style.display = "none";
    document.removeEventListener("click",hidePopup); 
    //In questo modo quando fai click di nuovo sul evento esso non faccia partire il drag
  });

  // Listener per pulsante Elimina
  popup.querySelector(".delete-btn").addEventListener("click", () => {
    if (confirm(`Eliminare l'evento "${eventData.title}"?`)) {
      const index = events.findIndex(e => e.id === eventData.id);
      if (index !== -1) {
        events.splice(index, 1);
        renderCalendar();
        popup.style.display = "none";
      }
    }
  });

  // Chiudi cliccando fuori dal popup (ritardato per evitare conflitti)
  setTimeout(() => {
    document.addEventListener("click", hidePopup);
  }, 150);
}


function hidePopup(e) {
  const popup = document.getElementById("event-info-popup");
  if (!popup.contains(e.target)) {
    popup.style.display = "none";
    document.removeEventListener("click", hidePopup);
  }
}

// ==========================
// Drag and Drop (fixed)
// ==========================
function addDragEvents(ev) {
  let offsetY, originCol, startX, startY, isDragging = false;

  ev.addEventListener("mousedown", (e) => {
    offsetY = e.offsetY;
    originCol = ev.parentElement;
    startX = e.clientX;
    startY = e.clientY;
    isDragging = false;

    ev.style.zIndex = 1000;
    ev.classList.add("dragging");

    const onMouseMove = (moveEvent) => {
      const dx = Math.abs(moveEvent.clientX - startX);
      const dy = Math.abs(moveEvent.clientY - startY);
      if (dx > 5 || dy > 5) isDragging = true;

      if (isDragging) {
        ev.style.top =
          moveEvent.clientY -
          originCol.getBoundingClientRect().top -
          offsetY +
          "px";

        const allCols = document.querySelectorAll(".day-column");
        allCols.forEach((col) => {
          const rect = col.getBoundingClientRect();
          if (
            moveEvent.clientX >= rect.left &&
            moveEvent.clientX <= rect.right &&
            moveEvent.clientY >= rect.top &&
            moveEvent.clientY <= rect.bottom
          ) {
            if (col !== ev.parentElement) col.appendChild(ev);
          }
        });
      }
    };

    const onMouseUp = (upEvent) => {
      ev.classList.remove("dragging");
      ev.style.zIndex = 1;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (!isDragging) {
        upEvent.stopPropagation();
        showEventInfo(events.find((e) => e.id == ev.dataset.id), ev);
        return;
      }

      const newTop = parseInt(ev.style.top);
      const newCol = ev.parentElement;
      const newDay = new Date(newCol.dataset.date);

      let newStart = Math.max(startHour, startHour + Math.floor((newTop - 25) / 40));
      let newEnd = newStart + parseInt(ev.style.height) / 40;

      const eventObj = events.find((e) => e.id == ev.dataset.id);
      if (eventObj) {
        eventObj.date = newDay;
        eventObj.startHour = Math.round(newStart);
        eventObj.endHour = Math.round(newEnd);
      }
      renderCalendar();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

// ==========================
// Add / Save new event
// ==========================
document.getElementById("save-event").addEventListener("click", () => {
  const title = document.getElementById("title-input").value.trim();
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;
  const day = new Date(document.getElementById("day-select").value);
  const color = document.getElementById("color-input").value;
  const description = document.getElementById("description-input").value.trim();

  if (!title || !startTime || !endTime) {
    alert("Compila tutti i campi");
    return;
  }
  const startHour = parseInt(startTime.split(":")[0]);
  const endHour = parseInt(endTime.split(":")[0]);
  if (endHour <= startHour) {
    alert("L'ora di fine deve essere dopo l'inizio");
    return;
  }

  if (day < new Date().setHours(0, 0, 0, 0)) {
    alert("Non puoi aggiungere eventi nel passato!");
    return;
  }

  events.push({
    id: Date.now(),
    title,
    description,
    date: day,
    startHour,
    endHour,
    color
  });

  modal.style.display = "none";
  document.getElementById("title-input").value = "";
  document.getElementById("description-input").value = "";
  document.getElementById("color-input").value = "#c5bdaf";
  renderCalendar();
});

// ==========================
// Week navigation + modal
// ==========================
document.getElementById("prev-week").addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() - 7);
  renderCalendar();
});
document.getElementById("next-week").addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() + 7);
  renderCalendar();
});

addBtn.addEventListener("click", () => modal.style.display = "flex");
document.getElementById("close-event").addEventListener("click", () => modal.style.display = "none");

// ==========================
// Initial render
// ==========================
renderTimeColumn();
renderCalendar();