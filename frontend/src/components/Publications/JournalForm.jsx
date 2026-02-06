import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  formContainerStyle,
  formTitleStyle,
  formErrorStyle,
  formLayoutStyle,
  formFieldStyle,
  formLabelStyle,
  formInputStyle,
  formButtonRowStyle,
  formPrimaryButtonStyle,
  formSecondaryButtonStyle,
} from "../common/formStyles.js";

const JournalForm = ({ publication }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    journalName: '',
    publishedDate: '',
    authors: [''],
    domain: ''
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ---------------- Populate form for edit ---------------- */
  useEffect(() => {
    if (publication) {
      setFormData({
        title: publication.title || '',
        // ✅ READ FROM publisherName (DB field)
        journalName: publication.publisherName || '',
        publishedDate: publication.publishedDate
          ? publication.publishedDate.split('T')[0]
          : '',
        authors:
          publication.authors && publication.authors.length > 0
            ? publication.authors
            : [''],
        domain: publication.domain || ''
      });
    }
  }, [publication]);

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthorChange = (index, value) => {
    const updated = [...formData.authors];
    updated[index] = value;
    setFormData({ ...formData, authors: updated });
  };

  const addAuthor = () =>
    setFormData({ ...formData, authors: [...formData.authors, ''] });

  const removeAuthor = (index) =>
    setFormData({
      ...formData,
      authors: formData.authors.filter((_, i) => i !== index)
    });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();

      submitData.append('type', 'journal');
      submitData.append('title', formData.title);

      // ✅ CRITICAL FIX: send as publisherName
      submitData.append('publisherName', formData.journalName);

      submitData.append('publishedDate', formData.publishedDate);
      submitData.append('domain', formData.domain || '');
      submitData.append(
        'authors',
        formData.authors.filter((a) => a.trim()).join(', ')
      );

      if (file) submitData.append('proof', file);

      if (publication?._id) {
        await api.put(`/publications/${publication._id}`, submitData);
        alert('Journal publication updated successfully!');
      } else {
        await api.post('/publications', submitData);
        alert('Journal publication added successfully!');
      }

      navigate('/publications/list');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save publication');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={formContainerStyle}>
      <h1 style={formTitleStyle}>
        {publication ? 'Edit' : 'Add'} Journal Publication
      </h1>

      {error && <div style={formErrorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={formLayoutStyle}>
        {/* Title */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Journal Name */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Journal Name *</label>
          <input
            type="text"
            name="journalName"
            value={formData.journalName}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Published Date */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Published Date *</label>
          <input
            type="date"
            name="publishedDate"
            value={formData.publishedDate}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Authors */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Authors</label>
          {formData.authors.map((author, index) => (
            <div key={index} style={authorRowStyle}>
              <input
                value={author}
                onChange={(e) =>
                  handleAuthorChange(index, e.target.value)
                }
                placeholder={`Author ${index + 1}`}
                style={formInputStyle}
              />
              {formData.authors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAuthor(index)}
                  style={removeButtonStyle}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addAuthor}
            style={addButtonStyle}
          >
            + Add Author
          </button>
        </div>

        {/* Domain */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Domain</label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            style={formInputStyle}
          />
        </div>

        {/* Proof */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>
            Proof Document (PDF/Image)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={formInputStyle}
          />
        </div>

        {/* Buttons */}
        <div style={formButtonRowStyle}>
          <button
            type="submit"
            disabled={loading}
            style={formPrimaryButtonStyle}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/publications/list')}
            style={formSecondaryButtonStyle}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalForm;

/* ---------------- STYLES ---------------- */
const authorRowStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '10px',
};
const removeButtonStyle = {
  padding: '10px',
  background: '#8b1d2c',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};
const addButtonStyle = {
  padding: '10px 20px',
  background: '#1b2a44',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};
