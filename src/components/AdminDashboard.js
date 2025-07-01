import React, { useState, useEffect } from 'react';
import { FiHome, FiCalendar, FiUsers, FiBarChart2, FiSettings, FiEdit2, FiPlus, FiBell, FiMail, FiChevronLeft, FiChevronRight, FiMoreVertical, FiEye, FiPause, FiPlay, FiTrash2, FiCheck } from 'react-icons/fi';
import { FaTicketAlt } from 'react-icons/fa'; // Add ticket icon
import './styles.css'; // For custom calendar and dashboard styles
import { ReactComponent as PhMap } from './imgs/ph.svg';
import Navbar from './Navbar'; // Add Navbar import
import { getTickets, updateTicket } from '../api/tickets';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


const initialTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
  { id: 'users', label: 'Users Management', icon: <FiUsers size={20} /> },
  { id: 'startup', label: 'Startup', icon: <FiBarChart2 size={20} /> },
  { id: 'events', label: 'Events', icon: <FiCalendar size={20} /> },
  { id: 'tickets', label: 'Tickets', icon: <FaTicketAlt size={20} /> },
  { id: 'sitePerformance', label: 'Site Performance', icon: <FiBarChart2 size={20} /> },
  // Removed Profile tab
];

// Demo profile data (move this above the AdminDashboard function if not already present)
const profile = {
  name: 'Admin User',
  email: 'admin@taraki.com',
  avatar: null, // You can use a static image or initials
};

