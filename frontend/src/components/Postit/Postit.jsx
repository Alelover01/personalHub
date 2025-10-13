import React, { useState } from 'react';
import './Postit.css';

const initialNotes = [
  { id: 1, text: 'Studiare React', section: 'Inbox' },
  { id: 2, text: 'Comprare il pane', section: 'Shopping' },
];

const sections = ['Inbox', 'Shopping', 'Lavoro', 'Personale'];

export default function PostItBoard() {
  const [notes, setNotes] = useState(initialNotes);

  const moveNote = (id, newSection) => {
    setNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, section: newSection } : note))
    );
  };

  return (
    <div className="postit-board">
      {sections.map(section => (
        <div key={section} className="section">
          <h3>{section}</h3>
          {notes
            .filter(note => note.section === section)
            .map(note => (
              <div key={note.id} className="postit">
                <p>{note.text}</p>
                <select
                  value={note.section}
                  onChange={e => moveNote(note.id, e.target.value)}
                >
                  {sections.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}