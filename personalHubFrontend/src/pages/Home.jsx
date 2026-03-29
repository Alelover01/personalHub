import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Home.module.css';

const Home = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [travels, setTravels] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).toUpperCase();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, travelsRes] = await Promise.all([
          api.get('/api/todos'),
          api.get('/api/travel'),
        ]);
        setTodos(todosRes.data);
        // Solo viaggi upcoming
        setTravels(travelsRes.data.filter(t => t.status === 'upcoming').slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const res = await api.post('/api/todos', { title: newTodo });
      setTodos([res.data, ...todos]);
      setNewTodo('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const res = await api.put(`/api/todos/${todo.id}`, {
        completed: !todo.completed,
      });
      setTodos(todos.map(t => t.id === todo.id ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeClass = (priority) => {
    if (priority === 'alta') return styles.badgeAlta;
    if (priority === 'media') return styles.badgeMedia;
    return styles.badgeBassa;
  };

  const formatTravelDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      num: date.getDate(),
    };
  };

  if (loading) return null;

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
        {/* To-Do List */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>☑️</div>
            <div>
              <div className={styles.cardTitle}>To-Do List</div>
              <div className={styles.cardSubtitle}>
                {todos.filter(t => !t.completed).length} pending tasks
              </div>
            </div>
          </div>

          <div className={styles.todoList}>
            {todos.length === 0 && (
              <p className={styles.empty}>No tasks yet</p>
            )}
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
            <button className={styles.addTodoBtn} type="submit">+</button>
          </form>
        </div>

        {/* Upcoming Travel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>✈️</div>
            <div>
              <div className={styles.cardTitle}>Upcoming Trips</div>
              <div className={styles.cardSubtitle}>Your next adventures</div>
            </div>
          </div>

          <div className={styles.travelList}>
            {travels.length === 0 && (
              <p className={styles.empty}>No upcoming trips</p>
            )}
            {travels.map(travel => {
              const { day, num } = formatTravelDate(travel.start_date);
              return (
                <div key={travel.id} className={styles.travelItem}>
                  <div className={styles.travelDate}>
                    <div className={styles.travelDateDay}>{day}</div>
                    <div className={styles.travelDateNum}>{num}</div>
                  </div>
                  <div className={styles.travelInfo}>
                    <h4>{travel.destination}</h4>
                    <p>{travel.country} · {travel.flight || 'No flight info'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;