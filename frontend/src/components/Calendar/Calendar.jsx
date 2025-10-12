import React, { useEffect, useRef, useState } from "react";
import "./Calendar.css";

const startHour = 8;
const endHour = 24;

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const titleRef = useRef();
  const descriptionRef = useRef();
  const dayRef = useRef();
  const startTimeRef = useRef();
  const endTimeRef = useRef();
  const colorRef = useRef();

  const timeColumnRef = useRef();
  const daysContainerRef = useRef();
  const weekRangeRef = useRef();

  const API_URL = "http://localhost:3001/events";

  const loadEvents = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Errore ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const parsedEvents = data.map(ev => ({ ...ev, date: new Date(ev.date) }));
      setEvents(parsedEvents);
    } catch (error) {
      console.error("Errore nel caricamento degli eventi:", error);
    }
  };

  const saveEvents = async (updatedEvents) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvents)
      });
      if (!response.ok) throw new Error(`Errore ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error("Errore nel salvataggio degli eventi:", error);
    }
  };

  const handleDeleteEvent = async () => {
    const updated = events.filter(e => e.id !== selectedEvent.id);
    setEvents(updated);
    await saveEvents(updated);
    setSelectedEvent(null);
  };

  const handleSaveEvent = async () => {
    const title = titleRef.current.value.trim();
    const description = descriptionRef.current.value.trim();
    const day = new Date(dayRef.current.value);
    const startHourNum = parseInt(startTimeRef.current.value.split(":")[0]);
    const endHourNum = parseInt(endTimeRef.current.value.split(":")[0]);
    const color = colorRef.current.value;

    if (!title || isNaN(startHourNum) || isNaN(endHourNum)) {
      alert("Compila tutti i campi");
      return;
    }
    if (endHourNum <= startHourNum) {
      alert("L'ora di fine deve essere dopo l'inizio");
      return;
    }

    const newEvent = {
      id: editingEvent?.id || Date.now(),
      title,
      description,
      date: day,
      startHour: startHourNum,
      endHour: endHourNum,
      color
    };

    const updated = editingEvent
      ? events.map(e => e.id === newEvent.id ? newEvent : e)
      : [...events, newEvent];

    setEvents(updated);
    await saveEvents(updated);
    setModalVisible(false);
    setEditingEvent(null);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const addDragEvents = (ev) => {
      let isDragging = false;

      ev.addEventListener("pointerdown", () => {
        isDragging = false;
        ev.style.zIndex = 1000;
        ev.classList.add("dragging");

        const onPointerMove = () => {
          isDragging = true;
        };

        const onPointerUp = async () => {
          ev.classList.remove("dragging");
          ev.style.zIndex = 1;
          document.removeEventListener("pointermove", onPointerMove);
          document.removeEventListener("pointerup", onPointerUp);

          if (!isDragging) {
            const eventId = parseInt(ev.dataset.id);
            const found = events.find(e => e.id === eventId);
            if (found) {
              setEditingEvent(found);
              setModalVisible(true);
            }
            return;
          }

          const newTop = parseInt(ev.style.top);
          const newCol = ev.parentElement;
          const newDay = new Date(newCol.dataset.date);
          const newStart = Math.max(startHour, startHour + Math.floor((newTop - 25) / 40));
          const newEnd = newStart + (parseInt(ev.style.height) / 40);

          const updated = events.map(e =>
            e.id === parseInt(ev.dataset.id)
              ? { ...e, date: newDay, startHour: Math.round(newStart), endHour: Math.round(newEnd) }
              : e
          );
          setEvents(updated);
          await saveEvents(updated);
        };

        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
      });
    };

    const renderTimeColumn = () => {
      const col = timeColumnRef.current;
      if (!col) return;
      col.innerHTML = "";
      for (let h = startHour; h <= endHour; h++) {
        const div = document.createElement("div");
        div.classList.add("time-slot");
        div.textContent = `${h}:00`;
        col.appendChild(div);
      }
    };

    const renderCalendar = () => {
      const weekDays = getWeekDays(currentDate);
      const container = daysContainerRef.current;
      const range = weekRangeRef.current;
      if (!container || !range) return;

      container.innerHTML = "";
      const start = weekDays[0].toLocaleDateString("it-IT", { day: "numeric", month: "short" });
      const end = weekDays[6].toLocaleDateString("it-IT", { day: "numeric", month: "short" });
      range.textContent = `${start} - ${end}`;

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

        container.appendChild(col);
      });
    };

    renderTimeColumn();
    renderCalendar();
  }, [events, currentDate]);

  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };
return (
  <div className="calendar">
    <h2>Weekly Events</h2>

    <div className="mainCalendar">
      <div className="week-nav">
        <button onClick={() => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 7)))}>
          ← Settimana Precedente
        </button>
        <h3 ref={weekRangeRef} aria-live="polite">Settimana</h3>
        <button onClick={() => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 7)))}>
          Settimana Successiva →
        </button>
      </div>

      <div className="calendar-grid">
        <div className="time-column" ref={timeColumnRef}></div>
        <div className="days-grid" ref={daysContainerRef}></div>
      </div>
    </div>

    {/* Bottone flottante per aggiungere evento */}
    <button className="add-button" onClick={() => {
      setEditingEvent(null);
      setModalVisible(true);
    }}>＋</button>

    {/* Modal per aggiunta o modifica evento */}
    {modalVisible && (
      <div className="modal">
        <div className="modal-content">
          <h3>{editingEvent ? "Modifica Evento" : "Nuovo Evento"}</h3>
          <input
            ref={titleRef}
            placeholder="Titolo"
            defaultValue={editingEvent?.title || ""}
          />
          <textarea
            ref={descriptionRef}
            placeholder="Descrizione"
            defaultValue={editingEvent?.description || ""}
          />
          <input
            ref={dayRef}
            type="date"
            defaultValue={editingEvent ? editingEvent.date.toISOString().split("T")[0] : ""}
          />
          <input
            ref={startTimeRef}
            type="time"
            defaultValue={editingEvent ? `${editingEvent.startHour.toString().padStart(2, "0")}:00` : ""}
          />
          <input
            ref={endTimeRef}
            type="time"
            defaultValue={editingEvent ? `${editingEvent.endHour.toString().padStart(2, "0")}:00` : ""}
          />
          <input
            ref={colorRef}
            type="color"
            defaultValue={editingEvent?.color || "#3f51b5"}
          />
          <button onClick={handleSaveEvent}>
            {editingEvent ? "Aggiorna" : "Salva"}
          </button>
          <button onClick={() => {
            setModalVisible(false);
            setEditingEvent(null);
          }}>
            Annulla
          </button>
        </div>
      </div>
    )}

    {/* Popup per visualizzare evento selezionato */}
    {selectedEvent && (
      <div className="event-popup">
        <div className="popup-content">
          <h3>{selectedEvent.title}</h3>
          <p>{selectedEvent.description}</p>
          <p>
            {selectedEvent.date.toLocaleDateString("it-IT")} : {selectedEvent.startHour}:00 → {selectedEvent.endHour}:00
          </p>
          <button onClick={handleDeleteEvent}>🗑️ Elimina</button>
          <button onClick={() => setSelectedEvent(null)}>Chiudi</button>
        </div>
      </div>
    )}
  </div>
);
};

export default Calendar;