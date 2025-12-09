import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiFileText, FiDownload, FiEye } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api.config';

const AdminUserDetailsModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [verificationDocuments, setVerificationDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchUserVerificationDocuments();
    }
  }, [user]);

  const fetchUserVerificationDocuments = async () => {
    if (!user || !user.id) return;
    try {
      setLoadingDocuments(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}/verification-documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched verification documents:', data.documents);
        setVerificationDocuments(data.documents || []);
        setActiveTab((prev) => (data.documents && data.documents.length > 0 ? (prev === 'profile' ? 'verification' : prev) : 'profile'));
      } else {
        setVerificationDocuments([]);
        setActiveTab('profile');
      }
    } catch (error) {
      setVerificationDocuments([]);
      setActiveTab('profile');
      console.error('Error fetching verification documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Helper to get the correct API base URL (handles dev/prod, proxy, etc.)
  const getApiBase = () => {
    // If running on localhost:3000, assume backend is on 5000
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
      return 'http://localhost:5000';
    }
    // Otherwise, use same origin
    return window.location.origin;
  };

  // Format location from JSON to human-readable string
  const formatLocation = (location) => {
    if (!location) return '';
    
    // Check if it's an object FIRST, before converting to string
    if (typeof location === 'object' && location !== null && !Array.isArray(location)) {
      const parts = [];
      
      // Priority order: most specific to least specific
      // Use "Name" versions first, then fallback to code versions
      if (location.barangayName && String(location.barangayName).trim()) {
        parts.push(String(location.barangayName).trim());
      } else if (location.barangay && String(location.barangay).trim()) {
        parts.push(String(location.barangay).trim());
      }
      
      if (location.cityName && String(location.cityName).trim()) {
        parts.push(String(location.cityName).trim());
      } else if (location.city && String(location.city).trim()) {
        parts.push(String(location.city).trim());
      }
      
      if (location.provinceName && String(location.provinceName).trim()) {
        parts.push(String(location.provinceName).trim());
      } else if (location.province && String(location.province).trim()) {
        parts.push(String(location.province).trim());
      }
      
      if (location.regionName && String(location.regionName).trim()) {
        // Clean up region name - remove "(Region X)" suffixes
        const regionName = String(location.regionName).trim().replace(/\s*\(Region\s+[IVX\d]+\)\s*$/i, '');
        if (regionName && regionName !== 'Region') {
          parts.push(regionName);
        }
      } else if (location.region && String(location.region).trim()) {
        const regionName = String(location.region).trim().replace(/\s*\(Region\s+[IVX\d]+\)\s*$/i, '');
        if (regionName && regionName !== 'Region') {
          parts.push(regionName);
        }
      }
      
      return parts.length > 0 ? parts.join(', ') : '';
    }
    
    // Convert to string for string-based checks
    let locationStr = String(location);
    
    // If it's a JSON string, try to parse it
    if (locationStr.trim().startsWith('{') || locationStr.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(locationStr);
        return formatLocation(parsed);
      } catch (e) {
        // If parsing fails, check if it contains regionCode - skip these malformed entries
        if (locationStr.includes('regionCode') || locationStr.includes('"regionCode"')) {
          return ''; // Return empty string to filter out malformed JSON
        }
        return locationStr;
      }
    }
    
    // For simple strings, check if it contains regionCode and skip if it does
    if (locationStr.includes('regionCode') || locationStr.includes('"regionCode"')) {
      return '';
    }
    
    // If it's "[object Object]", return empty string
    if (locationStr === '[object Object]') {
      return '';
    }
    
    return locationStr.trim();
  };

  const handleViewDocument = (document) => {
    if (document.document_id) {
      setViewingDocument(document);
      setZoomLevel(100);
    }
  };

  const closeDocumentViewer = () => {
    setViewingDocument(null);
    setZoomLevel(100);
  };

  const getDocumentViewUrl = (document) => {
    if (!document || !document.document_id) return null;
    const apiBase = getApiBase();
    const token = localStorage.getItem('token');
    return `${apiBase}/api/verification/document/${document.document_id}/view?token=${encodeURIComponent(token)}`;
  };

  const isImageDocument = (document) => {
    if (!document) return false;
    const fileType = document.file_type || '';
    const fileName = document.file_name || '';
    return fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const handleDownloadDocument = (document) => {
    if (document.file_path) {
      const apiBase = getApiBase();
      const token = localStorage.getItem('token');
      // Use <a> tag with token in query param for download
      const link = document.createElement('a');
      link.href = `${apiBase}/api/verification/document/${document.document_id}/download?token=${encodeURIComponent(token)}`;
      link.download = document.file_name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'approved': { color: 'bg-green-100 text-green-800', text: 'Approved' },
      'not approved': { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      'suspended': { color: 'bg-gray-100 text-gray-800', text: 'Suspended' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getVerificationStatusBadge = (isVerified) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isVerified 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isVerified ? 'Verified' : 'Not Verified'}
      </span>
    );
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user?.full_name || 'N/A'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="p-3 bg-gray-50 rounded-lg">{user?.email || 'N/A'}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="p-3 bg-gray-50 rounded-lg capitalize">{user?.role || 'N/A'}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="p-3 bg-gray-50 rounded-lg">{formatLocation(user?.location) || 'N/A'}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <div className="p-3 bg-gray-50 rounded-lg">{user?.industry || 'N/A'}</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              {getStatusBadge(user?.verification_status)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verified</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              {getVerificationStatusBadge(user?.is_verified)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joined</label>
            <div className="p-3 bg-gray-50 rounded-lg">{formatDate(user?.created_at)}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <div className="p-3 bg-gray-50 rounded-lg">{user?.contact_number || 'N/A'}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className="p-3 bg-gray-50 rounded-lg capitalize">{user?.gender || 'N/A'}</div>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
          <div className="p-3 bg-gray-50 rounded-lg">{user?.education || 'N/A'}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employment</label>
          <div className="p-3 bg-gray-50 rounded-lg">{user?.employment || 'N/A'}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Introduction</label>
          <div className="p-3 bg-gray-50 rounded-lg">{user?.introduction || 'N/A'}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            {user?.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            ) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerificationTab = () => {
    if (loadingDocuments) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading verification documents...</div>
        </div>
      );
    }

    if (verificationDocuments.length === 0) {
      return (
        <div className="text-center py-8">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-gray-500 mb-2">No verification documents found</div>
          <div className="text-sm text-gray-400">This user hasn't submitted any verification documents yet.</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {verificationDocuments.map((doc) => (
          <div key={doc.document_id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{doc.document_type}</h4>
                <p className="text-sm text-gray-600">Document #: {doc.document_number || 'N/A'}</p>
              </div>
              {getStatusBadge(doc.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500">Issue Date:</span>
                <div className="font-medium">{formatDate(doc.issue_date)}</div>
              </div>
              <div>
                <span className="text-gray-500">Expiry Date:</span>
                <div className="font-medium">{formatDate(doc.expiry_date)}</div>
              </div>
              <div>
                <span className="text-gray-500">Issuing Authority:</span>
                <div className="font-medium">{doc.issuing_authority || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-500">Uploaded:</span>
                <div className="font-medium">{formatDate(doc.uploaded_at)}</div>
              </div>
            </div>

            {doc.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <span className="text-red-700 text-sm font-medium">Rejection Reason:</span>
                <p className="text-red-600 text-sm mt-1">{doc.rejection_reason}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleViewDocument(doc)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                <FiEye className="w-3 h-3" />
                View
              </button>
              <a
                href={`${getApiBase()}/api/verification/document/${doc.document_id}/download?token=${encodeURIComponent(localStorage.getItem('token'))}`}
                download={doc.file_name || 'document'}
                className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiDownload className="w-3 h-3" />
                Download
              </a>
            </div>
            
            {/* Inline Document Viewer */}
            {viewingDocument && viewingDocument.document_id === doc.document_id && (
              <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-300">
                  <span className="text-sm font-medium text-gray-700">
                    {viewingDocument.document_type} - {viewingDocument.file_name || 'Document'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={zoomLevel <= 50}
                    >
                      -
                    </button>
                    <span className="text-xs text-gray-600 min-w-[50px] text-center">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={zoomLevel >= 200}
                    >
                      +
                    </button>
                    <button
                      onClick={() => setZoomLevel(100)}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
                    >
                      Reset
                    </button>
                    <button
                      onClick={closeDocumentViewer}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="overflow-auto max-h-[500px] bg-gray-200 p-4" style={{ scrollBehavior: 'smooth' }}>
                  <div className="flex items-center justify-center w-full">
                    {isImageDocument(viewingDocument) ? (
                      <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}>
                        <img
                          src={getDocumentViewUrl(viewingDocument)}
                          alt={viewingDocument.document_type || 'Document'}
                          className="max-w-full h-auto shadow-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const errorDiv = e.target.parentElement.parentElement.querySelector('.error-message');
                            if (errorDiv) errorDiv.style.display = 'block';
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ width: `${zoomLevel}%`, height: 'auto' }}>
                        <iframe
                          src={getDocumentViewUrl(viewingDocument)}
                          className="w-full border-none shadow-lg"
                          style={{ minHeight: `${600 * (zoomLevel / 100)}px` }}
                          title={viewingDocument.document_type || 'Document'}
                        />
                      </div>
                    )}
                    <div className="error-message text-center text-gray-500 p-8" style={{ display: 'none' }}>
                      <p className="mb-2">Failed to load document.</p>
                      <a
                        href={`${getApiBase()}/api/verification/document/${viewingDocument.document_id}/download?token=${encodeURIComponent(localStorage.getItem('token'))}`}
                        download={viewingDocument.file_name || 'document'}
                        className="text-blue-500 hover:underline"
                      >
                        Click here to download instead
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <p className="text-sm text-gray-600">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user?.full_name || user?.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiUser className="w-4 h-4 inline mr-2" />
              Profile Information
            </button>
            {verificationDocuments.length > 0 && (
              <button
                onClick={() => setActiveTab('verification')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'verification'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiFileText className="w-4 h-4 inline mr-2" />
                Verification Documents ({verificationDocuments.length})
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'profile' ? renderProfileTab() : renderVerificationTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailsModal; 