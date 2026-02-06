// src/components/PhdScholars/ScholarForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const ScholarForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // for edit mode
  const [formData, setFormData] = useState({
    scholarName: '',
    dateOfJoining: '',
    domain: '',
    progress: '',
    guide: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch scholar for editing
  useEffect(() => {
    if (id) {
      const fetchScholar = async () => {
        try {
          const res = await api.get(`/phdScholars/${id}`);
          const scholar = res.data;
          setFormData({
            scholarName: scholar.scholarName || '',
            dateOfJoining: scholar.dateOfJoining ? scholar.dateOfJoining.split('T')[0] : '',
            domain: scholar.domain || '',
            progress: scholar.progress || '',
            guide: scholar.guide || ''
          });
        } catch (err) {
          console.error('Error fetching scholar:', err);
          setError('Failed to load scholar data');
        }
      };
      fetchScholar();
    }
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => submitData.append(key, formData[key]));
      if (file) submitData.append('proof', file);

      if (id) {
        await api.put(`/phdScholars/${id}`, submitData);
        alert('Scholar updated successfully!');
      } else {
        await api.post('/phdScholars', submitData);
        alert('Scholar added successfully!');
      }

      navigate('/phdscholars/list');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save scholar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h1 style={formTitleStyle}>{id ? 'Edit' : 'Add'} PhD Scholar</h1>

      {error && <div style={formErrorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={formLayoutStyle}>
        {/* Scholar Name */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Scholar Name *</label>
          <input
            type="text"
            name="scholarName"
            value={formData.scholarName}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Date of Joining */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Date of Joining *</label>
          <input
            type="date"
            name="dateOfJoining"
            value={formData.dateOfJoining}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Domain */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Domain</label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            placeholder="e.g., Machine Learning, Cloud Computing"
            style={formInputStyle}
          />
        </div>

        {/* Progress */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Progress</label>
          <textarea
            name="progress"
            value={formData.progress}
            onChange={handleChange}
            placeholder="Current research progress and status"
            style={textareaStyle}
          />
        </div>

        {/* Guide */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Guide</label>
          <input
            type="text"
            name="guide"
            value={formData.guide}
            onChange={handleChange}
            placeholder="Research guide/supervisor name"
            style={formInputStyle}
          />
        </div>

        {/* Proof */}
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
          <button type="button" onClick={() => navigate('/phdscholars/list')} style={formSecondaryButtonStyle}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScholarForm;

/* ------------------- STYLES ------------------- */
const textareaStyle = {
  ...formInputStyle,
  minHeight: "90px",
};

