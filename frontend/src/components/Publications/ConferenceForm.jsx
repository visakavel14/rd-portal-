// src/components/Publications/ConferenceForm.jsx

import React, { useState } from 'react';
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

const ConferenceForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'conference',
    title: '',
    publisherName: '',
    authors: '',
    publishedDate: '',
    presentedDate: '',
    domain: ''
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();

      // Convert authors to JSON array
      Object.keys(formData).forEach(key => {
        if (key === 'authors') {
          const authorsArray = formData.authors
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0);
          submitData.append('authors', JSON.stringify(authorsArray));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      if (file) submitData.append('proof', file);

      await api.post('/publications', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Conference publication added successfully!');
      navigate('/publications/list');
    } catch (err) {
      console.error('Error adding publication:', err.response || err);
      setError(err.response?.data?.message || 'Failed to add publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h1 style={formTitleStyle}>Add Conference Publication</h1>

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

        {/* Publisher Name */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Publisher Name *</label>
          <input
            type="text"
            name="publisherName"
            value={formData.publisherName}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Authors */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Authors *</label>
          <input
            type="text"
            name="authors"
            value={formData.authors}
            onChange={handleChange}
            placeholder="Comma separated (e.g., John Doe, Jane Doe)"
            required
            style={formInputStyle}
          />
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>Presented Date *</label>
            <input
              type="date"
              name="presentedDate"
              value={formData.presentedDate}
              onChange={handleChange}
              required
              style={formInputStyle}
            />
          </div>
        </div>

        {/* Domain */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Domain *</label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Proof */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Proof (PDF/Image)</label>
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
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={() => navigate('/publications/list')} style={formSecondaryButtonStyle}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConferenceForm;

/* styles now shared in common/formStyles.js */
