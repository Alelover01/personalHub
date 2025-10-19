import React, { useEffect, useState } from 'react';
import PostItCreator from '../PostItCreator/PostItCreator';
import { postItTemplates } from '../PostItCreator/postItTemplates';
import './Postit.css';

const API_URL = '/postits';
/**
* Determines which fields on a post-it should be visible
* based on the template and specified conditions.
* 
* @param {Object} note - The post-it to parse
* @returns {Array} List of visible fields
*/
function getVisibleFields(note) {
  const template = postItTemplates[note.section];
  if (!template || !template.fields) return [];
  return template.fields.filter(field => {
    if (!field.conditionalOn) return true;
    const triggerValue = note[field.conditionalOn.field];
    const expected = field.conditionalOn.value;
    return Array.isArray(expected)
      ? expected.includes(triggerValue)
      : triggerValue === expected;
  });
}
/**
* Main Post-it Board: manages the viewing,
* creation, editing, and deletion of notes.
*/
export default function PostItBoard() {
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  /**
   * Upload post-it notes from the server.
   */
  const loadNotes = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`);
        return;
      }
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetch /postits:', error);
    } finally {
      setLoading(false);
    }
  };
  /**
* Saves updated post-it notes to the server.
* @param {Array} updatedNotes - Complete updated list of post-it notes
*/
  const saveNotes = async (updatedNotes) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNotes),
      });
      if (!response.ok) {
        console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`);
        return;
      }
    } catch (error) {
      console.error('❌ Errore saving of post-it:', error);
    }
  };
/**
 * Add the new post-it and updates the server
 * @param {Object} note - The new post-it to add
 */
  const addNote = async (note) => {
    const updated = [...notes, note];
    setNotes(updated);
    await saveNotes(updated);
  };
/**
 * Updates an existing post-it and the server
 * @param {Object} updatedNote - The modified post-it
 */
  const updateNote = async (updatedNote) => {
    const updatedNotes = notes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
  };
/**
* Deletes a post-it from the board and refreshes the server.
* @param {string} id - ID of the post-it to delete
*/
  const deleteNote = async (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
  };
/**
* Opens the edit modal for a selected post-it.
* @param {Object} note - Post-it to edit
*/
  const editNote = (note) => {
    setNoteToEdit(note);
    setModalOpen(true);
  };
/** Upload of the post-its at the upload of the component */
  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
  }, [notes]);

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
          <p>⏳ Uploading...</p>
        ) : notes.length === 0 ? (
          <p>📭 No post-it available </p>
        ) : (
          notes
            .filter(note => note && note.id && note.section)
            .map((note) => {
              return (
                <div key={note.id} className={`postit ${note.section.toLowerCase()}`}>
                  <h4>{note.title}</h4>
                  {note.imageUrl && (
                    <a
                      href={note.link || note.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={note.imageUrl}
                        alt={note.title}
                        style={{ width: '100%', borderRadius: '6px', marginBottom: '8px' }}
                      />
                    </a>
                  )}
                  <div className="postit-content">
                    {getVisibleFields(note)
                    //So the imageUrl is not visible in the post-it
                    .filter(field => field.name !== 'imageUrl')
                    .map((field) => (
                      <div key={field.name} className="postit-row">
                        <span className="postit-label">{field.label}:</span>
                        <span className="postit-value">{note[field.name]}</span>
                      </div>
                    ))}
                  </div>

                  <div className="postit-actions">
                    <button className='edit-button' onClick={() => editNote(note)}>✏️ Edit</button>
                    <button className='delete-button' onClick={() => deleteNote(note.id)}>🗑️ Delete</button>
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