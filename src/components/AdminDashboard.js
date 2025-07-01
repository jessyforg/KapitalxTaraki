import React, { useState, useEffect } from 'react';
import { FiHome, FiCalendar, FiUsers, FiBarChart2, FiSettings, FiEdit2, FiPlus, FiBell, FiMail, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
  const [roleFilter, setRoleFilter] = useState('all');
  const [roleFilterAnim, setRoleFilterAnim] = useState(''); // Add animation state for role filter
  // State for month/year picker
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(calendarDate.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(calendarDate.getMonth());
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Add state for real pending verification requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
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
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', rsvp_link: '', description: '' });

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
  const filteredUsers = users.filter(u =>
    (!roleFilterReport || u.role === roleFilterReport) &&
    (!locationFilter || u.location === locationFilter) &&
    (!industryFilter || u.industry === industryFilter)
  );
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
  const getEventsForDate = (dateStr) => events.filter(e => e.date === dateStr);

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
  const handleDeleteEvent = (eventToDelete) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(evts => evts.filter(e => e !== eventToDelete));
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
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Handle event edit
  const handleEditEvent = (event) => {
    // TODO: Implement event edit functionality
    console.log('Edit event:', event);
  };

  // Fetch pending verification requests
  const fetchPendingRequests = async () => {
    setPendingLoading(true);
    setPendingError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/verification/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch pending requests');
      const data = await res.json();
      setPendingRequests(data);
    } catch (e) {
      setPendingError(e.message);
    } finally {
      setPendingLoading(false);
    }
  };

  // Fetch on tab change
  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'startup') {
      fetchPendingRequests();
    }
    // eslint-disable-next-line
  }, [activeTab]);

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
      fetchPendingRequests();
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
      fetchPendingRequests();
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

  // Add event handler for sidebar modal
  const handleSidebarEventSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const event_date = newEvent.date + (newEvent.time ? `T${newEvent.time}` : '');
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
          time: newEvent.time,
          description: newEvent.description,
          tags: newEvent.tags
        })
      });
      if (!res.ok) throw new Error('Failed to create event');
      const savedEvent = await res.json();
      setEvents([...events, savedEvent]);
      setShowEventModal(false);
      setNewEvent({ title: '', date: '', time: '', location: '', rsvp_link: '', description: '', status: 'upcoming', tags: '' });
    } catch (error) {
      setEventNotification({ type: 'error', message: error.message });
    }
  };

  // Add fetchEvents function
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      setEventNotification({ type: 'error', message: error.message });
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
          // Try to fetch upcoming events count from backend if available
          if (typeof data.total_upcoming_events !== 'undefined') {
            setDashboardStats(data);
          } else {
            // Fallback: calculate upcoming events from events state
            setDashboardStats(stats => ({
              ...data,
              total_upcoming_events: Array.isArray(events)
                ? events.filter(e => new Date(e.date) >= new Date()).length
                : 0
            }));
          }
        }
      })
      .catch(error => console.error('Error fetching dashboard stats:', error));
  };

  // Update upcoming events count if events change
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab, events]);

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
                .filter(e => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
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
                        {dashboardStats.total_upcoming_events === 0 && <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming events.</span>}
                        {upcomingEvents.map((event, idx) => (
                          <div key={idx} className={`flex flex-col mb-2 p-2 rounded border ${darkMode ? 'bg-[#181818] border-orange-900/30' : 'bg-orange-50 border-orange-200'}`}>
                            <span className={`text-xs font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>{event.title}</span>
                            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{event.date} {event.time && `- ${event.time}`}</span>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{event.location}</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {event.eventTag && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${darkMode ? 'bg-[#232323] border-orange-700 text-orange-300' : 'bg-orange-100 border-orange-300 text-orange-700'}`}>{event.eventTag}</span>
                              )}
                              {event.eventType && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${darkMode ? 'bg-[#232323] border-orange-700 text-orange-300' : 'bg-orange-100 border-orange-300 text-orange-700'}`}>{event.eventType === 'upcoming' ? 'Upcoming Event' : 'Past Event'}</span>
                              )}
                            </div>
                          </div>
                        ))}
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
                                <button className="text-orange-400 hover:text-orange-600" onClick={() => handleEditEvent(event)} title="Edit Event">
                                  <FiEdit2 size={16} />
                                </button>
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
                          <button className="absolute top-2 right-2 text-2xl text-orange-500 hover:text-orange-700" onClick={() => setShowEventModal(false)}>&times;</button>
                          <h2 className="text-xl font-bold mb-4 text-orange-700">Create Event</h2>
                          <div className="flex flex-col gap-4">
                            <input
                              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                              type="text"
                              placeholder="Event name"
                              value={newEvent.title}
                              onChange={e => setNewEvent(ev => ({ ...ev, title: e.target.value }))}
                            />
                            <div className="flex gap-2">
                              <input
                                className="w-1/2 p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                                type="date"
                                value={newEvent.date}
                                onChange={e => setNewEvent(ev => ({ ...ev, date: e.target.value }))}
                              />
                              <input
                                className="w-1/2 p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black dark:text-white placeholder-gray-400"
                                type="time"
                                value={newEvent.time}
                                onChange={e => setNewEvent(ev => ({ ...ev, time: e.target.value }))}
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
                                onClick={() => setShowEventModal(false)}
                              >Cancel</button>
                              <button
                                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
                                onClick={handleSidebarEventSave}
                                disabled={!newEvent.title || !newEvent.date}
                              >Create Event</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            case 'users':
              // Use the filteredUsers variable from the top-level scope
              return (
                <div className="flex flex-col gap-6">
                  {activeTab === 'users' && (
                    <h1 className='text-3xl font-bold mb-6 text-black dark:text-white'>Users Management</h1>
                  )}
                  <div className="bg-white p-8 rounded-xl border border-orange-700 shadow-sm">
                    {/* Search and Roles */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-lg px-4 py-2 w-full md:w-1/2 focus:outline-none border placeholder-gray-400 
                      bg-white text-black border-orange-700 
                     dark:bg-[#232323] dark:text-white dark:border-orange-700"
                      />
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-lg px-4 py-2 focus:outline-none border 
                       bg-white text-black border-orange-700 
                       dark:bg-[#232323] dark:text-white dark:border-orange-700"
                        >
                        <option value="all">All Roles</option>
                        <option value="admin">Administrator</option>
                        <option value="entrepreneur">Entrepreneur</option>
                        <option value="investor">Investor</option>
                      </select>
                    </div>
                    {loading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : error ? (
                      <div className="flex-1 flex items-center justify-center text-red-500">
                        {error}
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg">
                        <table className="min-w-full text-left text-sm text-gray-700">
                          <thead>
                            <tr className="bg-orange-100 text-orange-700">
                              <th className="px-4 py-3 font-semibold">NAME</th>
                              <th className="px-4 py-3 font-semibold">EMAIL</th>
                              <th className="px-4 py-3 font-semibold">ROLE</th>
                              <th className="px-4 py-3 font-semibold text-center">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                          <tr key={user.id} className="group border-b border-orange-100 hover:bg-orange-50 transition duration-300">
                          <td className="px-4 py-3 text-black dark:text-white group-hover:text-orange-600">
                          {(user.first_name && user.last_name && `${user.first_name} ${user.last_name}`) ||
                          user.full_name || user.email}
                          </td>
                          <td className="px-4 py-3 text-black dark:text-white group-hover:text-orange-600">
                          {user.email}
                          </td>
                          <td className="px-4 py-3 text-black dark:text-white group-hover:text-orange-600">
                          {roleLabels[user.role] || user.role}
                          </td>
                          <td className="px-4 py-3 text-center text-white">
                          <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 rounded-lg hover:bg-orange-100"
                          title="Edit User"
                          >
                          <FiEdit2 className="inline-block text-orange-600" />
                              </button>
                            </td>
                          </tr>

                            ))}
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
        <table className="min-w-full w-full min-w-[900px] table-fixed divide-y divide-orange-100">
          <thead>
            <tr className="bg-orange-100">
              <th className="px-4 py-3 font-semibold w-[140px]">Name</th>
              <th className="px-4 py-3 font-semibold w-[140px]">Industry</th>
              <th className="px-4 py-3 font-semibold w-[140px]">Founder</th>
              <th className="px-4 py-3 font-semibold w-[140px]">Location</th>
              <th className="px-4 py-3 font-semibold w-[140px]">Stage</th>
              <th className="px-4 py-3 font-semibold w-[100px]">Status</th>
              <th className="px-4 py-3 font-semibold w-[100px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#1b1b1b] divide-y divide-orange-100">
            {(reportType === 'startups' ? filteredStartups : filteredUsers).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-lg">
                  No results found.
                </td>
              </tr>
            ) : (
              (reportType === 'startups' ? filteredStartups : filteredUsers).map(item => (
                <tr key={item.startup_id || item.id} className="group border-b border-orange-100 hover:bg-orange-50 dark:hover:bg-white transition cursor-pointer">
                  {/* Name */}
                  <td className="px-4 py-3 w-[140px] truncate overflow-hidden whitespace-nowrap">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.name}</div>
                  </td>

                  {/* Industry */}
                  <td className="px-4 py-3 w-[140px] truncate">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.industry}</div>
                  </td>

                  {/* Founder */}
                  <td className="px-4 py-3 w-[140px] truncate">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.entrepreneur_name}</div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 w-[140px] truncate">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.location}</div>
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-3 w-[140px] truncate">
                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.startup_stage}</div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 w-[100px] truncate">
                    {renderStatusBadge(item.approval_status)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 w-[100px] truncate text-center" onClick={e => e.stopPropagation()}>
                    {item.approval_status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAcceptStartup(item.startup_id)}
                          className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                        >Approve</button>
                        <button
                          onClick={() => handleDeclineStartup(item.startup_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >Reject</button>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">—</span>
                    )}
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
                  <h1 className='text-3xl font-bold mb-6 text-black dark:text-white'>Startup Management</h1>
                  {/* Tab Buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${startupTab === 'approved' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => setStartupTab('approved')}
                    >
                      Approved
                    </button>
                    <button
                      className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${startupTab === 'pending' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => setStartupTab('pending')}
                    >
                      Pending
                    </button>
                  </div>
                  {/* Table */}
                  <div className="bg-white dark:bg-[#1b1b1b] p-4 md:p-8 rounded-xl border border-orange-100 dark:border-orange-700 shadow-sm w-full">
                    {startupLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : startupError ? (
                      <div className="text-red-500 text-center">{startupError}</div>
                    ) : (
                      <div className="overflow-x-auto w-full">
                        <table className="min-w-full w-full min-w-[900px] table-fixed divide-y divide-orange-100">
                          <thead>
                            <tr className="bg-orange-100">
                              <th className="px-4 py-3 font-semibold w-[140px] ">Name</th>
                              <th className="px-4 py-3 font-semibold w-[140px]">Industry</th>
                              <th className="px-4 py-3 font-semibold w-[140px]">Founder</th>
                              <th className="px-4 py-3 font-semibold w-[140px]">Location</th>
                              <th className="px-4 py-3 font-semibold w-[140px]">Stage</th>
                              <th className="px-4 py-3 font-semibold w-[100px]">Status</th>
                              <th className="px-4 py-3 font-semibold w-[100px] text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-[#1b1b1b] divide-y divide-orange-100">
                            {startups.filter(startup => startup.approval_status === startupTab).length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-lg">No {startupTab === 'pending' ? 'pending' : 'approved'} startups found.</td>
                              </tr>
                            ) : (
                              startups.filter(startup => startup.approval_status === startupTab).map((startup) => (
                                <tr
                                  key={startup.startup_id}
                                  className="group border-b border-orange-100 hover:bg-orange-50 dark:hover:bg-white transition cursor-pointer"
                                  onClick={() => { setSelectedStartupModal(startup); setStartupModalOpen(true); }}
                                >
                                  <td className="px-4 py-3 w-[140px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.name}</div>
                                      <div className="text-sm text-gray-500 md:hidden truncate overflow-hidden whitespace-nowrap">{startup.industry}</div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 w-[140px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.industry}</div>
                                  </td>
                                  <td className="px-4 py-3 w-[140px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.entrepreneur_name}</div>
                                  </td>
                                  <td className="px-4 py-3 w-[140px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.location}</div>
                                  </td>
                                  <td className="px-4 py-3 w-[140px] truncate overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{formatStartupStage(startup.startup_stage)}</div>
                                  </td>
                                  <td className="px-4 py-3 w-[100px] truncate overflow-hidden whitespace-nowrap">
                                    {renderStatusBadge(startup.approval_status)}
                                  </td>
                                  <td className="px-4 py-3 w-[100px] truncate overflow-hidden whitespace-nowrap text-center" onClick={e => e.stopPropagation()}>
                                    {startupTab === 'pending' ? (
                                      <>
                                        <button
                                          onClick={() => handleAcceptStartup(startup.startup_id)}
                                          className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                                        >Approve</button>
                                        <button
                                          onClick={() => handleDeclineStartup(startup.startup_id)}
                                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        >Reject</button>
                                      </>
                                    ) : (
                                      <span className="text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">—</span>
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
                                <tr className="border-b border-orange-100 text-white hover:bg-orange-50 hover:text-orange-600 transition">
                                  <td className="px-4 py-3">{ticket.ticket_id}</td>
                                  <td className="px-4 py-3">{ticket.title}</td>
                                  <td className="px-4 py-3">{ticket.type}</td>
                                  <td className="px-4 py-3">{ticket.status}</td>
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
                                    <td colSpan={9} className="bg-orange-50 px-4 py-4">
                                      <div className="flex flex-col gap-2">
                                        <textarea
                                          className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                                          placeholder="Admin Response"
                                          value={adminResponse}
                                          onChange={e => setAdminResponse(e.target.value)}
                                        />
                                        <textarea
                                          className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
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
                                            className="px-4 py-2 bg-gray-200 rounded"
                                            onClick={() => setEditingTicket(null)}
                                          >Cancel</button>
                                        </div>
                                        {updateMessage && <div className="text-sm text-orange-700 mt-2">{updateMessage}</div>}
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

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 text-gray-800 pl-72 pr-80">
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
        {/* Floating Pending Requests Card */}
        {activeTab === 'users' && (
        <aside className="fixed right-8 top-24 bottom-8 z-30 w-80 bg-white dark:bg-[#232323] rounded-2xl shadow-xl border border-orange-100 dark:border-orange-700 flex flex-col p-6">
        <h2 className="text-lg font-bold mb-4 text-orange-700 dark:text-orange-400 border-b border-orange-100 dark:border-orange-700 pb-2">
         Pending Verification Applications
        </h2>
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
      {pendingLoading ? (
      <div className="text-gray-500 dark:text-gray-300">Loading...</div>
     ) : pendingError ? (
      <div className="text-red-500">{pendingError}</div>
      ) : pendingRequests.length === 0 ? (
      <span className="text-gray-500 dark:text-gray-300">No pending verification applications.</span>
       ) : (
        pendingRequests.map(req => (
          <div key={req.document_id} className="rounded-lg p-3 border border-orange-100 dark:border-orange-700 bg-orange-50 dark:bg-[#2a2a2a] flex items-center justify-between">
            <div>
            <span className="font-semibold text-black dark:text-white">{req.first_name} {req.last_name}</span>
            <span className="block text-xs text-gray-700 dark:text-gray-300">{req.email}</span>
            <span className="block text-xs text-gray-600 dark:text-gray-400">
              {req.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
               </span>
             </div>
             <button
             className="ml-2 p-2 rounded-full hover:bg-orange-200 dark:hover:bg-orange-300 flex items-center justify-center"
             title="View Details"
              onClick={() => handleOpenModal(req.document_id)}
             >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" fill="#fb923c" />
              <circle cx="12" cy="12" r="1.5" fill="#fb923c" />
              <circle cx="12" cy="19" r="1.5" fill="#fb923c" />
               </svg>
             </button>
            </div>
             ))
            )}
        </div>
            {/* Modal for document details and approve/reject */}
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
          </aside>
        )}
      </div>
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
    </>
  );
}

export default AdminDashboard;