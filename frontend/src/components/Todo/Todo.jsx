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
  /**
   * Retrieves todos from localStorage for the current date.
   * If no list exists, retuns an empty array.
   */
  const initialTodos = () => {
    try {
      const key = getTodayKey();
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("[Todo] Error while reading initialTodos:", err);
      return [];
    }
  };

  const [todoItems, setTodoItems] = useState(initialTodos);
  const [inputText, setInputText] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  /**
   * When the component starts:
   * -If today's list doesn't exist, initialize it.
   * -Display a 'new day' banner.
   */
  useEffect(() => {
    try {
      const key = getTodayKey();
      const exists = localStorage.getItem(key) !== null;
      if (!exists) {
        localStorage.setItem(key, JSON.stringify([]));
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 4000);
      }
    } catch (err) {
      console.error("[Todo] error useEffect mount:", err);
    }
  }, []);
  /**
   * Automatically saves the updated list to localStorage
   * whenever the status of the todos changes.
   */
  useEffect(() => {
    try {
      const key = getTodayKey();
      localStorage.setItem(key, JSON.stringify(todoItems));
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