function AdminDashboard() {
  const [selectedStartupModal, setSelectedStartupModal] = useState(null);
  const [startupModalOpen, setStartupModalOpen] = useState(false);
  const [tabs] = useState(initialTabs); // Remove setTabs since it's unused
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [eventModal, setEventModal] = useState({ open: false, event: null, date: null });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarAnim, setCalendarAnim] = useState(''); // For animation
  const [events, setEvents] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [eventFiles, setEventFiles] = useState([]); // For new file upload
  const [eventNotification, setEventNotification] = useState(null); // For event creation notification
  const [eventsLoading, setEventsLoading] = useState(false); // For events loading state
  const [roleFilter, setRoleFilter] = useState('all');
  const [roleFilterAnim, setRoleFilterAnim] = useState(''); // Add animation state for role filter
  // State for month/year picker
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(calendarDate.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(calendarDate.getMonth());
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Add state for verification modal (for users tab)
  const [selectedRequest, setSelectedRequest] = useState(null); // For modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionLoading, setModalActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [modalError, setModalError] = useState('');

  // Add state for map location preview in event modal
  const [eventImagePreview, setEventImagePreview] = useState(null);
  const [mapCoords, setMapCoords] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Debounce ref for location input
  const locationDebounceRef = React.useRef();
  const [showMessages, setShowMessages] = useState(false);
  // Add state for tickets and ticket modal
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  // Add state for ticket filters and search
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All Status');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('All Types');
  const [ticketSearch, setTicketSearch] = useState('');
  const [chatAnim, setChatAnim] = useState(false);
  const [selectedStartup, setSelectedStartup] = React.useState(null);
  const [startups, setStartups] = React.useState([]);
  const [startupLoading, setStartupLoading] = useState(false);
  const [startupError, setStartupError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add state for selected pending startup and modal
  const [pendingStartups, setPendingStartups] = useState([]);
  const [selectedPendingStartup, setSelectedPendingStartup] = useState(null);
  const [pendingStartupModalOpen, setPendingStartupModalOpen] = useState(false);

  // Add state for event modal (sidebar version)
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', start_time: '', end_time: '', location: '', rsvp_link: '', description: '' });
  
  // Add state for editing events
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Add comprehensive startup management state
  const [selectedStartupIds, setSelectedStartupIds] = useState([]);
  const [showActionDropdown, setShowActionDropdown] = useState(null);
  const [editingStartup, setEditingStartup] = useState(null);
  const [showEditStartupModal, setShowEditStartupModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [startupToDelete, setStartupToDelete] = useState(null);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [startupActionNotification, setStartupActionNotification] = useState(null);

  // Add state for event deletion confirmation
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Add comprehensive user management state
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showUserActionDropdown, setShowUserActionDropdown] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserConfirmModal, setShowDeleteUserConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showBulkUserActionModal, setShowBulkUserActionModal] = useState(false);
  const [bulkUserAction, setBulkUserAction] = useState('');
  const [userActionNotification, setUserActionNotification] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [userTab, setUserTab] = useState('active'); // 'active', 'suspended', 'pending'

  // Dashboard analytics state
  const [dashboardStats, setDashboardStats] = useState({
    total_users: 0,
    total_startups: 0,
    total_entrepreneurs: 0,
    total_investors: 0,
    total_upcoming_events: 0
  });

  const roleLabels = {
    admin: 'Admin',
    entrepreneur: 'Entrepreneur',
    investor: 'Investor',
  };

  // Add state for editing ticket
  const [editingTicket, setEditingTicket] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  // Add at the top of AdminDashboard function, after other useState hooks
  const [reportType, setReportType] = useState('startups');
  const [industryFilter, setIndustryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [roleFilterReport, setRoleFilterReport] = useState('');
  const [startupTab, setStartupTab] = useState('approved'); // 'approved' or 'pending'
  const filteredStartups = startups.filter(s =>
    (!industryFilter || s.industry === industryFilter) &&
    (!locationFilter || s.location === locationFilter)
  );
  // Helper function to calculate user status counts
  const getUserStatusCounts = () => {
    const counts = { active: 0, pending: 0, suspended: 0 };
    users.forEach(u => {
      const isVerified = u.is_verified === true || u.is_verified === 1 || u.verification_status === 'verified';
      const isSuspended = u.is_suspended === true || u.is_suspended === 1;
      const userStatus = isSuspended ? 'suspended' : (isVerified ? 'active' : 'pending');
      counts[userStatus]++;
    });
    return counts;
  };

  // Helper function to calculate startup status counts
  const getStartupStatusCounts = () => {
    const counts = { approved: 0, pending: 0, suspended: 0 };
    startups.forEach(s => {
      if (s.approval_status && counts.hasOwnProperty(s.approval_status)) {
        counts[s.approval_status]++;
      }
    });
    return counts;
  };

  const userStatusCounts = getUserStatusCounts();
  const startupStatusCounts = getStartupStatusCounts();

  const filteredUsers = users.filter(u => {
    // Search query filter
    const matchesSearch = !searchQuery || 
      (u.first_name && u.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.last_name && u.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Role filter
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    // User status filter for tabs
    // Handle both boolean and integer values for is_verified and is_suspended
    const isVerified = u.is_verified === true || u.is_verified === 1 || u.verification_status === 'verified';
    const isSuspended = u.is_suspended === true || u.is_suspended === 1;
    const userStatus = isSuspended ? 'suspended' : (isVerified ? 'active' : 'pending');
    const matchesUserTab = userTab === userStatus;
    
    // Report filters (for site performance)
    const matchesReportRole = !roleFilterReport || u.role === roleFilterReport;
    const matchesLocation = !locationFilter || u.location === locationFilter;
    const matchesIndustry = !industryFilter || u.industry === industryFilter;
    
    // For users tab, use search, role, and user tab filters
    if (activeTab === 'users') {
      return matchesSearch && matchesRole && matchesUserTab;
    }
    
    // For site performance tab, use report filters
    return matchesReportRole && matchesLocation && matchesIndustry;
  });
  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${filename}.xlsx`);
  };
  const exportToPDF = (data, columns, filename) => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns],
      body: data.map(row => columns.map(col => row[col] || '')),
    });
    doc.save(`${filename}.pdf`);
  };

  // Handle user edit
  const handleEditUser = (user) => {
    // TODO: Implement user edit functionality
    console.log('Edit user:', user);
  };

  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Update body class and localStorage on darkMode change
  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('admin-dashboard-dark-mode', darkMode);
  }, [darkMode]);

  // Helper to get events for a specific date
  const getEventsForDate = (dateStr) => events.filter(e => {
    if (!e.event_date) return false;
    const eventDate = new Date(e.event_date);
    return eventDate.toISOString().split('T')[0] === dateStr;
  });

  // Calendar rendering helpers      // Revised getMonthMatrix to align Sunday as 0, Monday as 1, ... Saturday as 6
  const getMonthMatrix = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const matrix = [];
    let week = [];
    let dayOfWeek = firstDay.getDay(); // Sunday = 0, Monday = 1, ...
    for (let i = 0; i < dayOfWeek; i++) week.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      week.push(new Date(year, month, d));
      if (week.length === 7) {
        matrix.push(week);
        week = [];
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null);
      matrix.push(week);
    }
    return matrix;
  };


  // Calendar navigation with animation
  const prevMonth = () => {
    setCalendarAnim('slide-right');
    setTimeout(() => {
      setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
      setCalendarAnim('');
    }, 250);
  };
  const nextMonth = () => {
    setCalendarAnim('slide-left');
    setTimeout(() => {
      setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
      setCalendarAnim('fadeIn'); // Add fadeIn after slide
      setTimeout(() => setCalendarAnim(''), 300); // Remove animation after fadeIn
    }, 250);
  };

  // Add/Edit event modal logic
  const handleEventSave = async (event) => {
    try {
      // Save to backend
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
      if (!res.ok) throw new Error('Failed to create event');
      const savedEvent = await res.json();
      setEvents([...events, savedEvent]);
      setEventModal({ open: false, event: null, date: null });
      setEventFiles([]);
    } catch (error) {
      setEventNotification({ type: 'error', message: error.message });
    }
  };

  // When opening modal for edit, set preview
  React.useEffect(() => {
    if (eventModal.open && eventModal.event?.image) {
      setEventImagePreview(eventModal.event.image);
    } else if (!eventModal.open) {
      setEventImagePreview(null);
    }
  }, [eventModal]);
  // When opening modal for edit, set preview
  React.useEffect(() => {
    if (eventModal.open && eventModal.event?.location) {
      fetchCoords(eventModal.event.location);
    } else if (!eventModal.open) {
      setMapCoords(null);
      setMapError('');
      setMapLoading(false);
    }
  }, [eventModal]);

  // Geocode the location to coordinates using OpenStreetMap Nominatim
  async function fetchCoords(location) {
    if (!location) return;
    setMapLoading(true);
    setMapError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setMapCoords({ lat: data[0].lat, lon: data[0].lon });
        setMapError('');
      } else {
        setMapCoords(null);
        setMapError('Location not found. Please enter a more specific address.');
      }
    } catch {
      setMapCoords(null);
      setMapError('Error fetching location. Please try again.');
    }
    setMapLoading(false);
  }

  // Add event deletion logic
  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteEventModal(true);
  };

  // Actual delete function after confirmation
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${eventToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete event');

      // Remove from local state
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      
      // Close modal and reset state
      setShowDeleteEventModal(false);
      setEventToDelete(null);
      
      // Show success notification
      setEventNotification({ type: 'success', message: 'Event deleted successfully!' });
      setTimeout(() => setEventNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting event:', error);
      setEventNotification({ type: 'error', message: error.message });
      setTimeout(() => setEventNotification(null), 3000);
    }
  };

  // Fetch suggestions as user types
  const handleLocationInput = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    setShowSuggestions(true);
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    locationDebounceRef.current = setTimeout(async () => {
      if (value.length < 2) {
        setLocationSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setLocationSuggestions(data);
      } catch {
        setLocationSuggestions([]);
      }
    }, 350);
  };

  // When a suggestion is selected
  const handleSuggestionSelect = (suggestion) => {
    setLocationQuery(suggestion.display_name);
    setShowSuggestions(false);
    setLocationSuggestions([]);
    fetchCoords(suggestion.display_name);
  };

  // Fetch startups
  const fetchStartups = async () => {
    setStartupLoading(true);
    setStartupError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/startups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch startups');
      const data = await res.json();
      setStartups(data);
      setPendingStartups(data.filter(s => s.approval_status === 'pending'));
    } catch (error) {
      setStartupError(error.message);
    } finally {
      setStartupLoading(false);
    }
  };

  // Fetch startups when startup tab is active
  useEffect(() => {
    if (activeTab === 'startup') {
      fetchStartups();
    }
  }, [activeTab]);

  // Accept/Decline handlers
  async function handleAcceptStartup(id) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/startups/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approval_comment: 'Approved by admin' })
      });

      if (!res.ok) throw new Error('Failed to approve startup');

      // Refresh startups list after approval
      fetchStartups();
    } catch (error) {
      console.error('Error approving startup:', error);
      setStartupError(error.message);
    }
  }

  async function handleDeclineStartup(id) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/startups/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approval_comment: 'Rejected by admin' })
      });

      if (!res.ok) throw new Error('Failed to reject startup');

      // Refresh startups list after rejection
      fetchStartups();
    } catch (error) {
      console.error('Error rejecting startup:', error);
      setStartupError(error.message);
    }
  }

  // Render startup status badge
  const renderStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      suspended: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Handle event edit
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsEditMode(true);
    
    // Parse the event date and time
    const eventDate = event.event_date ? new Date(event.event_date) : null;
    const dateStr = eventDate ? eventDate.toISOString().split('T')[0] : '';
    
    // Populate the form with existing event data
    setNewEvent({
      title: event.title || '',
      date: dateStr,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location: event.location || '',
      rsvp_link: event.rsvp_link || '',
      description: event.description || '',
      status: event.status || 'upcoming',
      tags: event.tags || ''
    });
    
    setShowEventModal(true);
  };

  // Note: Verification requests are now handled through the users tab interface

  // Handler for opening modal
  const handleOpenModal = async (docId) => {
    setModalError('');
    setModalActionLoading(false);
    setRejectionReason('');
    setModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/verification/document/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch document details');
      const data = await res.json();
      setSelectedRequest(data);
    } catch (e) {
      setModalError(e.message);
      setSelectedRequest(null);
    }
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
    setModalError('');
  };

  // Approve
  const handleApprove = async () => {
    setModalActionLoading(true);
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/verification/document/${selectedRequest.document_id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to approve document');
      handleCloseModal();
      fetchUsers(); // Refresh users to update verification status
    } catch (e) {
      setModalError(e.message);
    } finally {
      setModalActionLoading(false);
    }
  };
  // Not Approve
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setModalError('Rejection reason is required');
      return;
    }
    setModalActionLoading(true);
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/verification/document/${selectedRequest.document_id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: rejectionReason })
      });
      if (!res.ok) throw new Error('Failed to reject document');
      handleCloseModal();
      fetchUsers(); // Refresh users to update verification status
    } catch (e) {
      setModalError(e.message);
    } finally {
      setModalActionLoading(false);
    }
  };

  // Handler for opening pending startup modal
  const handleOpenPendingStartupModal = (startup) => {
    setSelectedPendingStartup(startup);
    setPendingStartupModalOpen(true);
  };
  const handleClosePendingStartupModal = () => {
    setSelectedPendingStartup(null);
    setPendingStartupModalOpen(false);
  };

  // Add a helper function for formatting startup stage
  const formatStartupStage = (stage) => {
    if (!stage) return '';
    const map = {
      mvp: 'MVP',
      ideation: 'Ideation',
      validation: 'Validation',
      growth: 'Growth',
      maturity: 'Maturity',
    };
    return map[stage] || stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  // Helper function to convert text to title case
  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Add event handler for sidebar modal
  const handleSidebarEventSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const event_date = newEvent.date + (newEvent.start_time ? `T${newEvent.start_time}` : '');
      
      if (isEditMode && editingEvent) {
        // Update existing event
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newEvent.title,
            event_date,
            location: newEvent.location,
            status: newEvent.status || 'upcoming',
            rsvp_link: newEvent.rsvp_link,
            start_time: newEvent.start_time,
            end_time: newEvent.end_time,
            description: newEvent.description,
            tags: newEvent.tags
          })
        });
        if (!res.ok) throw new Error('Failed to update event');
        const updatedEvent = await res.json();
        
        // Update the events list
        setEvents(events.map(event => 
          event.id === editingEvent.id ? updatedEvent : event
        ));
        
        setEventNotification({ type: 'success', message: 'Event updated successfully!' });
        setTimeout(() => setEventNotification(null), 3000); // Auto-dismiss after 3 seconds
      } else {
        // Create new event
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newEvent.title,
            event_date,
            location: newEvent.location,
            status: newEvent.status || 'upcoming',
            rsvp_link: newEvent.rsvp_link,
            start_time: newEvent.start_time,
            end_time: newEvent.end_time,
            description: newEvent.description,
            tags: newEvent.tags
          })
        });
        if (!res.ok) throw new Error('Failed to create event');
        const savedEvent = await res.json();
        setEvents([...events, savedEvent]);
        
        setEventNotification({ type: 'success', message: 'Event created successfully!' });
        setTimeout(() => setEventNotification(null), 3000); // Auto-dismiss after 3 seconds
      }
      
      // Reset modal state
      setShowEventModal(false);
      setIsEditMode(false);
      setEditingEvent(null);
      setNewEvent({ title: '', date: '', start_time: '', end_time: '', location: '', rsvp_link: '', description: '', status: 'upcoming', tags: '' });
    } catch (error) {
      setEventNotification({ type: 'error', message: error.message });
    }
  };

  // Function to automatically update event statuses based on date/time
  const updateEventStatuses = async (eventsList = events) => {
    const now = new Date();
    const updatedEvents = [];
    let hasUpdates = false;

    console.log('🕐 Checking event statuses at:', now.toLocaleTimeString());

    for (const event of eventsList) {
      if (!event.event_date) {
        updatedEvents.push(event);
        continue;
      }

      const eventDate = new Date(event.event_date);
      let newStatus = event.status;

      // Check if event is happening today first
      const today = new Date();
      const isToday = eventDate.toDateString() === today.toDateString();
      
      if (isToday) {
        // If event is today, check if it's currently ongoing based on start/end times
        let startTime, endTime;
        
        if (event.start_time && event.end_time) {
          // Use provided start and end times
          const [startHour, startMin] = event.start_time.split(':').map(Number);
          const [endHour, endMin] = event.end_time.split(':').map(Number);
          startTime = startHour * 60 + startMin;
          endTime = endHour * 60 + endMin;
        } else if (event.start_time) {
          // Use start time and assume 2 hour duration
          const [startHour, startMin] = event.start_time.split(':').map(Number);
          startTime = startHour * 60 + startMin;
          endTime = startTime + 120; // 2 hours
        } else {
          // Fallback to event_date time
          const eventTime = eventDate.getHours() * 60 + eventDate.getMinutes();
          startTime = eventTime;
          endTime = eventTime + 120; // 2 hours
        }
        
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        console.log(`📅 Event "${event.title}": Current=${currentTime}min, Start=${startTime}min, End=${endTime}min, Status=${event.status}`);
        
        if (currentTime >= startTime && currentTime <= endTime) {
          // Event is currently happening - mark as ongoing
          if (event.status !== 'ongoing') {
            newStatus = 'ongoing';
            hasUpdates = true;
            console.log(`🔴 CHANGING "${event.title}" to ONGOING (LIVE)`);
          }
        } else if (currentTime > endTime) {
          // Event has ended today - mark as completed
          if (event.status !== 'completed') {
            newStatus = 'completed';
            hasUpdates = true;
            console.log(`✅ CHANGING "${event.title}" to COMPLETED`);
          }
        } else {
          // Event is today but hasn't started yet - mark as upcoming
          if (event.status !== 'upcoming') {
            newStatus = 'upcoming';
            hasUpdates = true;
            console.log(`⏳ CHANGING "${event.title}" to UPCOMING`);
          }
        }
      } else {
        // Event is not today - check if it's in the future or past
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        if (eventDateOnly < todayOnly) {
          // Event was in the past - mark as completed
          if (event.status !== 'completed') {
            newStatus = 'completed';
            hasUpdates = true;
            console.log(`📅 CHANGING "${event.title}" to COMPLETED (past date)`);
          }
        } else {
          // Event is in the future - mark as upcoming
          if (event.status !== 'upcoming') {
            newStatus = 'upcoming';
            hasUpdates = true;
            console.log(`📅 CHANGING "${event.title}" to UPCOMING (future date)`);
          }
        }
      }

      // If status changed, update the event in backend
      if (newStatus !== event.status) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/events/${event.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...event,
              status: newStatus
            })
          });
          if (res.ok) {
            updatedEvents.push({ ...event, status: newStatus });
          } else {
            updatedEvents.push(event);
          }
        } catch (error) {
          console.error('Error updating event status:', error);
          updatedEvents.push(event);
        }
      } else {
        updatedEvents.push(event);
      }
    }

    // Update local state if there were changes
    if (hasUpdates) {
      setEvents(updatedEvents);
      console.log('🔄 Updated events with new statuses');
    } else {
      console.log('✨ No status changes needed');
    }

    return updatedEvents;
  };

  // Add fetchEvents function
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      
      // Automatically update event statuses after fetching
      const updatedEvents = await updateEventStatuses(data);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEventNotification({ type: 'error', message: error.message });
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch events when Events tab is active
  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    }
  }, [activeTab]);

  // Fetch dashboard analytics
  const fetchDashboardStats = () => {
    fetch('http://localhost/Taraki(2025)/KapitalxTaraki/src/api/get_stats.php')
      .then(response => response.json())
      .then(data => {
        if (!data.error) {
          // Calculate upcoming events from events state
          const upcomingEventsCount = Array.isArray(events)
            ? events.filter(e => {
                if (!e.event_date) return false;
                // Prioritize status if available, otherwise use date
                if (e.status) {
                  return e.status === 'upcoming' || e.status === 'ongoing';
                }
                // Fallback to date-based filtering
                const eventDate = new Date(e.event_date);
                const now = new Date();
                return eventDate >= now;
              }).length
            : 0;
          
          // Use backend count if available, otherwise use calculated count
          setDashboardStats({
              ...data,
            total_upcoming_events: typeof data.total_upcoming_events !== 'undefined' 
              ? data.total_upcoming_events 
              : upcomingEventsCount
          });
        }
      })
      .catch(error => console.error('Error fetching dashboard stats:', error));
  };

  // Update upcoming events count if events change
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
      // Also fetch events if not already loaded
      if (events.length === 0) {
        fetchEvents();
      }
    }
  }, [activeTab]);

  // Update dashboard stats when events change
  useEffect(() => {
    if (activeTab === 'dashboard' && events.length > 0) {
      fetchDashboardStats();
    }
  }, [events, activeTab]);

  // Periodic status updates - check every minute for more real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (events.length > 0) {
        updateEventStatuses();
      }
    }, 1 * 60 * 1000); // 1 minute instead of 5 minutes

    return () => clearInterval(interval);
  }, [events]);

  // Additional real-time checks for events starting/ending soon
  useEffect(() => {
    const checkUpcomingTransitions = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Find events that might transition in the next few minutes
      const eventsNeedingChecks = events.filter(event => {
        if (!event.event_date || !event.start_time) return false;
        
        const eventDate = new Date(event.event_date);
        const isToday = eventDate.toDateString() === now.toDateString();
        
        if (!isToday) return false;
        
        const [startHour, startMin] = event.start_time.split(':').map(Number);
        const eventStartMinutes = startHour * 60 + startMin;
        
        // Check if event starts within the next 2 minutes or just started
        const timeDiff = eventStartMinutes - currentMinutes;
        return timeDiff >= -2 && timeDiff <= 2;
      });
      
      if (eventsNeedingChecks.length > 0) {
        updateEventStatuses();
      }
    };
    
    // Check every 30 seconds for events that are about to start or just started
    const frequentInterval = setInterval(checkUpcomingTransitions, 30 * 1000);
    
    return () => clearInterval(frequentInterval);
  }, [events]);

  // Update event statuses when dashboard becomes active
  useEffect(() => {
    if (activeTab === 'dashboard' && events.length > 0) {
      updateEventStatuses();
    }
  }, [activeTab]);

  // Fetch startups and users when Site Performance tab is active
  useEffect(() => {
    if (activeTab === 'sitePerformance') {
      if (startups.length === 0) fetchStartups();
      if (users.length === 0) fetchUsers();
    }
  }, [activeTab]);

  // Compute unique industries and locations
  const allIndustries = [
    ...new Set([
      ...startups.map(s => s.industry).filter(Boolean),
      ...users.map(u => u.industry).filter(Boolean)
    ])
  ];
  const allLocations = [
    ...new Set([
      ...startups.map(s => s.location).filter(Boolean),
      ...users.map(u => u.location).filter(Boolean)
    ])
  ];

  // Main content for each tab
  const renderContent = () => {
    return (
      <>
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              // Show upcoming events from the events state (created by admin)
              const upcomingEvents = events
                .filter(e => {
                  if (!e.event_date) return false;
                  // Prioritize status if available, otherwise use date
                  if (e.status) {
                    return e.status === 'upcoming' || e.status === 'ongoing';
                  }
                  // Fallback to date-based filtering
                  const eventDate = new Date(e.event_date);
                  const now = new Date();
                  return eventDate >= now;
                })
                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                .slice(0, 3); // Show next 3 upcoming events
              return (
                <div className="flex flex-col gap-6 w-full">
                  {/* Topbar (removed search, notification, and messages icons) */}
                  <div className="mb-6"></div>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-700 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Active Investors</span>
                      <span className='text-3xl font-bold mt-2 text-black dark:text-white'>{dashboardStats.total_investors}</span>
                      <span className={`text-xs rounded px-2 py-1 mt-2 ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}></span>
                    </div>
                    <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-700 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Active Startups</span>
                      <span className='text-3xl font-bold mt  text-black dark:text-white'>{dashboardStats.total_startups}</span>
                      <span className={`text-xs rounded px-2 py-1 mt-2 ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}></span>
                    </div>
                    <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-700 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Active Entrepreneurs</span>
                      <span className='text-3xl font-bold mt-2  text-black dark:text-white'>{dashboardStats.total_entrepreneurs}</span>
                      <span className={`text-xs rounded px-2 py-1 mt-2 ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}></span>
                    </div>
                    <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-700 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Upcoming Events</span>
                      <span className='text-3xl font-bold mt-2 text-black dark:text-white'>{dashboardStats.total_upcoming_events}</span>
                      <div className="mt-2 w-full">
                        {eventsLoading && <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading events...</span>}
                        {!eventsLoading && dashboardStats.total_upcoming_events === 0 && <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming events.</span>}
                        {upcomingEvents.map((event, idx) => {
                          const eventDate = new Date(event.event_date);
                          const formattedDate = eventDate.toLocaleDateString();
                          
                          // Format time range
                          let formattedTime = '';
                          if (event.start_time && event.end_time) {
                            // Convert 24-hour to 12-hour format for display
                            const formatTime = (timeStr) => {
                              const [hours, minutes] = timeStr.split(':');
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                              return `${displayHour}:${minutes} ${ampm}`;
                            };
                            formattedTime = `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`;
                          } else if (event.start_time) {
                            const formatTime = (timeStr) => {
                              const [hours, minutes] = timeStr.split(':');
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                              return `${displayHour}:${minutes} ${ampm}`;
                            };
                            formattedTime = formatTime(event.start_time);
                          } else if (eventDate.getHours() !== 0 || eventDate.getMinutes() !== 0) {
                            formattedTime = eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                          }
                          
                          return (
                            <div key={event.id || idx} className={`flex flex-col mb-2 p-2 rounded border ${darkMode ? 'bg-[#181818] border-orange-900/30' : 'bg-orange-50 border-orange-200'}`}>
                            <span className={`text-xs font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>{event.title}</span>
                              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formattedDate} {formattedTime && `• ${formattedTime}`}
                              </span>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{event.location}</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {event.tags && event.tags.split(',').map((tag, tagIdx) => (
                                  <span key={tagIdx} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${darkMode ? 'bg-[#232323] border-orange-700 text-orange-300' : 'bg-orange-100 border-orange-300 text-orange-700'}`}>
                                    {tag.trim()}
                                  </span>
                                ))}
                                {event.status && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                    event.status === 'ongoing' 
                                      ? (darkMode ? 'bg-green-900 border-green-700 text-green-300' : 'bg-green-100 border-green-300 text-green-700')
                                      : event.status === 'completed'
                                      ? (darkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700')
                                      : (darkMode ? 'bg-[#232323] border-orange-700 text-orange-300' : 'bg-orange-100 border-orange-300 text-orange-700')
                                  }`}>
                                    {event.status === 'ongoing' ? '🔴 LIVE' : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                  </span>
                              )}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                      <button
                        className={`mt-2 px-3 py-1 rounded text-xs font-semibold transition ${darkMode ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                        onClick={() => setActiveTab('events')}
                      >+ Create Event</button>
                    </div>
                  </div>
                  {/* Chart Placeholder */}
                  <div className={`rounded-xl shadow p-6 mt-4 min-h-[300px] flex flex-col border-t-4 border-orange-700 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                    <span className={`font-semibold text-lg mb-2 text-center ${darkMode ? 'text-white' : 'text-orange-700'}`}>Website Traffic</span>
                    <div className={`flex-1 flex items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>Chart coming soon...</span>
                    </div>
                  </div>
                </div>
              );
            case 'events':
              // Calendar UI and event list
              const monthMatrix = getMonthMatrix(calendarDate);
              const monthName = calendarDate.toLocaleString('default', { month: 'long' });
              return (
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  {/* Event Notification */}
                  {eventNotification && (
                    <div className={`fixed top-24 right-8 z-50 p-4 rounded-lg shadow-lg animate-fadeIn ${
                      eventNotification.type === 'success' 
                        ? 'bg-green-100 border border-green-300 text-green-800' 
                        : 'bg-red-100 border border-red-300 text-red-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>{eventNotification.message}</span>
                        <button 
                          className="ml-4 text-lg font-semibold hover:opacity-70"
                          onClick={() => setEventNotification(null)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Calendar Section */}
                  <div className="flex-1 min-w-0">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-orange-700">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={prevMonth}
                          className="p-2 hover:bg-orange-100 rounded-lg transition"
                        >
                          <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl md:text-2xl font-semibold text-orange-700">{monthName} {calendarDate.getFullYear()}</h2>
                        <button
                          onClick={nextMonth}
                          className="p-2 hover:bg-orange-100 rounded-lg transition"
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {/* Calendar Grid */}
                    <div className="overflow-x-auto">
                      <div className="grid grid-cols-7 gap-2 min-w-[420px]">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                          <div key={day} className="text-center font-medium text-orange-700 py-2 text-xs md:text-base">
                            {day}
                          </div>
                        ))}
                        {monthMatrix.map((row, i) => (
                          <React.Fragment key={i}>
                            {row.map((day, j) => (
                              <div
                                key={`${i}-${j}`}
                                className={`aspect-square p-2 border border-orange-100 rounded-lg ${
                                  day && day.getMonth() === calendarDate.getMonth() ? 'bg-white' : 'bg-orange-50'
                                }`}
                              >
                                <div className="flex flex-col h-full">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs md:text-sm ${day && day.getMonth() === calendarDate.getMonth() ? 'text-orange-700' : 'text-gray-400'}`}>{day ? day.getDate() : ''}</span>
                                  </div>
                                  <div className="flex-1 flex flex-col gap-1 mt-1 justiffy-end items-center">
                                    {day && getEventsForDate(day.toISOString().split('T')[0]).length > 0 && (
                                      <span className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white mt-2 block"></span>
                                    )}
                                    {day && getEventsForDate(day.toISOString().split('T')[0]).map(event => (
                                      <div
                                        key={event.id}
                                        className="text-xs p-1 rounded bg-orange-100 text-orange-800 truncate cursor-pointer hover:bg-orange-200 transition"
                                        onClick={() => handleEditEvent(event)}
                                      >
                                        {event.title}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Events Sidebar */}
                  <div className="w-full md:w-96 mt-4 md:mt-0">
                    <div className="bg-white dark:bg-[#232323] border border-orange-100 dark:border-orange-700 rounded-2xl shadow-xl flex flex-col max-h-[700px]">
                      <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-orange-100">
                        <span className="text-orange-700 text-lg md:text-xl font-semibold">Events</span>
                        <button
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 flex items-center justify-center"
                          onClick={() => setShowEventModal(true)}
                          title="Add Event"
                        >
                          <FiPlus size={22} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
                        {events.length === 0 ? (
                          <div className="text-gray-400 text-center mt-8">No events yet.</div>
                        ) : (
                          events.map(event => (
                            <div key={event.id} className="bg-orange-50 dark:bg-[#2a2a2a] rounded-lg p-4 mb-4 flex flex-col gap-1 border border-orange-100 dark:border-orange-700">
                              <div className="flex items-center justify-between">
                                <span className="text-orange-700 dark:text-orange-400 font-semibold">{event.title}</span>
                                <div className="flex items-center gap-2">
                                  <button 
                                    className="text-orange-400 hover:text-orange-600 transition" 
                                    onClick={() => handleEditEvent(event)} 
                                    title="Edit Event"
                                  >
                                    <FiEdit2 size={16} />
                                  </button>
                                  <button 
                                    className="text-red-400 hover:text-red-600 transition" 
                                    onClick={() => handleDeleteEvent(event)} 
                                    title="Delete Event"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-300">{event.event_date ? new Date(event.event_date).toLocaleString() : ''}</span>
                              {event.location && <span className="text-xs text-gray-500 dark:text-gray-300">{event.location}</span>}
                              {event.rsvp_link && <a href={event.rsvp_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">RSVP</a>}
                              {event.tags && (
                                <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">{event.tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, idx) => (
                                  <span key={idx} className="inline-block bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-300 rounded-full px-2 py-0.5 mr-1">{tag}</span>
                                ))}</span>
                              )}
                              {event.description && <span className="text-xs text-gray-600 dark:text-gray-400">{event.description}</span>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    {/* Add Event Modal */}
                    {showEventModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md animate-fadeIn relative">
                                                      <button className="absolute top-2 right-2 text-2xl text-orange-500 hover:text-orange-700" onClick={() => {
                              setShowEventModal(false);
                              setIsEditMode(false);
                              setEditingEvent(null);
                              setNewEvent({ title: '', date: '', start_time: '', end_time: '', location: '', rsvp_link: '', description: '', status: 'upcoming', tags: '' });
                            }}>&times;</button>
                          <h2 className="text-xl font-bold mb-4 text-orange-700">{isEditMode ? 'Edit Event' : 'Create Event'}</h2>
                          <div className="flex flex-col gap-4">
                            <input
                              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                              type="text"
                              placeholder="Event name"
                              value={newEvent.title}
                              onChange={e => setNewEvent(ev => ({ ...ev, title: e.target.value }))}
                            />
                            <input
                              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                              type="date"
                              value={newEvent.date}
                              onChange={e => setNewEvent(ev => ({ ...ev, date: e.target.value }))}
                            />
                            <div className="flex gap-2">
                              <input
                                className="w-1/2 p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                                type="time"
                                placeholder="Start time"
                                value={newEvent.start_time}
                                onChange={e => setNewEvent(ev => ({ ...ev, start_time: e.target.value }))}
                              />
                              <input
                                className="w-1/2 p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                                type="time"
                                placeholder="End time"
                                value={newEvent.end_time}
                                onChange={e => setNewEvent(ev => ({ ...ev, end_time: e.target.value }))}
                              />
                            </div>
                            <input
                              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                              type="text"
                              placeholder="Location"
                              value={newEvent.location}
                              onChange={e => setNewEvent(ev => ({ ...ev, location: e.target.value }))}
                            />
                            <input
                              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                              type="text"
                              placeholder="RSVP Link (optional)"
                              value={newEvent.rsvp_link || ''}
                              onChange={e => setNewEvent(ev => ({ ...ev, rsvp_link: e.target.value }))}
                            />
                            <select
                              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                              value={newEvent.status || 'upcoming'}
                              onChange={e => setNewEvent(ev => ({ ...ev, status: e.target.value }))}
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="completed">Completed</option>
                            </select>
                            <input
                              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                              type="text"
                              placeholder="Tags (comma separated, e.g. workshop,networking)"
                              value={newEvent.tags || ''}
                              onChange={e => setNewEvent(ev => ({ ...ev, tags: e.target.value }))}
                            />
                            <textarea
                              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                              placeholder="Description (optional)"
                              value={newEvent.description || ''}
                              onChange={e => setNewEvent(ev => ({ ...ev, description: e.target.value }))}
                            />
                            <div className="flex gap-2 mt-4">
                              <button
                                className="flex-1 bg-gray-200 text-orange-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                onClick={() => {
                                  setShowEventModal(false);
                                  setIsEditMode(false);
                                  setEditingEvent(null);
                                  setNewEvent({ title: '', date: '', start_time: '', end_time: '', location: '', rsvp_link: '', description: '', status: 'upcoming', tags: '' });
                                }}
                              >Cancel</button>
                              <button
                                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
                                onClick={handleSidebarEventSave}
                                disabled={!newEvent.title || !newEvent.date}
                              >{isEditMode ? 'Update Event' : 'Create Event'}</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            case 'users':
              return (
                <div className={`flex flex-col gap-6 w-full border border-orange-100 dark:border-orange-700 rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-[#232323]' : 'bg-white'}`}> 
                  {/* User Action Notification */}
                  {userActionNotification && (
                    <div className={`fixed top-24 right-8 z-50 p-4 rounded-lg shadow-lg animate-fadeIn ${
                      userActionNotification.type === 'success' 
                        ? 'bg-green-100 border border-green-300 text-green-800' 
                        : 'bg-red-100 border border-red-300 text-red-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>{userActionNotification.message}</span>
                        <button 
                          className="ml-4 text-lg font-semibold hover:opacity-70"
                          onClick={() => setUserActionNotification(null)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  <h1 className='text-3xl font-bold mb-6 text-black dark:text-white'>User Management</h1>
                  
                  {/* Tab Buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-2 ${userTab === 'active' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setUserTab('active');
                        setSelectedUserIds([]);
                      }}
                    >
                      Active
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${userTab === 'active' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {userStatusCounts.active}
                      </span>
                    </button>
                    <button
                      className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-2 ${userTab === 'pending' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setUserTab('pending');
                        setSelectedUserIds([]);
                      }}
                    >
                      Pending
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${userTab === 'pending' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {userStatusCounts.pending}
                      </span>
                    </button>
                    <button
                      className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-2 ${userTab === 'suspended' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setUserTab('suspended');
                        setSelectedUserIds([]);
                      }}
                    >
                      Suspended
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${userTab === 'suspended' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {userStatusCounts.suspended}
                      </span>
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                      <input
                        type="text"
                      placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-lg px-4 py-2 w-full md:w-1/2 focus:outline-none border placeholder-gray-400 
                      bg-white text-black border-orange-300 
                     dark:bg-[#1b1b1b] dark:text-white dark:border-orange-700"
                      />
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-lg px-4 py-2 focus:outline-none border 
                       bg-white text-black border-orange-300 
                       dark:bg-[#1b1b1b] dark:text-white dark:border-orange-700"
                        >
                        <option value="all">All Roles</option>
                        <option value="admin">Administrator</option>
                        <option value="entrepreneur">Entrepreneur</option>
                        <option value="investor">Investor</option>
                      </select>
                    </div>

                  {/* Bulk Actions */}
                  {selectedUserIds.length > 0 && (
                    <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                      <span className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                        {selectedUserIds.length} user(s) selected
                      </span>
                      <button
                        onClick={() => setShowBulkUserActionModal(true)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
                      >
                        Bulk Actions
                      </button>
                      <button
                        onClick={() => setSelectedUserIds([])}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}

                  {/* Table */}
                  <div className="bg-white dark:bg-[#1b1b1b] p-4 md:p-8 rounded-xl border border-orange-100 dark:border-orange-700 shadow-sm w-full">
                    {loading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : error ? (
                      <div className="text-red-500 text-center">{error}</div>
                    ) : (
                      <div className="overflow-x-auto w-full rounded-lg">
                        <table className="min-w-full w-full min-w-[900px] table-fixed divide-y divide-orange-100">
                          <thead>
                            <tr className="bg-orange-100">
                              <th className="px-4 py-3 font-semibold w-[50px]">
                                <input
                                  type="checkbox"
                                  checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                                  onChange={(e) => handleSelectAllUsers(e.target.checked)}
                                  className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                />
                              </th>
                              <th className="px-4 py-3 font-semibold w-[200px]">Name</th>
                              <th className="px-4 py-3 font-semibold w-[200px]">Email</th>
                              <th className="px-4 py-3 font-semibold w-[120px]">Role</th>
                              <th className="px-4 py-3 font-semibold w-[120px]">Location</th>
                              <th className="px-4 py-3 font-semibold w-[100px]">Status</th>
                              <th className="px-4 py-3 font-semibold w-[110px] text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-[#1b1b1b] divide-y divide-orange-100">
                            {filteredUsers.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-lg">
                                  No {userTab} users found.
                                </td>
                              </tr>
                            ) : (
                              filteredUsers.map((user) => (
                                <tr
                                  key={user.id}
                                  className="group border-b border-orange-100 hover:bg-orange-50 dark:hover:bg-white transition cursor-pointer"
                                  onClick={() => { setSelectedUserModal(user); setShowUserDetailsModal(true); }}
                                >
                                  {/* Checkbox */}
                                  <td className="px-4 py-3 w-[50px]" onClick={e => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={selectedUserIds.includes(user.id)}
                                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                      className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                    />
                                  </td>
                                  
                                  {/* Name */}
                                  <td className="px-4 py-3 w-[200px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">
                          {(user.first_name && user.last_name && `${user.first_name} ${user.last_name}`) ||
                          user.full_name || user.email}
                                    </div>
                          </td>
                                  
                                  {/* Email */}
                                  <td className="px-4 py-3 w-[200px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{user.email}</div>
                          </td>
                                  
                                  {/* Role */}
                                  <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">
                          {roleLabels[user.role] || user.role}
                                    </div>
                          </td>
                                  
                                  {/* Location */}
                                  <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{user.location || 'N/A'}</div>
                            </td>
                                  
                                  {/* Status */}
                                  <td className="px-4 py-3 w-[100px] truncate overflow-hidden whitespace-nowrap">
                                    {renderUserStatusBadge(user)}
                                  </td>
                                  
                                  {/* Actions */}
                                  <td className="px-4 py-3 w-[110px] text-center" onClick={e => e.stopPropagation()}>
                                    {renderUserActionDropdown(user)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            case 'analytics':
              return (
                <div className="bg-[#232323] rounded-xl shadow p-6 w-full min-h-[300px] flex flex-col">
                  <span className="font-semibold text-lg mb-2">Analytics</span>
                </div>
              );
            case 'settings':
              return (
                <div className="bg-[#232323] rounded-xl shadow p-6 w-full min-h-[300px] flex flex-col gap-4">
                  <span className="font-semibold text-lg mb-2">Settings</span>
                </div>
              );
case 'sitePerformance':
  return (
    <div className={`flex flex-col gap-6 w-full border-2 border-orange-400 dark:border-orange-700 rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-[#232323]' : 'bg-white'}`}> 
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select value={reportType} onChange={e => setReportType(e.target.value)} className="border rounded px-2 py-1">
          <option value="startups">Startups</option>
          <option value="users">Users</option>
        </select>
        <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All Industries</option>
          {allIndustries.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All Locations</option>
          {allLocations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        {reportType === 'users' && (
          <select value={roleFilterReport} onChange={e => setRoleFilterReport(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="investor">Investor</option>
          </select>
        )}
      </div>

      {/* Export Buttons */}
      <div className="flex gap-2 mb-4">
        <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600" onClick={() => {
          const data = reportType === 'startups' ? filteredStartups : filteredUsers;
          exportToExcel(data, `${reportType}-report`);
        }}>Export to Excel</button>

        <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600" onClick={() => {
          const data = reportType === 'startups' ? filteredStartups : filteredUsers;
          const columns = reportType === 'startups'
            ? ['startup_id', 'name', 'industry', 'location', 'description']
            : ['id', 'first_name', 'last_name', 'email', 'role', 'industry', 'location'];
          exportToPDF(data, columns, `${reportType}-report`);
        }}>Export to PDF</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full w-full min-w-[720px] table-fixed divide-y divide-orange-100">
          <thead>
            <tr className="bg-orange-100">
              <th className="px-4 py-3 font-semibold w-[180px]">Name</th>
              <th className="px-4 py-3 font-semibold w-[180px]">Industry</th>
              <th className="px-4 py-3 font-semibold w-[120px]">Founder</th>
              <th className="px-4 py-3 font-semibold w-[120px]">Location</th>
              <th className="px-4 py-3 font-semibold w-[120px] text-center">Stage</th>
              <th className="px-4 py-3 font-semibold w-[100px]">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#1b1b1b] divide-y divide-orange-100">
            {(reportType === 'startups' ? filteredStartups : filteredUsers).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-lg">
                  No results found.
                </td>
              </tr>
            ) : (
              (reportType === 'startups' ? filteredStartups : filteredUsers).map(item => (
                <tr key={item.startup_id || item.id} className="group border-b border-orange-100 hover:bg-orange-50 dark:hover:bg-white transition cursor-pointer">
                  {/* Name */}
                  <td className="px-4 py-3 w-[180px] truncate overflow-hidden whitespace-nowrap">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.name}</div>
                  </td>

                  {/* Industry */}
                  <td className="px-4 py-3 w-[180px] truncate">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.industry}</div>
                  </td>

                  {/* Founder */}
                  <td className="px-4 py-3 w-[120px] truncate">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.entrepreneur_name}</div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 w-[120px] truncate">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.location}</div>
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-3 w-[120px] truncate text-center">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{formatStartupStage(item.startup_stage)}</div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 w-[100px] truncate">
                    {renderStatusBadge(item.approval_status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
            case 'startup':
              return (
                <div className={`flex flex-col gap-6 w-full border border-orange-100 dark:border-orange-700 rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-[#232323]' : 'bg-white'}`}> 
                  {/* Startup Action Notification */}
                  {startupActionNotification && (
                    <div className={`fixed top-24 right-8 z-50 p-4 rounded-lg shadow-lg animate-fadeIn ${
                      startupActionNotification.type === 'success' 
                        ? 'bg-green-100 border border-green-300 text-green-800' 
                        : 'bg-red-100 border border-red-300 text-red-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>{startupActionNotification.message}</span>
                        <button 
                          className="ml-4 text-lg font-semibold hover:opacity-70"
                          onClick={() => setStartupActionNotification(null)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  <h1 className='text-3xl font-bold mb-6 text-black dark:text-white'>Startup Management</h1>
                  
                  {/* Tab Buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-2 ${startupTab === 'approved' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setStartupTab('approved');
                        setSelectedStartupIds([]);
                      }}
                    >
                      Approved
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${startupTab === 'approved' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {startupStatusCounts.approved}
                      </span>
                    </button>
                    <button
                      className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-2 ${startupTab === 'pending' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setStartupTab('pending');
                        setSelectedStartupIds([]);
                      }}
                    >
                      Pending
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${startupTab === 'pending' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {startupStatusCounts.pending}
                      </span>
                    </button>
                    <button
                      className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-2 ${startupTab === 'suspended' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setStartupTab('suspended');
                        setSelectedStartupIds([]);
                      }}
                    >
                      Suspended
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${startupTab === 'suspended' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {startupStatusCounts.suspended}
                      </span>
                    </button>
                  </div>

                  {/* Bulk Actions */}
                  {selectedStartupIds.length > 0 && (
                    <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                      <span className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                        {selectedStartupIds.length} startup(s) selected
                      </span>
                      <button
                        onClick={() => setShowBulkActionModal(true)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
                      >
                        Bulk Actions
                      </button>
                      <button
                        onClick={() => setSelectedStartupIds([])}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                  {/* Table */}
                  <div className="bg-white dark:bg-[#1b1b1b] p-4 md:p-8 rounded-xl border border-orange-100 dark:border-orange-700 shadow-sm w-full">
                    {startupLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : startupError ? (
                      <div className="text-red-500 text-center">{startupError}</div>
                    ) : (
                      <div className="overflow-x-auto w-full rounded-lg">
                        <table className="min-w-full w-full min-w-[930px] table-fixed divide-y divide-orange-100">
                          <thead>
                            <tr className="bg-orange-100">
                              <th className="px-4 py-3 font-semibold w-[50px]">
                                <input
                                  type="checkbox"
                                  checked={selectedStartupIds.length === startups.filter(startup => startup.approval_status === startupTab).length && startups.filter(startup => startup.approval_status === startupTab).length > 0}
                                  onChange={(e) => handleSelectAllStartups(e.target.checked)}
                                  className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                />
                              </th>
                              <th className="px-4 py-3 font-semibold w-[160px]">Name</th>
                              <th className="px-4 py-3 font-semibold w-[160px]">Industry</th>
                              <th className="px-4 py-3 font-semibold w-[120px]">Founder</th>
                              <th className="px-4 py-3 font-semibold w-[120px]">Location</th>
                              <th className="px-4 py-3 font-semibold w-[100px] text-center">Stage</th>
                              <th className="px-4 py-3 font-semibold w-[100px]">Status</th>
                              <th className="px-4 py-3 font-semibold w-[120px] text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-[#1b1b1b] divide-y divide-orange-100">
                            {startups.filter(startup => startup.approval_status === startupTab).length === 0 ? (
                              <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-lg">No {startupTab === 'pending' ? 'pending' : startupTab === 'suspended' ? 'suspended' : 'approved'} startups found.</td>
                              </tr>
                            ) : (
                              startups.filter(startup => startup.approval_status === startupTab).map((startup) => (
                                <tr
                                  key={startup.startup_id}
                                  className="group border-b border-orange-100 hover:bg-orange-50 dark:hover:bg-white transition cursor-pointer"
                                  onClick={() => { setSelectedStartupModal(startup); setStartupModalOpen(true); }}
                                >
                                  {/* Checkbox */}
                                  <td className="px-4 py-3 w-[50px]" onClick={e => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={selectedStartupIds.includes(startup.startup_id)}
                                      onChange={(e) => handleSelectStartup(startup.startup_id, e.target.checked)}
                                      className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                    />
                                  </td>
                                  
                                  {/* Name */}
                                  <td className="px-4 py-3 w-[160px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.name}</div>
                                      <div className="text-sm text-gray-500 md:hidden truncate overflow-hidden whitespace-nowrap">{startup.industry}</div>
                                    </div>
                                  </td>
                                  
                                  {/* Industry */}
                                  <td className="px-4 py-3 w-[160px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.industry}</div>
                                  </td>
                                  
                                  {/* Founder */}
                                  <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.entrepreneur_name}</div>
                                  </td>
                                  
                                  {/* Location */}
                                  <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.location}</div>
                                  </td>
                                  
                                  {/* Stage */}
                                  <td className="px-4 py-3 w-[100px] truncate overflow-hidden whitespace-nowrap text-center">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{formatStartupStage(startup.startup_stage)}</div>
                                  </td>
                                  
                                  {/* Status */}
                                  <td className="px-4 py-3 w-[100px] truncate overflow-hidden whitespace-nowrap">
                                    {renderStatusBadge(startup.approval_status)}
                                  </td>
                                  
                                  {/* Actions */}
                                  <td className="px-4 py-3 w-[120px] text-center" onClick={e => e.stopPropagation()}>
                                    {startupTab === 'pending' ? (
                                      <div className="flex gap-1 justify-center">
                                        <button
                                          onClick={() => handleAcceptStartup(startup.startup_id)}
                                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                          title="Approve"
                                        >
                                          <FiCheck className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeclineStartup(startup.startup_id)}
                                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                          title="Reject"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ) : (
                                      renderStartupActionDropdown(startup)
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            case 'tickets':
              return (
                <div className="flex flex-col gap-6">
                  {activeTab === 'tickets' && (
                    <h1 className='text-3xl font-bold mb-6 text-black dark:text-white'>Support Tickets</h1>
                  )}
                  <div className="bg-white dark:bg-[#232323] p-8 rounded-xl border border-orange-100 dark:border-orange-700 shadow-sm">
                    {ticketsLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : ticketsError ? (
                      <div className="flex-1 flex items-center justify-center text-red-500">{ticketsError}</div>
                    ) : tickets.length === 0 ? (
                      <div className="text-gray-400 text-center mt-8">No tickets found.</div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg">
                        <table className="min-w-full text-left text-sm text-gray-700">
                          <thead>
                            <tr className="bg-orange-100 text-orange-700">
                              <th className="px-4 py-3 font-semibold">ID</th>
                              <th className="px-4 py-3 font-semibold">Title</th>
                              <th className="px-4 py-3 font-semibold">Type</th>
                              <th className="px-4 py-3 font-semibold">Status</th>
                              <th className="px-4 py-3 font-semibold">Submitted By</th>
                              <th className="px-4 py-3 font-semibold">Created At</th>
                              <th className="px-4 py-3 font-semibold">Admin Response</th>
                              <th className="px-4 py-3 font-semibold">Admin Notes</th>
                              <th className="px-4 py-3 font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tickets.map(ticket => (
                              <React.Fragment key={ticket.ticket_id}>
                                <tr className="border-b border-orange-100 text-black dark:text-white hover:bg-orange-50 hover:text-orange-600 transition">
                                  <td className="px-4 py-3">{ticket.ticket_id}</td>
                                  <td className="px-4 py-3">{ticket.title}</td>
                                  <td className="px-4 py-3">{toTitleCase(ticket.type)}</td>
                                  <td className="px-4 py-3">{toTitleCase(ticket.status)}</td>
                                  <td className="px-4 py-3">{ticket.user_id}</td>
                                  <td className="px-4 py-3">{ticket.created_at}</td>
                                  <td className="px-4 py-3">{ticket.admin_response || ''}</td>
                                  <td className="px-4 py-3">{ticket.admin_notes || ''}</td>
                                  <td className="px-4 py-3">
                                    <button
                                      className="px-2 py-1 bg-orange-200 text-orange-800 rounded hover:bg-orange-300"
                                      onClick={() => {
                                        setEditingTicket(ticket.ticket_id);
                                        setAdminResponse(ticket.admin_response || '');
                                        setAdminNotes(ticket.admin_notes || '');
                                        setUpdateMessage('');
                                      }}
                                    >Respond/Note</button>
                                  </td>
                                </tr>
                                {editingTicket === ticket.ticket_id && (
                                  <tr>
                                    <td colSpan={9} className="bg-orange-50 dark:bg-[#2a2a2a] px-4 py-4">
                                      <div className="flex flex-col gap-2">
                                        <textarea
                                          className="w-full border border-gray-300 dark:border-orange-700 bg-white dark:bg-[#232323] text-black dark:text-white rounded px-3 py-2 mb-2 placeholder-gray-400 dark:placeholder-gray-500"
                                          placeholder="Admin Response"
                                          value={adminResponse}
                                          onChange={e => setAdminResponse(e.target.value)}
                                        />
                                        <textarea
                                          className="w-full border border-gray-300 dark:border-orange-700 bg-white dark:bg-[#232323] text-black dark:text-white rounded px-3 py-2 mb-2 placeholder-gray-400 dark:placeholder-gray-500"
                                          placeholder="Admin Notes"
                                          value={adminNotes}
                                          onChange={e => setAdminNotes(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                                            onClick={async () => {
                                              try {
                                                await updateTicket(ticket.ticket_id, { admin_response: adminResponse, admin_notes: adminNotes });
                                                setUpdateMessage('Ticket updated!');
                                                setEditingTicket(null);
                                                setTicketsLoading(true);
                                                getTickets()
                                                  .then(data => setTickets(data))
                                                  .catch(err => setTicketsError(err.message))
                                                  .finally(() => setTicketsLoading(false));
                                              } catch {
                                                setUpdateMessage('Failed to update ticket.');
                                              }
                                            }}
                                          >Save</button>
                                          <button
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                            onClick={() => setEditingTicket(null)}
                                          >Cancel</button>
                                        </div>
                                        {updateMessage && <div className="text-sm text-orange-700 dark:text-orange-400 mt-2">{updateMessage}</div>}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            default:
              return null;
          }
        })()}
      </>
    );
  };

  useEffect(() => {
    if (activeTab === 'tickets') {
      setTicketsLoading(true);
      setTicketsError('');
      getTickets()
        .then(data => setTickets(data))
        .catch(err => setTicketsError(err.message))
        .finally(() => setTicketsLoading(false));
    }
  }, [activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionDropdown) {
        // Check if click is outside both the dropdown and the trigger button
        const isDropdownClick = event.target.closest('.fixed.w-48');
        const isTriggerClick = event.target.closest('button[aria-label="actions"]') || 
                              event.target.closest('.relative.inline-block');
        
        if (!isDropdownClick && !isTriggerClick) {
          setShowActionDropdown(null);
        }
      }
      
      // Handle user action dropdown
      if (showUserActionDropdown) {
        const isUserDropdownClick = event.target.closest('.fixed.w-48');
        const isUserTriggerClick = event.target.closest('button[aria-label="user-actions"]') || 
                                  event.target.closest('.relative.inline-block');
        
        if (!isUserDropdownClick && !isUserTriggerClick) {
          setShowUserActionDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionDropdown, showUserActionDropdown]);

  // Enhanced startup action handlers
  const handleSuspendStartup = async (startupId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/startups/${startupId}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to suspend startup');

      setStartups(startups.map(s => 
        s.startup_id === startupId 
          ? { ...s, approval_status: 'suspended' }
          : s
      ));
      
      setStartupActionNotification({ type: 'success', message: 'Startup suspended successfully' });
      setTimeout(() => setStartupActionNotification(null), 3000);
    } catch (error) {
      setStartupActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setStartupActionNotification(null), 3000);
    }
  };

  const handleReactivateStartup = async (startupId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/startups/${startupId}/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to reactivate startup');

      setStartups(startups.map(s => 
        s.startup_id === startupId 
          ? { ...s, approval_status: 'approved' }
          : s
      ));
      
      setStartupActionNotification({ type: 'success', message: 'Startup reactivated successfully' });
      setTimeout(() => setStartupActionNotification(null), 3000);
    } catch (error) {
      setStartupActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setStartupActionNotification(null), 3000);
    }
  };

  const handleDeleteStartup = async (startupId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/startups/${startupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete startup');

      setStartups(startups.filter(s => s.startup_id !== startupId));
      setShowDeleteConfirmModal(false);
      setStartupToDelete(null);
      
      setStartupActionNotification({ type: 'success', message: 'Startup deleted successfully' });
      setTimeout(() => setStartupActionNotification(null), 3000);
    } catch (error) {
      setStartupActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setStartupActionNotification(null), 3000);
    }
  };

  const handleEditStartup = (startup) => {
    setEditingStartup({
      startup_id: startup.startup_id,
      name: startup.name,
      industry: startup.industry,
      location: startup.location,
      description: startup.description,
      startup_stage: startup.startup_stage,
      approval_status: startup.approval_status
    });
    setShowEditStartupModal(true);
  };

  const handleSaveStartupEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/startups/${editingStartup.startup_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingStartup)
      });

      if (!res.ok) throw new Error('Failed to update startup');

      const updatedStartup = await res.json();
      setStartups(startups.map(s => 
        s.startup_id === editingStartup.startup_id ? updatedStartup : s
      ));
      
      setShowEditStartupModal(false);
      setEditingStartup(null);
      
      setStartupActionNotification({ type: 'success', message: 'Startup updated successfully' });
      setTimeout(() => setStartupActionNotification(null), 3000);
    } catch (error) {
      setStartupActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setStartupActionNotification(null), 3000);
    }
  };

  // Bulk actions
  const handleSelectAllStartups = (checked) => {
    if (checked) {
      const filteredStartupsIds = startups
        .filter(startup => startup.approval_status === startupTab)
        .map(s => s.startup_id);
      setSelectedStartupIds(filteredStartupsIds);
    } else {
      setSelectedStartupIds([]);
    }
  };

  const handleSelectStartup = (startupId, checked) => {
    if (checked) {
      setSelectedStartupIds([...selectedStartupIds, startupId]);
    } else {
      setSelectedStartupIds(selectedStartupIds.filter(id => id !== startupId));
    }
  };

  const handleBulkAction = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/startups/bulk-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startup_ids: selectedStartupIds,
          action: bulkAction
        })
      });

      if (!res.ok) throw new Error(`Failed to ${bulkAction} startups`);

      // Refresh startups list
      fetchStartups();
      setSelectedStartupIds([]);
      setShowBulkActionModal(false);
      
      setStartupActionNotification({ 
        type: 'success', 
        message: `Successfully ${bulkAction}d ${selectedStartupIds.length} startup(s)` 
      });
      setTimeout(() => setStartupActionNotification(null), 3000);
    } catch (error) {
      setStartupActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setStartupActionNotification(null), 3000);
    }
  };

  // Add state for dropdown position
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [userDropdownPosition, setUserDropdownPosition] = useState({ top: 0, left: 0 });

  // Enhanced user action handlers
  const handleSuspendUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to suspend user');

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_suspended: true }
          : u
      ));
      
      setUserActionNotification({ type: 'success', message: 'User suspended successfully' });
      setTimeout(() => setUserActionNotification(null), 3000);
    } catch (error) {
      setUserActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setUserActionNotification(null), 3000);
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to reactivate user');

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_suspended: false }
          : u
      ));
      
      setUserActionNotification({ type: 'success', message: 'User reactivated successfully' });
      setTimeout(() => setUserActionNotification(null), 3000);
    } catch (error) {
      setUserActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setUserActionNotification(null), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteUserConfirmModal(false);
      setUserToDelete(null);
      
      setUserActionNotification({ type: 'success', message: 'User deleted successfully' });
      setTimeout(() => setUserActionNotification(null), 3000);
    } catch (error) {
      setUserActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setUserActionNotification(null), 3000);
    }
  };

  const handleEditUserDetails = (user) => {
    setEditingUser({
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email,
      role: user.role,
      is_verified: user.is_verified || false,
      is_suspended: user.is_suspended || false,
      industry: user.industry || '',
      location: user.location || ''
    });
    setShowEditUserModal(true);
  };

  const handleSaveUserEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingUser)
      });

      if (!res.ok) throw new Error('Failed to update user');

      const updatedUser = await res.json();
      setUsers(users.map(u => 
        u.id === editingUser.id ? updatedUser : u
      ));
      
      setShowEditUserModal(false);
      setEditingUser(null);
      
      setUserActionNotification({ type: 'success', message: 'User updated successfully' });
      setTimeout(() => setUserActionNotification(null), 3000);
    } catch (error) {
      setUserActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setUserActionNotification(null), 3000);
    }
  };

  // User bulk actions
  const handleSelectAllUsers = (checked) => {
    if (checked) {
      const filteredUserIds = filteredUsers.map(u => u.id);
      setSelectedUserIds(filteredUserIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId]);
    } else {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    }
  };

  const handleBulkUserAction = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_ids: selectedUserIds,
          action: bulkUserAction
        })
      });

      if (!res.ok) throw new Error(`Failed to ${bulkUserAction} users`);

      // Refresh users list
      fetchUsers();
      setSelectedUserIds([]);
      setShowBulkUserActionModal(false);
      
      setUserActionNotification({ 
        type: 'success', 
        message: `Successfully ${bulkUserAction}d ${selectedUserIds.length} user(s)` 
      });
      setTimeout(() => setUserActionNotification(null), 3000);
    } catch (error) {
      setUserActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setUserActionNotification(null), 3000);
    }
  };

  // Render user status badge
  const renderUserStatusBadge = (user) => {
    // Handle both boolean and integer values for is_verified and is_suspended
    const isVerified = user.is_verified === true || user.is_verified === 1 || user.verification_status === 'verified';
    const isSuspended = user.is_suspended === true || user.is_suspended === 1;
    
    if (isSuspended) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-orange-100 text-orange-800 border-orange-200">
          Suspended
        </span>
      );
    } else if (!isVerified) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-yellow-100 text-yellow-800 border-yellow-200">
          Pending
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-200">
          Active
        </span>
      );
    }
  };

  // Render startup action dropdown
  const renderStartupActionDropdown = (startup) => (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          
          // Calculate position relative to viewport
          const rect = e.currentTarget.getBoundingClientRect();
          const dropdownWidth = 192; // w-48 = 192px
          const dropdownHeight = 200; // approximate height
          
          // Check if dropdown would go off-screen and adjust position
          let left = rect.left;
          let top = rect.bottom + 4;
          
          // Adjust horizontal position if needed
          if (left + dropdownWidth > window.innerWidth) {
            left = rect.right - dropdownWidth;
          }
          
          // Adjust vertical position if needed
          if (top + dropdownHeight > window.innerHeight) {
            top = rect.top - dropdownHeight - 4;
          }
          
          setDropdownPosition({ top, left });
          setShowActionDropdown(showActionDropdown === startup.startup_id ? null : startup.startup_id);
        }}
        className="p-2 hover:bg-orange-100 dark:hover:bg-orange-800 rounded-lg transition"
        aria-label="actions"
        title="More actions"
      >
        <FiMoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );

  // Render user action dropdown
  const renderUserActionDropdown = (user) => (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          
          // Calculate position relative to viewport
          const rect = e.currentTarget.getBoundingClientRect();
          const dropdownWidth = 192; // w-48 = 192px
          const dropdownHeight = 200; // approximate height
          
          // Check if dropdown would go off-screen and adjust position
          let left = rect.left;
          let top = rect.bottom + 4;
          
          // Adjust horizontal position if needed
          if (left + dropdownWidth > window.innerWidth) {
            left = rect.right - dropdownWidth;
          }
          
          // Adjust vertical position if needed
          if (top + dropdownHeight > window.innerHeight) {
            top = rect.top - dropdownHeight - 4;
          }
          
          setUserDropdownPosition({ top, left });
          setShowUserActionDropdown(showUserActionDropdown === user.id ? null : user.id);
        }}
        className="p-2 hover:bg-orange-100 dark:hover:bg-orange-800 rounded-lg transition"
        aria-label="user-actions"
        title="More actions"
      >
        <FiMoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );

  // Render user dropdown as a separate component positioned fixed
  const renderUserActionDropdownPortal = () => {
    if (!showUserActionDropdown) return null;
    
    const user = users.find(u => u.id === showUserActionDropdown);
    if (!user) return null;

    return (
      <div 
        className="fixed w-48 bg-white dark:bg-[#232323] border border-orange-200 dark:border-orange-700 rounded-lg shadow-lg z-[1000]"
        style={{
          top: `${userDropdownPosition.top}px`,
          left: `${userDropdownPosition.left}px`
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUserModal(user);
            setShowUserDetailsModal(true);
            setShowUserActionDropdown(null);
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-800 flex items-center gap-2 rounded-t-lg"
        >
          <FiEye className="w-4 h-4" />
          View Details
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditUserDetails(user);
            setShowUserActionDropdown(null);
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-800 flex items-center gap-2"
        >
          <FiEdit2 className="w-4 h-4" />
          Edit User
        </button>

        {!(user.is_suspended === true || user.is_suspended === 1) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSuspendUser(user.id);
              setShowUserActionDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-800 flex items-center gap-2 text-yellow-600"
          >
            <FiPause className="w-4 h-4" />
            Suspend
          </button>
        )}

        {(user.is_suspended === true || user.is_suspended === 1) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReactivateUser(user.id);
              setShowUserActionDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-800 flex items-center gap-2 text-green-600"
          >
            <FiPlay className="w-4 h-4" />
            Reactivate
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setUserToDelete(user);
            setShowDeleteUserConfirmModal(true);
            setShowUserActionDropdown(null);
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-800 flex items-center gap-2 text-red-600 rounded-b-lg"
        >
          <FiTrash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    );
  };

  // Render dropdown as a separate component positioned fixed
  const renderActionDropdownPortal = () => {
    if (!showActionDropdown) return null;
    
    const startup = startups.find(s => s.startup_id === showActionDropdown);
    if (!startup) return null;

    return (
      <div 
        className="fixed w-48 bg-white dark:bg-[#232323] border border-orange-200 dark:border-orange-700 rounded-lg shadow-lg z-[1000]"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStartupModal(startup);
            setStartupModalOpen(true);
            setShowActionDropdown(null);
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-800 flex items-center gap-2 rounded-t-lg"
        >
          <FiEye className="w-4 h-4" />
          View Details
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditStartup(startup);
            setShowActionDropdown(null);
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-800 flex items-center gap-2"
        >
          <FiEdit2 className="w-4 h-4" />
          Edit Startup
        </button>

        {startup.approval_status === 'approved' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSuspendStartup(startup.startup_id);
              setShowActionDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-800 flex items-center gap-2 text-yellow-600"
          >
            <FiPause className="w-4 h-4" />
            Suspend
          </button>
        )}

        {startup.approval_status === 'suspended' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReactivateStartup(startup.startup_id);
              setShowActionDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-800 flex items-center gap-2 text-green-600"
          >
            <FiPlay className="w-4 h-4" />
            Reactivate
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setStartupToDelete(startup);
            setShowDeleteConfirmModal(true);
            setShowActionDropdown(null);
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-800 flex items-center gap-2 text-red-600 rounded-b-lg"
        >
          <FiTrash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 text-gray-800 pl-72">
        {/* Floating Sidebar */}
        <aside className="fixed left-8 top-24 bottom-8 z-30 w-64 bg-white dark:bg-[#232323] flex flex-col items-center py-8 border border-orange-100 dark:border-orange-700 rounded-2xl shadow-xl">
          {/* TARAKI logo removed from sidebar */}
          <nav className="flex flex-col gap-2 w-full px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-base font-medium ${
                  activeTab === tab.id
                    ? 'bg-orange-50 text-orange-600'
                    : 'hover:bg-gray-50 hover:text-orange-600 text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-10 mt-24">
          {renderContent()}
        </main>
        {/* Verification Modal */}
            {modalOpen && selectedRequest && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn flex flex-col md:flex-row items-stretch gap-6">
                  <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={handleCloseModal}>&times;</button>
                  {/* Left: Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-2 text-orange-700 text-center md:text-left">Verification Application</h3>
                    <div className="mb-4 w-full">
                      <div className="font-semibold text-lg text-black mb-1">{selectedRequest.first_name} {selectedRequest.last_name} <span className="text-xs text-gray-500">({selectedRequest.email})</span></div>
                      <div className="text-sm text-gray-700 mb-1">Role: {selectedRequest.role}</div>
                      <div className="text-sm text-gray-700 mb-1">Document Type: {selectedRequest.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div className="text-sm text-gray-700 mb-1">Number: {selectedRequest.document_number || 'N/A'}</div>
                      <div className="text-sm text-gray-700 mb-1">Issued: {selectedRequest.issue_date || 'N/A'} | Expiry: {selectedRequest.expiry_date || 'N/A'}</div>
                      <div className="text-sm text-gray-700 mb-1">Issuing Authority: {selectedRequest.issuing_authority || 'N/A'}</div>
                      <div className="text-sm text-gray-700 mb-1">Uploaded: {selectedRequest.uploaded_at ? new Date(selectedRequest.uploaded_at).toLocaleString() : 'N/A'}</div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4 w-full">
                      <div className="flex gap-2 justify-center">
                        <button onClick={handleApprove} disabled={modalActionLoading} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow disabled:opacity-60">Approve</button>
                        <button onClick={handleReject} disabled={modalActionLoading} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow disabled:opacity-60">Not Approve</button>
                      </div>
                      <input type="text" placeholder="Rejection reason (required for Not Approve)" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full border border-orange-200 rounded-lg px-3 py-2 mt-2" />
                      {modalError && <div className="text-red-500 text-sm mt-1 text-center">{modalError}</div>}
                    </div>
                  </div>
                  {/* Right: Document Preview */}
                  <div className="flex-1 min-w-0 flex flex-col items-center justify-center border-l border-orange-100 pl-6">
                    <span className="text-sm font-semibold text-orange-700 mb-2">Document Preview</span>
                    {selectedRequest.file_type && selectedRequest.file_type.startsWith('image') ? (
                      <img src={selectedRequest.file_path} alt="Document" className="max-h-72 max-w-full rounded shadow border border-orange-100" />
                    ) : selectedRequest.file_type && selectedRequest.file_type === 'application/pdf' ? (
                      <iframe src={selectedRequest.file_path} title="Document PDF" className="w-64 h-72 rounded border border-orange-100 shadow" />
                    ) : (
                      <a href={selectedRequest.file_path} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-semibold hover:text-orange-800 focus:outline-none" style={{textDecoration: 'none', cursor: 'pointer', display: 'inline-block', marginTop: '0.5rem'}}>View Document</a>
                    )}
                  </div>
                </div>
              </div>
        )}
      </div>
      {/* Action Dropdown Portal */}
      {renderActionDropdownPortal()}
      {/* User Action Dropdown Portal */}
      {renderUserActionDropdownPortal()}

      {/* Startup Details Modal */}
      {startupModalOpen && selectedStartupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn flex flex-col gap-6">
            <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={() => setStartupModalOpen(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-orange-700 text-center">Startup Details</h3>
            <div className="mb-4 w-full">
              <div className="font-semibold text-lg text-black dark:text-white mb-1">{selectedStartupModal.name}</div>
              <div className="text-sm text-gray-700 mb-1">Industry: {selectedStartupModal.industry}</div>
              <div className="text-sm text-gray-700 mb-1">Founder: {selectedStartupModal.entrepreneur_name} ({selectedStartupModal.entrepreneur_email})</div>
              <div className="text-sm text-gray-700 mb-1">Location: {selectedStartupModal.location}</div>
              <div className="text-sm text-gray-700 mb-1">Stage: {formatStartupStage(selectedStartupModal.startup_stage)}</div>
              <div className="text-sm text-gray-700 mb-1">Status: {renderStatusBadge(selectedStartupModal.approval_status)}</div>
              <div className="text-sm text-gray-700 mb-1">Description: {selectedStartupModal.description}</div>
              {selectedStartupModal.pitch_deck_url && (
                <div className="text-sm text-gray-700 mb-1">Pitch Deck: <a href={selectedStartupModal.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">View</a></div>
              )}
              {selectedStartupModal.business_plan_url && (
                <div className="text-sm text-gray-700 mb-1">Business Plan: <a href={selectedStartupModal.business_plan_url} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">View</a></div>
              )}
            </div>
          </div>
        </div>
      )}
             {/* Edit Startup Modal */}
       {showEditStartupModal && editingStartup && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
           <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn flex flex-col gap-6">
             <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={() => setShowEditStartupModal(false)}>&times;</button>
             <h3 className="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400 text-center">Edit Startup</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Name */}
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                 <input
                   type="text"
                   value={editingStartup.name || ''}
                   onChange={(e) => setEditingStartup({...editingStartup, name: e.target.value})}
                   className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                 />
               </div>
               
               {/* Industry */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                 <input
                   type="text"
                   value={editingStartup.industry || ''}
                   onChange={(e) => setEditingStartup({...editingStartup, industry: e.target.value})}
                   className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                 />
               </div>
               
               {/* Location */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                 <input
                   type="text"
                   value={editingStartup.location || ''}
                   onChange={(e) => setEditingStartup({...editingStartup, location: e.target.value})}
                   className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                 />
               </div>
               
               {/* Startup Stage */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startup Stage</label>
                 <select
                   value={editingStartup.startup_stage || ''}
                   onChange={(e) => setEditingStartup({...editingStartup, startup_stage: e.target.value})}
                   className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                 >
                   <option value="ideation">Ideation</option>
                   <option value="validation">Validation</option>
                   <option value="mvp">MVP</option>
                   <option value="growth">Growth</option>
                   <option value="maturity">Maturity</option>
                 </select>
               </div>
               
               {/* Approval Status */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                 <select
                   value={editingStartup.approval_status || ''}
                   onChange={(e) => setEditingStartup({...editingStartup, approval_status: e.target.value})}
                   className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                 >
                   <option value="pending">Pending</option>
                   <option value="approved">Approved</option>
                   <option value="rejected">Rejected</option>
                   <option value="suspended">Suspended</option>
                 </select>
               </div>
               
               {/* Description */}
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                 <textarea
                   value={editingStartup.description || ''}
                   onChange={(e) => setEditingStartup({...editingStartup, description: e.target.value})}
                   rows={3}
                   className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                 />
               </div>
             </div>
             
             <div className="flex gap-2 mt-4">
               <button
                 className="flex-1 bg-gray-200 dark:bg-gray-700 text-orange-700 dark:text-orange-400 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                 onClick={() => setShowEditStartupModal(false)}
               >Cancel</button>
               <button
                 className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
                 onClick={handleSaveStartupEdit}
               >Save Changes</button>
             </div>
           </div>
         </div>
       )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && startupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn flex flex-col gap-6">
            <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={() => setShowDeleteConfirmModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-orange-700 text-center">Delete Startup</h3>
            <div className="mb-4 w-full">
              <div className="font-semibold text-lg text-black dark:text-white mb-1">{startupToDelete.name}</div>
              <div className="text-sm text-gray-700 mb-1">Are you sure you want to delete this startup?</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 bg-gray-200 text-orange-700 py-2 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setShowDeleteConfirmModal(false)}
              >Cancel</button>
              <button
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                onClick={() => handleDeleteStartup(startupToDelete.startup_id)}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Action Modal */}
      {showBulkActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn flex flex-col gap-6">
            <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={() => setShowBulkActionModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-orange-700 text-center">Bulk Action</h3>
            <div className="mb-4 w-full">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
              >
                <option value="">Select Action</option>
                <option value="suspend">Suspend</option>
                <option value="reactivate">Reactivate</option>
                <option value="delete">Delete</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 bg-gray-200 text-orange-700 py-2 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setShowBulkActionModal(false)}
              >Cancel</button>
              <button
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
                onClick={handleBulkAction}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn flex flex-col gap-6">
            <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={() => setShowUserDetailsModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400 text-center">User Details</h3>
            <div className="mb-4 w-full">
              <div className="font-semibold text-lg text-black dark:text-white mb-1">
                {(selectedUserModal.first_name && selectedUserModal.last_name && 
                  `${selectedUserModal.first_name} ${selectedUserModal.last_name}`) ||
                selectedUserModal.full_name || selectedUserModal.email}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Email: {selectedUserModal.email}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Role: {roleLabels[selectedUserModal.role] || selectedUserModal.role}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Location: {selectedUserModal.location || 'N/A'}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Industry: {selectedUserModal.industry || 'N/A'}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Status: {renderUserStatusBadge(selectedUserModal)}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                Joined: {selectedUserModal.created_at ? new Date(selectedUserModal.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                Verified: {selectedUserModal.is_verified ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn flex flex-col gap-6">
            <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={() => setShowEditUserModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400 text-center">Edit User</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={editingUser.first_name || ''}
                  onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                  className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                />
              </div>
              
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editingUser.last_name || ''}
                  onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                  className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                />
              </div>
              
              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                />
              </div>
              
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={editingUser.role || ''}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                >
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="investor">Investor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={editingUser.location || ''}
                  onChange={(e) => setEditingUser({...editingUser, location: e.target.value})}
                  className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                />
              </div>
              
              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                <input
                  type="text"
                  value={editingUser.industry || ''}
                  onChange={(e) => setEditingUser({...editingUser, industry: e.target.value})}
                  className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                />
              </div>
              
              {/* Verification Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Status</label>
                <select
                  value={editingUser.is_verified ? 'true' : 'false'}
                  onChange={(e) => setEditingUser({...editingUser, is_verified: e.target.value === 'true'})}
                  className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
                >
                  <option value="false">Not Verified</option>
                  <option value="true">Verified</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-orange-700 dark:text-orange-400 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setShowEditUserModal(false)}
              >Cancel</button>
              <button
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
                onClick={handleSaveUserEdit}
              >Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteUserConfirmModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn flex flex-col gap-6">
            <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={() => setShowDeleteUserConfirmModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400 text-center">Delete User</h3>
            <div className="mb-4 w-full">
              <div className="font-semibold text-lg text-black dark:text-white mb-1">
                {(userToDelete.first_name && userToDelete.last_name && 
                  `${userToDelete.first_name} ${userToDelete.last_name}`) ||
                userToDelete.full_name || userToDelete.email}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Email: {userToDelete.email}</div>
              <div className="text-sm text-red-600 dark:text-red-400 mb-1">
                Are you sure you want to delete this user? This action cannot be undone.
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-orange-700 dark:text-orange-400 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setShowDeleteUserConfirmModal(false)}
              >Cancel</button>
              <button
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                onClick={() => handleDeleteUser(userToDelete.id)}
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk User Action Modal */}
      {showBulkUserActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn flex flex-col gap-6">
            <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={() => setShowBulkUserActionModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400 text-center">Bulk User Action</h3>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Action</label>
              <select
                value={bulkUserAction}
                onChange={(e) => setBulkUserAction(e.target.value)}
                className="w-full p-3 border border-orange-300 dark:border-orange-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#1b1b1b] text-black dark:text-white"
              >
                <option value="">Select Action</option>
                <option value="suspend">Suspend</option>
                <option value="reactivate">Reactivate</option>
                <option value="verify">Verify</option>
                <option value="delete">Delete</option>
              </select>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                This action will be applied to {selectedUserIds.length} selected user(s).
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-orange-700 dark:text-orange-400 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setShowBulkUserActionModal(false)}
              >Cancel</button>
              <button
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
                onClick={handleBulkUserAction}
                disabled={!bulkUserAction}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {showDeleteEventModal && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-lg p-8 w-full max-w-md relative animate-fadeIn flex flex-col gap-6">
            <button 
              className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" 
              onClick={() => {
                setShowDeleteEventModal(false);
                setEventToDelete(null);
              }}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2 text-orange-700 dark:text-orange-400 text-center">Delete Event</h3>
            <div className="mb-4 w-full">
              <div className="font-semibold text-lg text-black dark:text-white mb-1">{eventToDelete.title}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                Date: {eventToDelete.event_date ? new Date(eventToDelete.event_date).toLocaleDateString() : 'N/A'}
              </div>
              {eventToDelete.location && (
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Location: {eventToDelete.location}</div>
              )}
              <div className="text-sm text-red-600 dark:text-red-400 mt-3">
                Are you sure you want to delete this event? This action cannot be undone.
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-orange-700 dark:text-orange-400 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => {
                  setShowDeleteEventModal(false);
                  setEventToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                onClick={confirmDeleteEvent}
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;