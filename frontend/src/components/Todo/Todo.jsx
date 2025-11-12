import React, { useState, useEffect } from "react";
import "./Todo.css";

/**
 * Generate the key of localStorage for the date today.
 * @returns {string} The Key in format 'todos-YYYY-MM-DD'.
 */
const getTodayKey = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `todos-${yyyy}-${mm}-${dd}`;
};

const Todo = () => {
  const [todoItems, setTodoItems] = useState([]);   // inizializza vuoto
  const [inputText, setInputText] = useState("");
  const [showBanner, setShowBanner] = useState(false);

  /**
   * Carica i todos dal localStorage SOLO nel browser
   */
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const key = getTodayKey();
        const raw = localStorage.getItem(key);
        const initial = raw ? JSON.parse(raw) : [];
        setTodoItems(initial);

        // Se non esiste ancora la lista di oggi, inizializzala
        if (!raw) {
          localStorage.setItem(key, JSON.stringify([]));
          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 4000);
        }
      }
    } catch (err) {
      console.error("[Todo] error useEffect mount:", err);
    }
  }, []);

  /**
   * Salva i todos aggiornati nel localStorage
   */
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const key = getTodayKey();
        localStorage.setItem(key, JSON.stringify(todoItems));
      }
    } catch (err) {
      console.error("[Todo] Error of the save:", err);
    }
  }, [todoItems]);

  /** Adds un new todo on the list. */
  const addTodo = () => {
    const text = inputText.trim();
    if (!text) return;
    setTodoItems((prev) => [...prev, { text, done: false }]);
    setInputText("");
  };

  /** Alternate the state of 'complete' of a todo */
  const toggleDone = (index) => {
    setTodoItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], done: !copy[index].done };
      return copy;
    });
  };

  //** Deletes a todo based on its index */
  const removeTodo = (index) => {
    setTodoItems((prev) => prev.filter((_, i) => i !== index));
  };

  //** Handles addition via enter key */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") addTodo();
  };

  // --- UI ---
  return (
    <div className="agenda">
      <h2>Today's TO-DO</h2>

      {showBanner && (
        <div className="new-day-banner">🌞 New day, new list!</div>
      )}

      <div className="todo-controls">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add a thing to do"
        />
        <button onClick={addTodo}>+</button>
      </div>

      <ul id="todo-list">
        {todoItems.length === 0 ? (
          <p className="empty">No elements for today ✨</p>
        ) : (
          todoItems.map((item, index) => (
            <li key={index} className={item.done ? "done" : ""}>
              <span onClick={() => toggleDone(index)}>{item.text}</span>
              <button
                className="remove-btn"
                onClick={() => removeTodo(index)}
                title="Remove"
              >
                🗑️
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Todo;