// src/components/Publications/BookChapterForm.jsx

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

const BookChapterForm = ({ publication }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'bookchapter',
    title: '',
    bookName: '',
    publisher: '',
    publishedDate: '',
    authors: [''],
    domain: ''
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (publication) {
      setFormData({
        type: 'bookchapter',
        title: publication.title || '',
        bookName: publication.bookName || '',
        publisher: publication.publisher || '',
        publishedDate: publication.publishedDate ? publication.publishedDate.split('T')[0] : '',
        authors: publication.authors && publication.authors.length > 0 ? publication.authors : [''],
        domain: publication.domain || ''
      });
    }
  }, [publication]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthorChange = (index, value) => {
    const authorsCopy = [...formData.authors];
    authorsCopy[index] = value;
    setFormData({ ...formData, authors: authorsCopy });
  };

  const addAuthor = () => setFormData({ ...formData, authors: [...formData.authors, ''] });
  const removeAuthor = (index) => setFormData({ ...formData, authors: formData.authors.filter((_, i) => i !== index) });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('type', 'bookchapter');
      submitData.append('title', formData.title);
      submitData.append('bookName', formData.bookName);
      submitData.append('publisher', formData.publisher);
      submitData.append('publishedDate', formData.publishedDate);
      submitData.append('domain', formData.domain || '');
      submitData.append('authors', JSON.stringify(formData.authors.filter(a => a.trim())));

      if (file) submitData.append('proof', file);

      if (publication?._id) {
        await api.put(`/publications/${publication._id}`, submitData);
        alert('Book chapter updated successfully!');
      } else {
        await api.post('/publications', submitData);
        alert('Book chapter added successfully!');
      }

      navigate('/publications/list');
    } catch (err) {
      console.error('Error saving publication:', err.response || err);
      setError(err.response?.data?.message || 'Failed to save publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h1 style={formTitleStyle}>{publication ? 'Edit' : 'Add'} Book Chapter</h1>

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

        {/* Book Name */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Book Name *</label>
          <input
            type="text"
            name="bookName"
            value={formData.bookName}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Publisher */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Publisher</label>
          <input
            type="text"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
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
          {formData.authors.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                value={a}
                onChange={(e) => handleAuthorChange(i, e.target.value)}
                placeholder={`Author ${i + 1}`}
                style={{ ...formInputStyle, flex: 1 }}
              />
              {formData.authors.length > 1 && (
                <button type="button" onClick={() => removeAuthor(i)} style={removeButtonStyle}>Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addAuthor} style={addButtonStyle}>+ Add Author</button>
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

        {/* Proof Document */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Proof Document (PDF/Image)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={formInputStyle}
          />
        </div>

        {/* Buttons */}
        <div style={formButtonRowStyle}>
          <button type="submit" disabled={loading} style={formPrimaryButtonStyle}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/publications/list')} style={formSecondaryButtonStyle}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookChapterForm;

/* ------------------- STYLES ------------------- */
const addButtonStyle = {
  padding: '8px 12px',
  backgroundColor: '#1b2a44',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  alignSelf: 'flex-start',
  fontWeight: '600',
};

const removeButtonStyle = {
  padding: '8px 10px',
  backgroundColor: '#8b1d2c',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
};
