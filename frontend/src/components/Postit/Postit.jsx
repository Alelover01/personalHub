import React, { useEffect, useState } from 'react';
import PostItCreator from '../PostItCreator/PostItCreator';
import { postItTemplates } from '../PostItCreator/postItTemplates';
import './Postit.css';

const API_URL = '/postits';

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
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Carica i post-it dal server
  const loadNotes = async () => {
    try {
      console.log('🔄 Fetching post-it...');
      const response = await fetch(API_URL);
      if (!response.ok) {
        console.error(`❌ Errore HTTP: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }
      const data = await response.json();
      console.log('✅ Tipo di data:', typeof data);
      console.log('✅ È array?', Array.isArray(data));
      console.log('✅ Contenuto:', data);
      console.log('✅ Post-it ricevuti:', data);
      if (!Array.isArray(data)) {
        console.warn('⚠️ I dati ricevuti non sono un array, uso fallback statico');
        setNotes([
          { id: 1, section: 'Travel', title: 'Fallback Test 1' },
          { id: 2, section: 'Finance', title: 'Fallback Test 2' }
        ]);
      } else {
        setNotes(data);
      }
    } catch (error) {
      console.error('❌ Errore fetch /postits:', error);
      // fallback
      setNotes([
        { id: 1, section: 'Travel', title: 'Fallback Test 1' },
        { id: 2, section: 'Finance', title: 'Fallback Test 2' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async (updatedNotes) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNotes),
      });
      if (!response.ok) {
        console.error(`❌ Errore HTTP: ${response.status} ${response.statusText}`);
        return;
      }
      console.log('✅ Salvataggio completato');
    } catch (error) {
      console.error('❌ Errore nel salvataggio dei post-it:', error);
    }
  };

  const addNote = async (note) => {
    const updated = [...notes, note];
    setNotes(updated);
    await saveNotes(updated);
  };

  const updateNote = async (updatedNote) => {
    const updatedNotes = notes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
  };

  const deleteNote = async (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
  };

  const editNote = (note) => {
    console.log('✏️ Editing note:', note);
    setNoteToEdit(note);
    setModalOpen(true);
  };

  useEffect(() => {
    loadNotes();
  }, []);
  useEffect(() => {
  console.log('📌 Stato aggiornato: notes =', notes);
}, [notes]);


  console.log('Rendering notes array:', notes);

  return (
    <div className="postit-section">
      <div className="postit-header">
        <h2 className="chaos">Chaos Post-It</h2>
        <button
          className="create-button"
          onClick={() => { setNoteToEdit(null); setModalOpen(true); }}
        >
          Crea Post-it
        </button>
      </div>

      {modalOpen && (
        <PostItCreator
          noteToEdit={noteToEdit}
          onCreate={noteToEdit ? updateNote : addNote}
          onClose={() => setModalOpen(false)}
        />
      )}

      <div className="postit-board">
        {loading ? (
          <p>⏳ Caricamento in corso...</p>
        ) : notes.length === 0 ? (
          <p>📭 Nessun post-it disponibile</p>
        ) : (
          notes.map((note) => {
            console.log('🧪 loading:', loading);
            console.log('🧪 notes:', notes);
            console.log('Rendering note:', note);
            return (
              <div key={note.id} className={`postit ${note.section?.toLowerCase() || ''}`}>
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

                {/* 🔹 Pulsanti Modifica e Elimina sempre visibili */}
                <div className="postit-actions">
                  <button className="edit-button" onClick={() => editNote(note)}>✏️ Modifica</button>
                  <button className="delete-button" onClick={() => deleteNote(note.id)}>🗑️ Elimina</button>
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
            );
          })
        )}
      </div>
    </div>
  );
}
