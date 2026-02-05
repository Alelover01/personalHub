import React, { useEffect, useState } from "react";
import "./Calendar.css";

/** Calendar display starts at 8 AM */
const startHour = 8;
/** Calendar display ends at midnight (24:00) */
const endHour = 24;

/**
 * Calendar Component
 * Full-featured weekly calendar with:
 * - Drag & drop event repositioning (vertical: time change, horizontal: day change)
 * - Event creation, editing, and deletion via modal
 * - Week navigation (previous/next week)
 * - Event overlap detection and layout
 * - Color-coded events
 * - Backend synchronization with JWT authentication
 */
const Calendar = () => {
  // ===== STATE MANAGEMENT =====
  
  /** Current week being displayed */
  const [currentDate, setCurrentDate] = useState(new Date());
  
  /** Array of all events loaded from backend */
  const [events, setEvents] = useState([]);
  
  /** Controls visibility of add/edit event modal */
  const [modalVisible, setModalVisible] = useState(false);
  
  /** Event currently being edited (null for new event) */
  const [editingEvent, setEditingEvent] = useState(null);
  
  /** ID of event currently being dragged (null when not dragging) */
  const [draggingEvent, setDraggingEvent] = useState(null);
  
  /** Initial pointer position and movement flag for drag operations */
  const [dragStart, setDragStart] = useState(null);
  
  /** Real-time drag offset for smooth visual feedback */
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  /** Form data for creating/editing events */
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    color: "#3f51b5"
  });

  // ===== API CONFIGURATION =====
  
  const API_URL = "/events";
  
  /**
   * Generate authentication headers with JWT token
   * @returns {Object} Headers object with Content-Type and Authorization
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // ===== DATA PERSISTENCE =====

  /**
   * Load all events from backend
   * Fetches events for logged-in user and converts dates to Date objects
   * Converts snake_case field names (start_hour) to camelCase (startHour)
   */
  const loadEvents = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Parse dates and normalize field names
      const parsedEvents = data.map(ev => ({ 
        ...ev, 
        date: new Date(ev.date),
        startHour: ev.start_hour,
        endHour: ev.end_hour
      }));
      
      setEvents(parsedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  /**
   * Save all events to backend
   * Overwrites entire event list for current user
   * @param {Array} updatedEvents - Complete array of events to save
   */
  const saveEvents = async (updatedEvents) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedEvents)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error saving events:", error);
    }
  };

  /**
   * Effect: Load events from backend on component mount
   */
  useEffect(() => {
    loadEvents();
  }, []);

  // ===== DATE/WEEK UTILITIES =====

  /**
   * Calculate array of 7 days for the week containing given date
   * Week starts on Monday
   * @param {Date} date - Reference date to calculate week from
   * @returns {Array<Date>} Array of 7 Date objects (Mon-Sun)
   */
  const getWeekDay = (date) => {
    const start = new Date(date);
    // Set to Monday of current week (getDay() returns 0 for Sunday)
    start.setDate(start.getDate() - start.getDay() + 1);
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };
  
  /** Current week's days (Monday to Sunday) */
  const weekDays = getWeekDay(currentDate);

  /**
   * Navigate to previous week
   * Updates currentDate to 7 days earlier
   */
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  /**
   * Navigate to next week
   * Updates currentDate to 7 days later
   */
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // ===== MODAL MANAGEMENT =====

  /**
   * Open modal for creating a new event
   * Resets form to default values
   */
  const openModalForNewEvent = () => {
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

  /**
   * Open modal for editing an existing event
   * Pre-fills form with event data
   * @param {Object} event - Event object to edit
   */
  const openModalForEdit = (event) => {
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

  // ===== EVENT CRUD OPERATIONS =====

  /**
   * Save event (create new or update existing)
   * Validates form data before saving
   * Updates local state and syncs to backend
   */
  const handleSaveEvent = async () => {
    const { title, description, date, startTime, endTime, color } = formData;

    // Validation
    if (!title.trim() || !date || !startTime || !endTime) {
      alert("Please fill in all required fields");
      return;
    }

    const startHourNum = parseInt(startTime.split(":")[0]);
    const endHourNum = parseInt(endTime.split(":")[0]);

    if (endHourNum <= startHourNum) {
      alert("End time must be after start time");
      return;
    }

    // Create event object
    const newEvent = {
      id: editingEvent?.id || Date.now(),
      title,
      description,
      date: new Date(date),
      startHour: startHourNum,
      endHour: endHourNum,
      color
    };

    // Update or add to events array
    const updated = editingEvent
      ? events.map(e => (e.id === newEvent.id ? newEvent : e))
      : [...events, newEvent];
    
    setEvents(updated);
    await saveEvents(updated);
    setModalVisible(false);
  };

  /**
   * Delete the currently edited event
   * Removes from local state and syncs to backend
   */
  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    
    const updated = events.filter(e => e.id !== editingEvent.id);
    setEvents(updated);
    await saveEvents(updated);
    setModalVisible(false);
    setEditingEvent(null);
  };

  // ===== DRAG & DROP HANDLERS =====

  /**
   * Start dragging an event
   * Records initial pointer position and event ID
   * @param {PointerEvent} e - Pointer down event
   * @param {Object} event - Event being dragged
   */
  const handlePointerDown = (e, event) => {
    e.stopPropagation();
    setDraggingEvent(event.id);
    setDragStart({ x: e.clientX, y: e.clientY, hasMoved: false });
    setDragOffset({ x: 0, y: 0 });
  };
  
  /**
   * Handle pointer movement during drag
   * Updates visual offset in real-time for smooth feedback
   * Marks drag as "moved" if pointer moves beyond threshold (5px)
   * @param {PointerEvent} e - Pointer move event
   */
  const handlePointerMove = (e) => {
    if (!draggingEvent || !dragStart) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Mark as moved if beyond threshold (distinguishes click from drag)
    if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
      setDragStart(prev => ({ ...prev, hasMoved: true }));
    }
    
    // Update visual offset for smooth drag feedback
    setDragOffset({ x: deltaX, y: deltaY });
  };
  
  /**
   * Handle pointer release (end of drag)
   * Calculates final position and updates event:
   * - Vertical movement: Changes event time (1 hour per 41px)
   * - Horizontal movement: Changes event day (1 day per column width)
   * Only updates if new position is within current week
   * @param {PointerEvent} e - Pointer up event
   */
  const handlePointerUp = async () => {
    if (!draggingEvent || !dragStart) return;

    const eventToUpdate = events.find(ev => ev.id === draggingEvent);
    if (!eventToUpdate) {
      // Reset drag state if event not found
      setDraggingEvent(null);
      setDragStart(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    const deltaY = dragOffset.y;
    const deltaX = dragOffset.x;

    // Calculate new time based on vertical movement
    // 41px = 1 hour slot height
    const deltaHours = Math.round(deltaY / 41);
    const newStartHour = Math.max(
      startHour,
      Math.min(endHour - 1, eventToUpdate.startHour + deltaHours)
    );
    const duration = eventToUpdate.endHour - eventToUpdate.startHour;
    const newEndHour = Math.min(endHour, newStartHour + duration);

    // Calculate new day based on horizontal movement
    const daysGridElement = document.querySelector('.days-grid');
    if (!daysGridElement) {
      setDraggingEvent(null);
      setDragStart(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    
    const dayColumnWidth = daysGridElement.offsetWidth / 7;
    const deltaDays = Math.round(deltaX / dayColumnWidth);
    
    const newDate = new Date(eventToUpdate.date);
    newDate.setDate(newDate.getDate() + deltaDays);
    
    // Only update date if new date is within current week
    const isInWeek = weekDays.some(day => day.toDateString() === newDate.toDateString());
    
    // Update event with new position
    const updated = events.map(ev =>
      ev.id === draggingEvent
        ? {
            ...ev,
            startHour: newStartHour,
            endHour: newEndHour,
            date: isInWeek ? newDate : ev.date
          }
        : ev
    );

    setEvents(updated);
    await saveEvents(updated);
    
    // Reset drag state
    setDraggingEvent(null);
    setDragStart(null);
    setDragOffset({ x: 0, y: 0 });
  };

  /**
   * Handle click on event
   * Opens edit modal only if event wasn't dragged
   * @param {Object} event - Event that was clicked
   */
  const handleEventClick = (event) => {
    if (!dragStart || !dragStart.hasMoved) {
      openModalForEdit(event);
    }
  };

  // ===== EVENT LAYOUT CALCULATION =====

  /**
   * Calculate layout positions for overlapping events
   * Groups events that overlap in time, then distributes them horizontally
   * @param {Array} dayEvents - Events for a specific day
   * @returns {Array} Events with added 'left' and 'width' properties for positioning
   */
  const getEventLayout = (dayEvents) => {
    if (dayEvents.length === 0) return [];

    // Sort events by start time
    const sorted = [...dayEvents].sort((a, b) => a.startHour - b.startHour);
    const groups = [];

    // Group overlapping events
    sorted.forEach(event => {
      let placed = false;
      for (let group of groups) {
        const lastInGroup = group[group.length - 1];
        // If event starts after last event in group ends, add to this group
        if (event.startHour >= lastInGroup.endHour) {
          group.push(event);
          placed = true;
          break;
        }
      }
      // If no suitable group found, create new group
      if (!placed) {
        groups.push([event]);
      }
    });

    // Calculate horizontal positions for each event in groups
    const layout = [];
    groups.forEach(group => {
      const total = group.length;
      group.forEach((event, index) => {
        layout.push({
          ...event,
          left: (index / total) * 100,        // Left position as percentage
          width: 100 / total - 3              // Width as percentage (minus gap)
        });
      });
    });

    return layout;
  };

  // ===== RENDERING =====

  /** Format week range for display (e.g., "1 gen - 7 gen") */
  const weekRange = `${weekDays[0].toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short"
  })} - ${weekDays[6].toLocaleDateString("it-IT", { 
    day: "numeric", 
    month: "short" 
  })}`;

  return (
    <div 
      className="calendar" 
      onPointerMove={handlePointerMove} 
      onPointerUp={handlePointerUp}
    >
      <h2>Weekly Events</h2>

      <div className="mainCalendar">
        {/* Week navigation controls */}
        <div className="week-nav">
          <button onClick={goToPreviousWeek}>
            ← Previous Week
          </button>
          <h3>{weekRange}</h3>
          <button onClick={goToNextWeek}>
            Next Week →
          </button>
        </div>

        <div className="calendar-grid">
          {/* Time column (8:00 - 24:00) */}
          <div className="time-column">
            {Array.from({ length: endHour - startHour + 1 }, (_, i) => (
              <div key={i} className="time-slot">
                {startHour + i}:00
              </div>
            ))}
          </div>

          {/* Days grid (Monday - Sunday) */}
          <div className="days-grid">
            {weekDays.map((day, dayIndex) => {
              // Get events for this specific day
              const dayEvents = events.filter(
                e => e.date.toDateString() === day.toDateString()
              );
              
              // Calculate layout with overlap handling
              const layoutEvents = getEventLayout(dayEvents);

              return (
                <div key={dayIndex} className="day-column">
                  {/* Day header (e.g., "Mon 5") */}
                  <div className="day-header">
                    {day.toLocaleDateString("it-IT", { 
                      weekday: "short", 
                      day: "numeric" 
                    })}
                  </div>

                  {/* Hour blocks for visual grid */}
                  {Array.from({ length: endHour - startHour }, (_, i) => (
                    <div key={i} className="hour-block"></div>
                  ))}

                  {/* Event blocks */}
                  {layoutEvents.map(event => (
                    <div
                      key={event.id}
                      className={`event ${draggingEvent === event.id ? "dragging" : ''}`}
                      style={{
                        // Vertical position based on start hour
                        top: `${(event.startHour - startHour) * 41 + 30}px`,
                        // Height based on duration
                        height: `${(event.endHour - event.startHour) * 41 - 6}px`,
                        // Horizontal position for overlap handling
                        left: `${event.left}%`,
                        width: `${event.width}%`,
                        background: event.color || "var(--footer-bg)",
                        zIndex: draggingEvent === event.id ? 1000 : 1,
                        // Real-time transform for smooth drag
                        transform: draggingEvent === event.id 
                          ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` 
                          : 'none',
                        // Disable transition during drag for immediate feedback
                        transition: draggingEvent === event.id 
                          ? 'none' 
                          : 'transform 0.2s ease'
                      }}
                      onPointerDown={(e) => handlePointerDown(e, event)}
                      onClick={() => handleEventClick(event)}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating add button */}
      <button
        className="add-button"
        onClick={openModalForNewEvent}
        aria-label="Add new event"
      >
        ＋
      </button>

      {/* Add/Edit event modal */}
      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingEvent ? "Edit Event" : "New Event"}</h3>
            
            {/* Event title */}
            <input
              type="text"
              placeholder="Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            
            {/* Event description */}
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            
            {/* Event date */}
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min="2023-01-01"
              max="2030-12-31"
              required
            />
            
            {/* Start time */}
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              min="08:00"
              max="24:00"
              required
            />
            
            {/* End time */}
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              min="08:00"
              max="24:00"
              required
            />
            
            {/* Event color */}
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
            
            {/* Save button */}
            <button onClick={handleSaveEvent}>
              {editingEvent ? "Update" : "Save"}
            </button>

            {/* Delete button (only when editing) */}
            {editingEvent && (
              <button
                onClick={handleDeleteEvent}
                style={{ backgroundColor: "#d9534f", color: "#fff" }}
              >
                Delete
              </button>
            )}
            
            {/* Cancel button */}
            <button onClick={() => setModalVisible(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;