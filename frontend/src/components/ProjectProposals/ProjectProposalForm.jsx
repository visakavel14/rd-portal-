// src/components/ProjectProposals/ProjectProposalForm.jsx

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

const ProjectProposalForm = ({ proposal, onClose }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    status: 'submitted',
    agency: '',
    pi: '',
    copi: [''],
    date: '',
    domain: '',
    title: ''
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load proposal data if editing
  useEffect(() => {
    if (proposal) {
      setFormData({
        status: proposal.status || 'submitted',
        agency: proposal.agency || '',
        pi: proposal.pi || '',
        copi: proposal.copi?.length ? proposal.copi : [''],
        date: proposal.date ? proposal.date.split('T')[0] : '',
        domain: proposal.domain || '',
        title: proposal.title || ''
      });
    }
  }, [proposal]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCopiChange = (index, value) => {
    const updated = [...formData.copi];
    updated[index] = value;
    setFormData({ ...formData, copi: updated });
  };

  const addCopi = () =>
    setFormData({ ...formData, copi: [...formData.copi, ''] });

  const removeCopi = (index) =>
    setFormData({
      ...formData,
      copi: formData.copi.filter((_, i) => i !== index)
    });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === 'copi') {
          submitData.append(
            'copi',
            JSON.stringify(formData[key].filter((c) => c.trim() !== ''))
          );
        } else {
          submitData.append(key, formData[key]);
        }
      });

      if (file) submitData.append('proof', file);

      if (proposal?._id) {
        // Update
        await api.put(`/proposals/${proposal._id}`, submitData);
        alert('Proposal updated successfully!');
      } else {
        // Add new
        await api.post('/proposals', submitData);
        alert('Proposal submitted successfully!');
      }

      if (onClose) onClose(); // close modal if exists
      else navigate('/proposals/list');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h2 style={formTitleStyle}>{proposal ? 'Edit' : 'Add'} Project Proposal</h2>

      {error && <div style={formErrorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={formLayoutStyle}>
        {/* Status */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={formInputStyle}
            required
          >
            <option value="submitted">Submitted</option>
            <option value="granted">Granted</option>
          </select>
        </div>

        {/* Agency */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Funding Agency *</label>
          <input
            type="text"
            name="agency"
            value={formData.agency}
            onChange={handleChange}
            placeholder="e.g., DST, DRDO"
            required
            style={formInputStyle}
          />
        </div>

        {/* PI */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Principal Investigator *</label>
          <input
            type="text"
            name="pi"
            value={formData.pi}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Co-PIs */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Co-Principal Investigators</label>
          {formData.copi.map((value, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={value}
                placeholder={`Co-PI ${index + 1}`}
                onChange={(e) => handleCopiChange(index, e.target.value)}
                style={{ ...formInputStyle, flex: 1 }}
              />
              {formData.copi.length > 1 && (
                <button type="button" onClick={() => removeCopi(index)} style={removeButtonStyle}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addCopi} style={addButtonStyle}>
            + Add Co-PI
          </button>
        </div>

        {/* Date */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={formInputStyle}
          />
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
            placeholder="e.g., AI, IoT"
            style={formInputStyle}
          />
        </div>

        {/* Title */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Project Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={formInputStyle}
          />
        </div>

        {/* Proof */}
        <div style={formFieldStyle}>
          <label style={formLabelStyle}>Proposal Document (PDF/Image)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={formInputStyle} />
        </div>

        {/* Buttons */}
        <div style={formButtonRowStyle}>
          <button type="submit" disabled={loading} style={formPrimaryButtonStyle}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} style={formSecondaryButtonStyle}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProjectProposalForm;

/* ---------------- STYLES ---------------- */
const addButtonStyle = { padding: '6px 12px', background: '#1b2a44', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', width: '130px', fontSize: '14px' };
const removeButtonStyle = { padding: '10px 12px', background: '#8b1d2c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
