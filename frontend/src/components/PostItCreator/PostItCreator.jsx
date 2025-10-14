import React, { useState } from 'react';
import { postitTemplates } from './postItTemplates';
import './PostitCreator.css';

export default function PostItCreator({ onCreate }) {
  const [section, setSection] = useState('Travel');
  const [formData, setFormData] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onCreate({ ...formData, section, id: Date.now() });
    setFormData({});
  };

  const fields = postitTemplates[section].fields;

  return (
    <form className="postit-creator" onSubmit={handleSubmit}>
      <label>
        Sezione:
        <select value={section} onChange={e => setSection(e.target.value)}>
          {Object.keys(postitTemplates).map(sec => (
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

      <button type="submit">Crea Post-It</button>
    </form>
  );
}
