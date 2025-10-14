import React, { useState } from 'react';
import { postItTemplates } from './postItTemplates';
import './PostItCreator.css';

export default function PostItCreator({ onCreate, onClose }) {
  const [section, setSection] = useState('');
  const [formData, setFormData] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!section) return;
    onCreate({ ...formData, section, id: Date.now() });
    onClose();
  };

  const fields = section ? postItTemplates[section]?.fields || [] : [];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Crea un nuovo Post-It</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Sezione:
            <select value={section} onChange={e => setSection(e.target.value)}>
              <option value="">-- Seleziona --</option>
              {Object.keys(postItTemplates).map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </label>

          {fields.map(field => (
            <label key={field.name}>
              {field.label}:
              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                >
                  <option value="">-- Seleziona --</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                />
              )}
            </label>
          ))}

          <div className="modal-actions">
            <button type="submit">Crea</button>
            <button type="button" onClick={onClose}>Chiudi</button>
          </div>
        </form>
      </div>
    </div>
  );
}