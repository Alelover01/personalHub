import React, { useState } from 'react';
import PostItCreator from '../PostItCreator/PostItCreator';
import './Postit.css';
import { postItTemplates } from '../PostItCreator/postItTemplates';

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

  const addNote = note => setNotes(prev => [...prev, note]);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="postit-section">
      <div className="postit-header">
        <h2 className="chaos">Chaos Post-It</h2>
        <button className="create-button" onClick={openModal}>Crea Post-it</button>
      </div>

      {modalOpen && <PostItCreator onCreate={addNote} onClose={closeModal} />}

      <div className="postit-board">
        {notes.map(note => (
          <div key={note.id} className={`postit ${note.section.toLowerCase()}`}>
            <h4>{note.title}</h4>

            {note.imageUrl && (
              <img src={note.imageUrl} alt={note.title} style={{ width: '100%', borderRadius: '6px' }} />
            )}

            <div className="postit-content">
              {getVisibleFields(note).map(field => (
                <div key={field.name} className="postit-row">
                  <span className="postit-label">{field.label}:</span>
                  <span className="postit-value">{note[field.name]}</span>
                </div>
              ))}
            </div>

            <small><em>
              {note.section === 'Travel' && '✈️ '}
              {note.section === 'Finance' && '💰 '}
              {note.section === 'Books' && '📚 '}
              {note.section === 'Series' && '📺 '}
              {note.section === 'Anime' && '🎌 '}
              {note.section === 'Manhwa' && '📖 '}
              {note.section === 'Games' && '🎮 '}
              {note.section === 'Sites' && '🌐 '}
              {note.section}
            </em></small>
          </div>
        ))}
      </div>
    </div>
  );
}