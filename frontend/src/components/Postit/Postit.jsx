import React, { useEffect, useState } from 'react';
import PostItCreator from '../PostItCreator/PostItCreator';
import { postItTemplates } from '../PostItCreator/postItTemplates';
import './Postit.css';

const API_URL = '/postits'; // comunica con il backend Express

function getVisibleFields(note) {
  const template = postItTemplates[note.section];
  if (!template) return [];
  return template.fields.filter(field => {
    if (!field.conditionalOn) return true;
    const triggerValue = note[field.conditionalOn.field];
    const expected = field.conditionalOn.value;
    return Array.isArray(expected)
      ? expected.includes(triggerValue)
      : triggerValue === expected;
  });
}

export default function PostItBoard() {
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 Carica i post-it dal backend
  const loadNotes = async () => {
    console.log("🔄 Chiamata a /postits in corso...");
    try {
      const response = await fetch(API_URL);
      console.log("📥 Risposta ricevuta:", response);

      if (!response.ok) {
        console.error(`❌ Errore HTTP: ${response.status} ${response.statusText}`);
        throw new Error(`Errore ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📄 Dati ricevuti dal backend:", data);
      setNotes(data);
    } catch (error) {
      console.error('❌ Errore nel caricamento dei post-it:', error);
    }
  };

  // 🔹 Salva i post-it tramite backend
  const saveNotes = async (updatedNotes) => {
    console.log("💾 Salvataggio post-it in corso...");
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNotes),
      });

      console.log("📤 Risposta salvataggio:", response);

      if (!response.ok) {
        console.error(`❌ Errore HTTP: ${response.status} ${response.statusText}`);
        throw new Error(`Errore ${response.status}: ${response.statusText}`);
      }

      console.log("✅ Salvataggio completato");
    } catch (error) {
      console.error('❌ Errore nel salvataggio dei post-it:', error);
    }
  };

  const addNote = async (note) => {
    const updated = [...notes, note];
    setNotes(updated);
    await saveNotes(updated);
  };

  useEffect(() => {
    const testFetch = async () => {
    try {
      const response = await fetch('/postits');
      const data = await response.json();
      console.log("✅ Dati ricevuti da /postits:", data);
      alert(`Post-it ricevuti: ${data.length}`);
    } catch (err) {
      console.error("❌ Errore nella fetch:", err);
      alert("Errore nel caricamento dei post-it");
    }
  };
  testFetch();
    loadNotes();
  }, []);

  return (
    <div className="postit-section">
      <div className="postit-header">
        <h2 className="chaos">Chaos Post-It</h2>
        <button className="create-button" onClick={() => setModalOpen(true)}>
          Crea Post-it
        </button>
      </div>

      {modalOpen && (
        <PostItCreator
          onCreate={addNote}
          onClose={() => setModalOpen(false)}
        />
      )}

      <div className="postit-board">
        {notes.length === 0 ? (
          <p>📭 Nessun post-it disponibile</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`postit ${note.section.toLowerCase()}`}
            >
              <h4>{note.title}</h4>
              {note.imageUrl && (
                <img
                  src={note.imageUrl}
                  alt={note.title}
                  style={{ width: '100%', borderRadius: '6px' }}
                />
              )}
              <div className="postit-content">
                {getVisibleFields(note).map((field) => (
                  <div key={field.name} className="postit-row">
                    <span className="postit-label">{field.label}:</span>
                    <span className="postit-value">{note[field.name]}</span>
                  </div>
                ))}
              </div>
              <small>
                <em>
                  {note.section === 'Travel' && '✈️ '}
                  {note.section === 'Finance' && '💰 '}
                  {note.section === 'Books' && '📚 '}
                  {note.section === 'Series' && '📺 '}
                  {note.section === 'Anime' && '🎌 '}
                  {note.section === 'Manhwa' && '📖 '}
                  {note.section === 'Games' && '🎮 '}
                  {note.section === 'Sites' && '🌐 '}
                  {note.section}
                </em>
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}