import React, { useEffect, useRef, useState } from "react";
import "./Calendar.css";

const startHour = 8;
const endHour = 24;

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [draggingEvent, setDraggingEvent] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  //Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    color: "#3f51b5"
  });

  /*
  const titleRef = useRef();
  const descriptionRef = useRef();
  const dayRef = useRef();
  const startTimeRef = useRef();
  const endTimeRef = useRef();
  const colorRef = useRef();

  const timeColumnRef = useRef();
  const daysContainerRef = useRef();
  const weekRangeRef = useRef(); */

  const API_URL = "/events";

  //Load events in the backend
  const loadEvents = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Errore ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const parsedEvents = data.map(ev => ({ ...ev, date: new Date(ev.date) }));
      setEvents(parsedEvents);
    } catch (error) {
      console.error("Error in the loading of the events:", error);
    }
  };

  //Save events in the backend
  const saveEvents = async (updatedEvents) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvents)
      });
      if (!response.ok) throw new Error(`Errore ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error("Error in the save of the events:", error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getWeekDay = (date) =>{
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7}, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };
  const weekDays = getWeekDay(currentDate);

  //Navigate the week 
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  const goToNextWeek = () => {
    const newDate = newDate(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  //Modal of the new event
  const openModalForNewEvent = () =>{
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      color: "#3f51b5"
    });
    setModalVisible(true);
  };
  const openModalForEdit = (event) =>{
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      date: event.date.toISOString().split("T")[0],
      startTime: `${event.startHour.toString().padStart(2, "0")}:00`,
      endTime: `${event.endHour.toString().padStart(2, "0")}:00`,
      color: event.color || "#3f51b5"
    });
    setModalVisible(true);
  };

  //Save Events
  const handleSaveEvent = async() => {
    const {title,description,date,startTime, endTime, color} = formData;

    if (!title.trim() || !date || !startTime || !endTime){
      alert("Compila tutti i campi obbligatori");
      return ;
    }

    const startHourNum = parseInt(startTime.split(":")[0]);
    const endHourNum = parseInt(endTime.split(":")[0]);

    if (endHourNum <= startHourNum){
      alert("The end of the event must be done after the start");
      return;
    }

    const newEvent = {
      id: editingEvent?.id || Date.now(),
      title,
      description,
      date: new Date(date),
      startHour: startHourNum,
      endHour: endHourNum,
      color
    };

    const updated = editingEvent
      ? events.map(e => (e.id === newEvent.id ? newEvent : e))
      : [...events, newEvent];
    
      setEvents(updated);
      await saveEvents(updated);
      setModalVisible(false);
  };

  //Delete event
  const handleDeleteEvent = async () =>{
    if (!editingEvent) return ;
    const updated = events.filter(e => e.id !== editingEvent.id);
    setEvents(updated);
    await saveEvents(updated);
    setModalVisible(false);
    setEditingEvent(null);
  };

  //Drag & Drop handlers
  const handlePointerDown = (e, event) => {
    e.stopPropagation();
    setDraggingEvent(event.id);
    setDragStart({x: e.clientX, y: e.clientY});
  };
  const handlePointerMove = (e) => {
    if (!draggingEvent || !dragStart) return ;

    const deltaY = e.clientY - dragStart.y;
    const deltaHours = Math.round(deltaY / 41); //Number of the pixel for hour

    if (deltaHours === 0) return;

    const eventToUpdate = events.find(ev => ev.id === draggingEvent);
    if (!eventToUpdate) return ;

    const newStartHour = Math.max(
      startHour,
      Math.min(endHour - 1, eventToUpdate.startHour + deltaHours)
    );
    const duration = eventToUpdate.endHour - eventToUpdate.startHour;
    const newEndHour = Math.min(endHour, newStartHour + duration);

    const updated = events.map(ev =>
      ev.id === draggingEvent
        ? {...ev, startHour : newStartHour, endHour:newEndHour}
        : ev
    );

    setEvents(updated);
    setDragStart({x: e.clientX, y:e.clientY});
  };
  const handlePointerUp = async() => {
    if (draggingEvent) {
      await saveEvents(events);
      setDraggingEvent(null);
      setDragStart(null);
    }
  };

  //Click of the event
  const handleEventClick = (event) => {
    if (!dragStart){
      openModalForEdit(event);
    }
  };

  //If there's two events at the same time
  const getEventLayout = (dayEvents) => {
    if (dayEvents.length === 0) return [];

    const sorted = [...dayEvents].sort((a, b) => a.startHour - b.startHour);
    const groups = [];

    sorted.forEach(event =>{
      let placed = false;
      for (let group of groups){
        const lastInGroup = group[group.length - 1];
        if (event.startHour >= lastInGroup.endHour){
          group.push(event);
          placed = true;
          break;
        }
      }
      if (!placed){
        groups.push([event]);
      }
    });

    const layout = [];
    groups.forEach(group =>{
      const total = group.length;
      group.forEach((event, index) => {
        layout.push({
          ...event,
          left: (index/total) * 100,
          width: 100 / total - 3
        });
      });
    });

    return layout;
  };

  //Week Range
  const weekRange = `${weekDays[0].toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short"
  })} - ${weekDays[6].toLocaleDateString("it-IT", { day: "numeric", month: "short" })}`;
/*
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
  }; */
return (
  <div className="calendar" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
    <h2>Weekly Events</h2>

    <div className="mainCalendar">
      <div className="week-nav">
        <button onClick={goToPreviousWeek}>
          ← Settimana Precedente
        </button>
        <h3>{weekRange}</h3>
        <button onClick={goToNextWeek}>
          Settimana Successiva →
        </button>
      </div>

      <div className="calendar-grid">
        <div className="time-column">
          {Array.from({length: endHour - startHour + 1}, (_, i) =>(
            <div key={i} className="time-slot">{startHour + i}:00</div>
          ))}
        </div>
        <div className="days-grid">
          {weekDays.map((day, dayIndex) => {
            const dayEvents = events.filter(
              e => e.date.toDateString() === day.toDateString()
            );
            const layoutEvents = getEventLayout(dayEvents);
            return(
              <div key={dayIndex} className="day-column">
                <div className="day-header">
                  {day.toLocaleDateString("it-IT", {weekday: "short", day: "numeric"})}
                </div>
                {/* Hours block */}
                {Array.from({length: endHour - startHour}, (_,i) =>(
                  <div key={i} className="hour-block"></div>
                ))}
                {/*Events*/}
                {layoutEvents.map(event =>{
                <div
                  key={event.id}
                  className={`event ${draggingEvent === event.id ? "dragging" : ''}`}
                  style={{
                    top: `${(event.startHour - startHour) * 41 + 30}px`,
                    height: `${(event.endHour - event.startHour) * 41 - 6}px`,
                    left: `${event.left}`,
                    width: `${event.width}`,
                    background: event || "var(--footer-bg)",
                    zIndex : draggingEvent === event.id ? 1000 : 1
                  }}
                  onPointerDown={(e) => handlePointerDown(e, event)}
                  onClick={() => handleEventClick(event)}
                >
                  {event.title}
                </div>
              })}
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Button to add event */}
    <button
      className="add-button"
      onClick={openModalForNewEvent}>
      ＋
    </button>

    {/* Modal */}
    {modalVisible && (
      <div className="modal">
        <div className="modal-content">
          <h3>{editingEvent ? "Modifica Evento" : "Nuovo Evento"}</h3>
          <input
            type="text"
            placeholder="Titolo"
            value={formData.title}
            onChange={(e)=> setFormData({...formData, title: e.target.value})}
          />
          <textarea
            placeholder="Descrizione"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            min="2023-01-01"
            max="2030-12-31"
          />
          <input
            type="time"
            value={formData.startTime}
            onChange={(e)=> setFormData({...formData, startTime: e.target.value})}
            min="08:00"
            max="24:00"
          />
          <input
            type="time"
            value={formData.endTime}
            onChange={(e)=> setFormData({...formData, endTime: e.target.value})}
            min="08:00"
            max="24:00"
          />
          <input
            type="color"
            value={formData.value}
            onChange={(e)=> setFormData({...formData, color: e.target.value})}
          />
          <button onClick={handleSaveEvent}>
            {editingEvent ? "Aggiorna" : "Salva"}
          </button>

          {editingEvent && (
            <button
              onClick={handleDeleteEvent}
              style={{ backgroundColor: "#d9534f", color: "#fff" }}
            >
              Elimina
            </button>
          )}
          <button
            onClick={() => setModalVisible(false)}>
            Annulla
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default Calendar;