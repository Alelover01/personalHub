import React, { useState, useEffect } from 'react';
import { postItTemplates } from './postItTemplates';
import './PostItCreator.css';

export default function PostItCreator({ onCreate, onClose, noteToEdit }) {
  const [formData, setFormData] = useState({
    id: Date.now(),
    section: 'Travel',
    title: '',
    imageUrl: '',
    description: '',
    link: '', // nuovo campo
  });

  useEffect(() => {
    if (noteToEdit) {
      setFormData({ ...noteToEdit });
    }
  }, [noteToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!noteToEdit) {
      formData.id = Date.now();
    }

    // Normalizza il link se manca http/https
    if (formData.link && !formData.link.startsWith('http')) {
      formData.link = 'https://' + formData.link;
    }

    onCreate(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{noteToEdit ? 'Modifica Post-It' : 'Crea Post-It'}</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Sezione:
            <select name="section" value={formData.section} onChange={handleChange}>
              {Object.keys(postItTemplates).map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </label>

          <label>
            Titolo:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Immagine URL:
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </label>

          <label>
            Descrizione:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </label>

          <label>
            Link esterno (opzionale):
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
            />
          </label>

          <div className="modal-actions">
            <button type="submit">{noteToEdit ? 'Aggiorna' : 'Crea'}</button>
            <button type="button" onClick={onClose}>Annulla</button>
          </div>
        </form>
      </div>
    </div>
  );
}