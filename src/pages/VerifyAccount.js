import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function VerifyAccount() {
  const [status, setStatus] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    document_type: '',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    issuing_authority: '',
    document: null,
  });
  const [uploading, setUploading] = useState(false);
  const [editDoc, setEditDoc] = useState(null); // Document being edited
  const [editForm, setEditForm] = useState(null); // Edit form state
  const [editUploading, setEditUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line
  }, []);

  async function fetchStatus() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/verification/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch verification status');
      const data = await res.json();
      setStatus(data.verification_status);
      setDocuments(data.documents || []);
      if (data.verification_status === 'verified') {
        window.location.href = '/entrepreneur-dashboard';
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'document' && v) formData.append('document', v);
        else if (k !== 'document') formData.append(k, v);
      });
      const res = await fetch('/api/verification/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to upload document');
      setSuccess('Document uploaded!');
      setForm({ document_type: '', document_number: '', issue_date: '', expiry_date: '', issuing_authority: '', document: null });
      fetchStatus();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  }

  // Edit document handlers
  function handleEditClick(doc) {
    setEditDoc(doc);
    setEditForm({
      document_type: doc.document_type,
      document_number: doc.document_number || '',
      issue_date: doc.issue_date || '',
      expiry_date: doc.expiry_date || '',
      issuing_authority: doc.issuing_authority || '',
      document: null,
    });
  }
  function handleEditFormChange(e) {
    const { name, value, files } = e.target;
    setEditForm(f => ({ ...f, [name]: files ? files[0] : value }));
  }
  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditUploading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (k === 'document' && v) formData.append('document', v);
        else if (k !== 'document') formData.append(k, v);
      });
      const res = await fetch(`/api/verification/document/${editDoc.document_id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to update document');
      setSuccess('Document updated!');
      setEditDoc(null);
      setEditForm(null);
      fetchStatus();
    } catch (e) {
      setError(e.message);
    } finally {
      setEditUploading(false);
    }
  }
  function handleEditCancel() {
    setEditDoc(null);
    setEditForm(null);
  }

  async function handleDeleteDocument(documentId) {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/verification/document/${documentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete document');
      setSuccess('Document deleted!');
      fetchStatus();
    } catch (e) {
      setError(e.message);
    }
  }

  const statusColors = {
    verified: 'bg-green-100 text-green-700 border-green-300',
    Pending: 'bg-orange-100 text-orange-700 border-orange-300',
    'not approved': 'bg-red-100 text-red-700 border-red-300',
    default: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#181818] flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Main Form Section */}
        <div className="flex-1 bg-white dark:bg-[#232526] rounded-2xl shadow-lg p-6 md:p-10 mb-6 md:mb-0">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 px-5 py-2 rounded-full bg-[#ff7f32] hover:bg-[#e86c1a] text-white font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff7f32] focus:ring-offset-2 dark:focus:ring-offset-[#232526] w-fit"
            aria-label="Go back"
          >
            <span className="text-xl">←</span> Back
          </button>
          <h1 className="text-3xl font-bold text-[#b45309] dark:text-[#ffb366] mb-2">Account Verification</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Upload your verification documents to unlock all features of the platform.</p>
          <div className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full border border-[#ff7f32] text-[#b45309] dark:text-[#ffb366] bg-[#fff7ed] dark:bg-[#2d2d2d] font-semibold text-base">{status || 'Pending'}</span>
          </div>
          {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}
          {success && <div className="mb-4 text-green-600 dark:text-green-400">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-1 text-[#b45309] dark:text-[#ffb366]">Document Type</label>
              <select
                name="document_type"
                value={form.document_type}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#232526] text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7f32]"
                required
              >
                <option value="">Select document type</option>
                <option value="passport">Passport</option>
                <option value="id_card">ID Card</option>
                <option value="driver_license">Driver's License</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-[#b45309] dark:text-[#ffb366]">Document Number</label>
                <input
                  type="text"
                  name="document_number"
                  value={form.document_number}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#232526] text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7f32]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#b45309] dark:text-[#ffb366]">Issue Date</label>
                <input
                  type="date"
                  name="issue_date"
                  value={form.issue_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#232526] text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7f32]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#b45309] dark:text-[#ffb366]">Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={form.expiry_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#232526] text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7f32]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#b45309] dark:text-[#ffb366]">Issuing Authority</label>
              <input
                type="text"
                name="issuing_authority"
                value={form.issuing_authority}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#232526] text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7f32]"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#b45309] dark:text-[#ffb366]">Upload Document <span className="text-xs text-gray-500">(PDF, JPG, PNG, max 5MB)</span></label>
              <input
                type="file"
                name="document"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#232526] text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff7f32] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ff7f32] file:text-white file:font-semibold file:cursor-pointer"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 rounded-lg bg-[#ff7f32] hover:bg-[#e86c1a] text-white font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff7f32] focus:ring-offset-2 dark:focus:ring-offset-[#232526] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
        {/* Sidebar: Uploaded Documents */}
        <aside className="w-full md:w-96 bg-white dark:bg-[#232526] rounded-2xl shadow-lg p-6 h-fit md:sticky md:top-8 self-start">
          <h2 className="text-2xl font-bold text-[#b45309] dark:text-[#ffb366] mb-4">Uploaded Documents</h2>
          {loading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No documents uploaded yet.</div>
          ) : (
            <ul className="space-y-4">
              {documents.map((doc) => (
                <li key={doc.id} className="bg-[#fff7ed] dark:bg-[#2d2d2d] rounded-lg p-4 flex flex-col gap-2 border border-[#ff7f32]/20 dark:border-[#ffb366]/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#b45309] dark:text-[#ffb366]">{doc.document_type.replace(/_/g, ' ').toUpperCase()}</span>
                    {/* Add edit/delete buttons if needed */}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">No: {doc.document_number}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Issued: {doc.issue_date} | Expires: {doc.expiry_date}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Authority: {doc.issuing_authority}</div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}