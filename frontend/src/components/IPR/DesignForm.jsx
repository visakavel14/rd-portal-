// src/components/IPR/DesignForm.jsx
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

const DesignForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    status: 'submitted',
    designNumber: '',
    title: '',
    holders: '',
    domain: '',
    submissionDate: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchIPR = async () => {
        try {
          const res = await api.get(`/ipr/${id}`);
          const ipr = res.data;
          setFormData({
            status: ipr.status || 'submitted',
            designNumber: ipr.designNumber || '',
            title: ipr.title || '',
            holders: (ipr.holders || []).join(', '),
            domain: ipr.domain || '',
            submissionDate: ipr.submissionDate ? ipr.submissionDate.split('T')[0] : ''
          });
        } catch (err) {
          console.error(err);
          setError('Failed to load IPR data');
        }
      };
      fetchIPR();
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

      Object.keys(formData).forEach((key) => {
        if (key === 'holders') {
          const holdersArray = formData.holders
            .split(',')
            .map(h => h.trim())
            .filter(h => h.length);
          submitData.append('holders', JSON.stringify(holdersArray));
        } else if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      submitData.append('type', 'design');

      if (file) submitData.append('proof', file);

      if (id) {
        await api.put(`/ipr/${id}`, submitData);
        alert('Design IPR updated successfully!');
      } else {
        await api.post('/ipr', submitData);
        alert('Design IPR added successfully!');
      }

      navigate('/ipr/list');
    } catch (err) {
      console.error('Add IPR Error:', err);
      setError(err.response?.data?.message || 'Failed to save IPR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h1 style={formTitleStyle}>{id ? 'Edit' : 'Add'} Design IPR</h1>

      {error && <div style={formErrorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={formLayoutStyle}>
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            style={formInputStyle}
          >
            <option value="submitted">Submitted</option>
            <option value="granted">Granted</option>
          </select>
        </div>

        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Design Number</label>
          <input
            type="text"
            name="designNumber"
            value={formData.designNumber}
            onChange={handleChange}
            placeholder="Enter design number if available"
            style={formInputStyle}
          />
        </div>

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

        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Holders</label>
          <input
            type="text"
            name="holders"
            value={formData.holders}
            onChange={handleChange}
            placeholder="Comma separated"
            style={formInputStyle}
          />
        </div>

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

        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Submission Date</label>
          <input
            type="date"
            name="submissionDate"
            value={formData.submissionDate}
            onChange={handleChange}
            style={formInputStyle}
          />
        </div>

        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Proof Document (PDF/Image)</label>
          <input
            type="file"
            name="proof"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={formInputStyle}
          />
        </div>

        <div style={formButtonRowStyle}>
          <button type="submit" disabled={loading} style={formPrimaryButtonStyle}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/ipr/list')}
            style={formSecondaryButtonStyle}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DesignForm;

// styles now shared in common/formStyles.js
