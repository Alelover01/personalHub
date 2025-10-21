import React, { useState, useEffect } from 'react';
import { postItTemplates } from './postItTemplates';
import './PostItCreator.css';

export default function PostItCreator({ onCreate, onClose, noteToEdit }) {
  const [formData, setFormData] = useState({
    id: Date.now(),
    section: 'Travel',
  });

  useEffect(() => {
    if (noteToEdit) {
      setFormData({ ...noteToEdit });
    }
  }, [noteToEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
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

  // 🔹 Template della sezione attuale
  const currentTemplate = postItTemplates[formData.section];

  // 🔹 Funzione per controllare se un campo condizionale deve essere mostrato
  const shouldShowField = (field) => {
    if (!field.conditionalOn) return true;
    const targetValue = formData[field.conditionalOn.field];
    const expectedValue = field.conditionalOn.value;
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(targetValue);
    }
    return targetValue === expectedValue;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{noteToEdit ? 'Modifica Post-It' : 'Crea Post-It'}</h3>

        <form onSubmit={handleSubmit}>
          {/* 🔸 Sezione */}
          <label>
            Sezione:
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
            >
              {Object.keys(postItTemplates).map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </label>

          {/* 🔸 Generazione dinamica dei campi */}
          {currentTemplate.fields.map((field) =>
            shouldShowField(field) ? (
              <label key={field.name}>
                {field.label}:
                {field.type === 'text' && (
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    required={field.required}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                  />
                )}

                {field.type === 'select' && (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                  >
                    <option value="">Seleziona...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            ) : null
          )}

          {/* 🔹 Pulsanti */}
          <div className="modal-actions">
            <button type="submit">{noteToEdit ? 'Aggiorna' : 'Crea'}</button>
            <button type="button" onClick={onClose}>
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}