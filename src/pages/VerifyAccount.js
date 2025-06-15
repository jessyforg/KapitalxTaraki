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
    pending: 'bg-orange-100 text-orange-700 border-orange-300',
    'not approved': 'bg-red-100 text-red-700 border-red-300',
    default: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-orange-50 flex flex-row items-start pt-28 px-2 relative">
        {/* Back Button */}
        <button
          className="fixed top-28 left-8 z-40 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full shadow font-semibold flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <span className="text-lg">&#8592;</span> Back
        </button>
        {/* Main Card */}
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
          <h1 className="text-3xl font-bold mb-2 text-orange-700">Account Verification</h1>
          <p className="mb-6 text-gray-600">Upload your verification documents to unlock all features of the platform.</p>
          {loading ? <div>Loading...</div> : (
            <>
              {error && <div className="text-red-500 mb-2 font-semibold">{error}</div>}
              {success && <div className="text-green-600 mb-2 font-semibold">{success}</div>}
              <div className="mb-6">
                <span className={`inline-block px-5 py-2 rounded-full font-semibold border text-base mb-2 ${statusColors[status] || statusColors.default}`}>{status ? capitalizeFirst(status) : 'Unknown'}</span>
              </div>
              <form className="space-y-5 mb-2" onSubmit={handleSubmit} encType="multipart/form-data">
                <div>
                  <label className="block font-semibold mb-1 text-orange-700">Document Type</label>
                  <select name="document_type" value={form.document_type} onChange={handleChange} required className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400">
                    <option value="">Select document type</option>
                    <option value="government_id">Government ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="business_registration">Business Registration</option>
                    <option value="professional_license">Professional License</option>
                    <option value="tax_certificate">Tax Certificate</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="utility_bill">Utility Bill</option>
                    <option value="proof_of_address">Proof of Address</option>
                    <option value="employment_certificate">Employment Certificate</option>
                    <option value="educational_certificate">Educational Certificate</option>
                    <option value="other">Other Document</option>
                  </select>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1 text-orange-700">Document Number</label>
                    <input name="document_number" value={form.document_number} onChange={handleChange} className="w-full border border-orange-200 rounded-lg px-3 py-2" />
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold mb-1 text-orange-700">Issue Date</label>
                    <input type="date" name="issue_date" value={form.issue_date} onChange={handleChange} className="w-full border border-orange-200 rounded-lg px-3 py-2" />
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold mb-1 text-orange-700">Expiry Date</label>
                    <input type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} className="w-full border border-orange-200 rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-orange-700">Issuing Authority</label>
                  <input name="issuing_authority" value={form.issuing_authority} onChange={handleChange} className="w-full border border-orange-200 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-orange-700">Upload Document <span className="text-xs text-gray-500">(PDF, JPG, PNG, max 5MB)</span></label>
                  <input type="file" name="document" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} required className="w-full border border-orange-200 rounded-lg px-3 py-2 bg-orange-50" />
                </div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-lg font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={uploading}>{uploading ? 'Uploading...' : 'Submit Document'}</button>
              </form>
            </>
          )}
        </div>
        {/* Floating Sidebar: Uploaded Documents */}
        <aside className="fixed right-8 top-28 bottom-8 z-30 w-96 bg-white rounded-2xl shadow-xl border border-orange-100 flex flex-col p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-orange-700">Uploaded Documents</h2>
          {documents.length === 0 ? <div className="text-gray-500">No documents uploaded yet.</div> : (
            <div className="space-y-4">
              {documents.map(doc => (
                <div key={doc.document_id} className="border border-orange-100 rounded-xl p-4 bg-orange-50 mb-2">
                  {editDoc && editDoc.document_id === doc.document_id ? (
                    <form className="space-y-2" onSubmit={handleEditSubmit} encType="multipart/form-data">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[doc.status] || statusColors.default}`}>{capitalizeFirst(doc.status)}</span>
                        <span className="font-semibold text-orange-700">{doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-orange-700">Document Number</label>
                        <input name="document_number" value={editForm.document_number} onChange={handleEditFormChange} className="w-full border border-orange-200 rounded-lg px-2 py-1 text-sm" />
                        <label className="text-xs font-semibold text-orange-700">Issue Date</label>
                        <input type="date" name="issue_date" value={editForm.issue_date} onChange={handleEditFormChange} className="w-full border border-orange-200 rounded-lg px-2 py-1 text-sm" />
                        <label className="text-xs font-semibold text-orange-700">Expiry Date</label>
                        <input type="date" name="expiry_date" value={editForm.expiry_date} onChange={handleEditFormChange} className="w-full border border-orange-200 rounded-lg px-2 py-1 text-sm" />
                        <label className="text-xs font-semibold text-orange-700">Issuing Authority</label>
                        <input name="issuing_authority" value={editForm.issuing_authority} onChange={handleEditFormChange} className="w-full border border-orange-200 rounded-lg px-2 py-1 text-sm" />
                        <label className="text-xs font-semibold text-orange-700">Replace Document (optional)</label>
                        <input type="file" name="document" accept=".pdf,.jpg,.jpeg,.png" onChange={handleEditFormChange} className="w-full border border-orange-200 rounded-lg px-2 py-1 text-sm bg-orange-50" />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-lg font-semibold text-sm shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={editUploading}>{editUploading ? 'Saving...' : 'Save'}</button>
                        <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded-lg font-semibold text-sm" onClick={handleEditCancel}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[doc.status] || statusColors.default}`}>{capitalizeFirst(doc.status)}</span>
                        <span className="font-semibold text-orange-700">{doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <button className="ml-auto text-xs text-orange-600 font-semibold hover:text-orange-800 focus:outline-none" style={{textDecoration: 'none', cursor: 'pointer'}} onClick={() => handleEditClick(doc)}>Edit</button>
                        <button className="ml-2 text-xs text-red-600 font-semibold hover:text-red-800 focus:outline-none" style={{textDecoration: 'none', cursor: 'pointer'}} onClick={() => handleDeleteDocument(doc.document_id)}>Delete</button>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">Number: {doc.document_number || 'N/A'}</div>
                      <div className="text-sm text-gray-700 mb-1">Issued: {doc.issue_date || 'N/A'} | Expiry: {doc.expiry_date || 'N/A'}</div>
                      <div className="text-sm text-gray-700 mb-1">Issuing Authority: {doc.issuing_authority || 'N/A'}</div>
                      <div className="text-sm text-gray-700 mb-1">Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : 'N/A'}</div>
                      {doc.rejection_reason && <div className="text-red-600 text-xs mt-1">Reason: {doc.rejection_reason}</div>}
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-orange-600 text-xs font-semibold hover:text-orange-800 focus:outline-none" style={{textDecoration: 'none', cursor: 'pointer', display: 'inline-block', marginTop: '0.5rem'}} >View Document</a>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
} 