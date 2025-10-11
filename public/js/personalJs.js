// --- Variabili principali ---
let currentDate = new Date();
let events = [];

const startHour = 8;
const endHour = 24;
const daysContainer = document.getElementById("days-container");
const timeColumn = document.getElementById("time-column");
const weekRange = document.getElementById("week-range");
const modal = document.getElementById("event-modal");
const addBtn = document.getElementById("add-btn");

// --- Funzioni server ---
async function loadEventsFromServer() {
  try {
    const res = await fetch("/events");
    const data = await res.json();
    events = data.map(ev => ({ ...ev, date: new Date(ev.date) }));
    renderCalendar();
  } catch (err) {
    console.error("Errore caricamento eventi:", err);
  }
}

async function saveEventsToServer(newEvent) {
  try {
    await fetch("/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent)
    });
  } catch (err) {
    console.error("Errore salvataggio eventi:", err);
  }
}

// --- Orario e calendario header ---
$(document).ready(function () {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"];
  const newDate = new Date();
  newDate.setDate(newDate.getDate());

  setInterval(function () {
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const seconds = new Date().getSeconds();

    $(".hour").html((hours < 10 ? "0" : "") + hours);
    $(".minute").html((minutes < 10 ? "0" : "") + minutes);
    $(".second").html((seconds < 10 ? "0" : "") + seconds);

    $(".month span,.month2 span").text(monthNames[newDate.getMonth()]);
    $(".date span,.date2 span").text(newDate.getDate());
    $(".day span,.day2 span").text(dayNames[newDate.getDay()]);
    $(".year span").html(newDate.getFullYear());
  }, 1000);
});

// --- Funzioni calendario ---
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

        ev.addEventListener("click", (event) => {
          showEventInfo(e, ev);
        });

        col.appendChild(ev);
      });
    });

    daysContainer.appendChild(col);
  });
}

// --- Popup info evento ---
function showEventInfo(eventData, element) {
  const popup = document.getElementById("event-info-popup");

  popup.innerHTML = `
    <h4>${eventData.title}</h4>
    <p><em>${eventData.startHour}:00 - ${eventData.endHour}:00</em></p>
    <p>${eventData.description ? eventData.description : "Nessuna descrizione"}</p>
    <div style="display:flex;gap:5px;margin-top:5px;">
      <button id="popup-close-btn" class="close-btn">Chiudi</button>
      <button id="popup-delete-btn" class="delete-btn">Elimina</button>
    </div>
  `;

  const rect = element.getBoundingClientRect();
  popup.style.left = `${rect.right + window.scrollX + 10}px`;
  popup.style.top = `${rect.top + window.scrollY}px`;
  popup.style.display = "block";

  document.getElementById("popup-close-btn").onclick = () => popup.style.display = "none";
  document.getElementById("popup-delete-btn").onclick = async () => {
    events = events.filter(ev => ev.id !== eventData.id);
    await saveEventsToServer({
      id: Date.now(),
      title,
      description,
      date: day,
      startHour: startHourNum,
      endHour: endHourNum,
      color
    });
    popup.style.display = "none";
    renderCalendar();
  };
}

// --- Drag & Drop ---
function addDragEvents(ev) {
  let offsetY, originCol;

  ev.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return; // evita drag su pulsanti popup

    offsetY = e.offsetY;
    originCol = ev.parentElement;
    ev.style.zIndex = 1000;
    ev.classList.add("dragging");

    const onMouseMove = (moveEvent) => {
      ev.style.top = (moveEvent.clientY - originCol.getBoundingClientRect().top - offsetY) + "px";

      document.querySelectorAll(".day-column").forEach(col => {
        const rect = col.getBoundingClientRect();
        if (moveEvent.clientX >= rect.left && moveEvent.clientX <= rect.right &&
            moveEvent.clientY >= rect.top && moveEvent.clientY <= rect.bottom) {
          if (col !== ev.parentElement) col.appendChild(ev);
        }
      });
    };

    const onMouseUp = async () => {
      ev.classList.remove("dragging");
      ev.style.zIndex = 1;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      const newTop = parseInt(ev.style.top);
      const newCol = ev.parentElement;
      const newDay = new Date(newCol.dataset.date);

      let newStart = Math.max(startHour, startHour + Math.floor((newTop - 25) / 40));
      let newEnd = newStart + (parseInt(ev.style.height) / 40);

      const eventObj = events.find(e => e.id == ev.dataset.id);
      if (eventObj) {
        eventObj.date = newDay;
        eventObj.startHour = Math.round(newStart);
        eventObj.endHour = Math.round(newEnd);
      }

      await saveEventsToServer();
      renderCalendar();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

// --- Aggiunta evento ---
document.getElementById("save-event").addEventListener("click", async () => {
  const title = document.getElementById("title-input").value.trim();
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;
  const day = new Date(document.getElementById("day-input").value);
  const color = document.getElementById("color-input").value;
  const description = document.getElementById("description-input").value.trim();

  if (!title || !startTime || !endTime) {
    alert("Compila tutti i campi");
    return;
  }

  const startHourNum = parseInt(startTime.split(":")[0]);
  const endHourNum = parseInt(endTime.split(":")[0]);
  if (endHourNum <= startHourNum) {
    alert("L'ora di fine deve essere dopo l'inizio");
    return;
  }

  events.push({
    id: Date.now(),
    title,
    description,
    date: day,
    startHour: startHourNum,
    endHour: endHourNum,
    color
  });

  await saveEventsToServer();

  modal.style.display = "none";
  document.getElementById("title-input").value = "";
  document.getElementById("description-input").value = "";
  document.getElementById("color-input").value = "#c5bdaf";
  renderCalendar();
});

// --- Navigazione settimana ---
document.getElementById("prev-week").addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() - 7);
  renderCalendar();
});
document.getElementById("next-week").addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() + 7);
  renderCalendar();
});

// --- Modal e inizializzazione ---
addBtn.addEventListener("click", () => modal.style.display = "flex");
document.getElementById("close-event").addEventListener("click", () => modal.style.display = "none");

renderTimeColumn();
loadEventsFromServer();
