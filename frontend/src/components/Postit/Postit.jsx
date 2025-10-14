import React, { useState } from 'react';
import PostItCreator from '../PostItCreator/PostItCreator';
import './PostitBoard.css';

export default function PostItBoard() {
  const [notes, setNotes] = useState([]);

  const addNote = note => setNotes(prev => [...prev, note]);

  return (
    <div>
      <PostItCreator onCreate={addNote} />
      <div className="postit-board">
        {notes.map(note => (
          <div key={note.id} className="postit">
            <h4>{note.title}</h4>
            {note.imageUrl && (
              <img src={note.imageUrl} alt="travel" style={{ width: '100%', borderRadius: '6px' }} />
            )}
            {Object.entries(note).map(([key, value]) =>
              ['id', 'title', 'imageUrl', 'section'].includes(key) ? null : (
                <p key={key}><strong>{key}:</strong> {value}</p>
              )
            )}
            <small><em>{note.section}</em></small>
          </div>
        ))}
      </div>
    </div>
  );
}