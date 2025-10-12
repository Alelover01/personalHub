import React, { useState, useEffect } from "react";
import "./Todo.css";

const getTodayKey = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `todos-${yyyy}-${mm}-${dd}`;
};

// ---- Componente ----
const Todo = () => {
  // Inizializzo sincronamente dallo storage per evitare flash di "vuoto"
  const initialTodos = () => {
    try {
      const key = getTodayKey();
      const raw = localStorage.getItem(key);
      console.log("[Todo] initial read key:", key, raw);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("[Todo] errore lettura initialTodos:", err);
      return [];
    }
  };

  const [todoItems, setTodoItems] = useState(initialTodos);
  const [inputText, setInputText] = useState("");
  const [showBanner, setShowBanner] = useState(false);

  // Al montaggio: se non esiste la chiave per oggi -> mostra banner
  useEffect(() => {
    try {
      const key = getTodayKey();
      const exists = localStorage.getItem(key) !== null;
      console.log("[Todo] mount: storage key exists?", exists, "key:", key);
      if (!exists) {
        // Non esiste ancora: crea un array vuoto e mostra banner
        localStorage.setItem(key, JSON.stringify([]));
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 4000);
      }
    } catch (err) {
      console.error("[Todo] errore useEffect mount:", err);
      // Se localStorage è bloccato (es. private mode), fallback silenzioso
    }
  }, []);

  // Salvataggio: salva ogni volta che cambia la lista
  useEffect(() => {
    try {
      const key = getTodayKey();
      localStorage.setItem(key, JSON.stringify(todoItems));
      console.log("[Todo] saved", todoItems.length, "items to", key);
    } catch (err) {
      console.error("[Todo] errore salvataggio:", err);
    }
  }, [todoItems]);

  const addTodo = () => {
    const text = inputText.trim();
    if (!text) return;
    setTodoItems((prev) => [...prev, { text, done: false }]);
    setInputText("");
  };

  const toggleDone = (index) => {
    setTodoItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], done: !copy[index].done };
      return copy;
    });
  };

  const removeTodo = (index) => {
    setTodoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") addTodo();
  };

  // --- UI ---
  return (
    <div className="agenda">
      <h2>Today's TO-DO</h2>

      {showBanner && (
        <div className="new-day-banner">🌞 Nuova giornata, nuova lista!</div>
      )}

      <div className="todo-controls">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Aggiungi una cosa da fare"
        />
        <button onClick={addTodo}>+</button>
      </div>

      <ul id="todo-list">
        {todoItems.length === 0 ? (
          <p className="empty">Nessun elemento per oggi ✨</p>
        ) : (
          todoItems.map((item, index) => (
            <li key={index} className={item.done ? "done" : ""}>
              <span onClick={() => toggleDone(index)}>{item.text}</span>
              <button
                className="remove-btn"
                onClick={() => removeTodo(index)}
                title="Rimuovi"
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