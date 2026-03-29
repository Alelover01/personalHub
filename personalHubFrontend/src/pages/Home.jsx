import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Home.module.css';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getWeekDates = (offset = 0) => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(diff + i);
    return d;
  });
};

const Home = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [events, setEvents] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState('media');
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState(getWeekDates(0));
  const [modal, setModal] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', color: '#7c3aed' });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDate = () => new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).toUpperCase();

  const padDate = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  useEffect(() => {
    setWeekDates(getWeekDates(weekOffset));
  }, [weekOffset]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, eventsRes] = await Promise.all([
          api.get('/api/todos'),
          api.get('/api/events'),
        ]);
        setTodos(todosRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const res = await api.post('/api/todos', { title: newTodo, priority: newTodoPriority });
      setTodos([res.data, ...todos]);
      setNewTodo('');
      setNewTodoPriority('media');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const res = await api.put(`/api/todos/${todo.id}`, { completed: !todo.completed });
      setTodos(todos.map(t => t.id === todo.id ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await api.delete(`/api/todos/${id}`);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCellClick = (date, hour) => {
    const pad = (n) => String(n).padStart(2, '0');
    setEventForm({ title: '', date: padDate(date), time: `${pad(hour)}:00`, color: '#7c3aed' });
    setModal({ mode: 'add' });
  };

  const handleEventClick = (ev, e) => {
    e.stopPropagation();
    setEventForm({
      title: ev.title,
      date: ev.date?.split('T')[0],
      time: ev.time || '',
      color: ev.color || '#7c3aed',
    });
    setModal({ mode: 'edit', event: ev });
  };

  const handleAddEvent = async () => {
    if (!eventForm.title.trim()) return;
    try {
      const res = await api.post('/api/events', eventForm);
      setEvents([...events, res.data]);
      setModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEvent = async () => {
    if (!eventForm.title.trim()) return;
    try {
      const res = await api.put(`/api/events/${modal.event.id}`, eventForm);
      setEvents(events.map(ev => ev.id === modal.event.id ? res.data : ev));
      setModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await api.delete(`/api/events/${modal.event.id}`);
      setEvents(events.filter(ev => ev.id !== modal.event.id));
      setModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getEventsForCell = (date, hour) => {
    const dateStr = padDate(date);
    return events.filter(ev => {
      const evDate = ev.date?.split('T')[0];
      const evHour = ev.time ? parseInt(ev.time.split(':')[0]) : null;
      return evDate === dateStr && evHour === hour;
    });
  };

  const getBadgeClass = (p) => {
    if (p === 'alta') return styles.badgeAlta;
    if (p === 'media') return styles.badgeMedia;
    return styles.badgeBassa;
  };

  const weekLabel = `${weekDates[0].getDate()} ${weekDates[0].toLocaleDateString('en-US', { month: 'short' })} - ${weekDates[6].getDate()} ${weekDates[6].toLocaleDateString('en-US', { month: 'short' })}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatarCircle}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className={styles.headerText}>
          <h1>{getGreeting()}, {user?.name}!</h1>
          <p>{getDate()}</p>
          <p className={styles.quote}>"Organizing my digital life."</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* CALENDAR */}
        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <span className={styles.calendarTitle}>Weekly Events</span>
            <div className={styles.calendarNav}>
              <button className={styles.calendarNavBtn} onClick={() => setWeekOffset(w => w - 1)}>← Prev</button>
              <span className={styles.calendarRange}>{weekLabel}</span>
              <button className={styles.calendarNavBtn} onClick={() => setWeekOffset(w => w + 1)}>Next →</button>
            </div>
            <button
              className={styles.addEventBtn}
              onClick={() => {
                setEventForm({ title: '', date: padDate(new Date()), time: '09:00', color: '#7c3aed' });
                setModal({ mode: 'add' });
              }}
            >
              + Add Event
            </button>
          </div>

          <div className={styles.calendarBody}>
            <div className={styles.calendarGrid}>
              <div className={styles.calendarDayHeader} />
              {weekDates.map((date, i) => (
                <div key={i} className={styles.calendarDayHeader}>
                  {DAYS[i]} {date.getDate()}
                </div>
              ))}
              {HOURS.map(hour => (
                <>
                  <div key={`t-${hour}`} className={styles.calendarTimeLabel}>{hour}:00</div>
                  {weekDates.map((date, di) => {
                    const cellEvents = getEventsForCell(date, hour);
                    return (
                      <div
                        key={`c-${hour}-${di}`}
                        className={styles.calendarCell}
                        onClick={() => handleCellClick(date, hour)}
                      >
                        {cellEvents.map(ev => (
                          <div
                            key={ev.id}
                            className={styles.calendarEvent}
                            style={{ background: ev.color }}
                            onClick={(e) => handleEventClick(ev, e)}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* TODO */}
        <div className={styles.todoCard}>
          <div className={styles.todoHeader}>
            <div className={styles.todoIcon}>☑️</div>
            <div>
              <div className={styles.todoTitle}>To-Do List</div>
              <div className={styles.todoSubtitle}>
                {todos.filter(t => !t.completed).length} pending tasks
              </div>
            </div>
          </div>

          <div className={styles.todoList}>
            {todos.length === 0 && <p className={styles.empty}>No tasks yet</p>}
            {todos.map(todo => (
              <div key={todo.id} className={styles.todoItem}>
                <input
                  type="checkbox"
                  className={styles.todoCheckbox}
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo)}
                />
                <span className={`${styles.todoText} ${todo.completed ? styles.todoTextDone : ''}`}>
                  {todo.title}
                </span>
                <span className={`${styles.todoBadge} ${getBadgeClass(todo.priority)}`}>
                  {todo.priority}
                </span>
                <button
                  className={styles.todoDeleteBtn}
                  onClick={() => handleDeleteTodo(todo.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <form className={styles.addTodoForm} onSubmit={handleAddTodo}>
            <input
              className={styles.addTodoInput}
              placeholder="Add new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <select
              className={styles.prioritySelect}
              value={newTodoPriority}
              onChange={(e) => setNewTodoPriority(e.target.value)}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="bassa">Bassa</option>
            </select>
            <button className={styles.addTodoBtn} type="submit">+</button>
          </form>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {modal.mode === 'add' ? 'Add Event' : 'Edit Event'}
            </h2>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Title</label>
              <input
                className={styles.modalInput}
                placeholder="Event title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                autoFocus
              />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Date</label>
              <input
                className={styles.modalInput}
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Time</label>
              <input
                className={styles.modalInput}
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
              />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Color</label>
              <input
                className={styles.modalInput}
                type="color"
                value={eventForm.color}
                onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })}
                style={{ height: '42px', cursor: 'pointer' }}
              />
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.modalCancel} onClick={() => setModal(null)}>Cancel</button>
              {modal.mode === 'edit' && (
                <button className={styles.modalDelete} onClick={handleDeleteEvent}>Delete</button>
              )}
              <button
                className={styles.modalConfirm}
                onClick={modal.mode === 'add' ? handleAddEvent : handleUpdateEvent}
              >
                {modal.mode === 'add' ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;