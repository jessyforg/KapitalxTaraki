import React, { useState, useEffect } from 'react';
import { FiHome, FiCalendar, FiUsers, FiBarChart2, FiSettings, FiEdit2, FiPlus, FiBell, FiMail, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaTicketAlt } from 'react-icons/fa'; // Add ticket icon
import './styles.css'; // For custom calendar and dashboard styles
import { ReactComponent as PhMap } from './imgs/ph.svg';
import Navbar from './Navbar'; // Add Navbar import


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
  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: 'Consultation Request',
      type: 'Consult',
      status: 'Open',
      submittedBy: 'Jane Doe',
      date: '2025-06-05',
      messages: [
        { from: 'user', text: 'I need help with my startup idea.', time: '2025-06-05 10:00' },
      ],
    },
    {
      id: 2,
      title: 'Bug Report',
      type: 'Issue',
      status: 'Open',
      submittedBy: 'John Smith',
      date: '2025-06-04',
      messages: [
        { from: 'user', text: 'There is a bug on the dashboard.', time: '2025-06-04 09:30' },
      ],
    },
  ]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  // Add state for ticket filters and search
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All Status');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('All Types');
  const [ticketSearch, setTicketSearch] = useState('');
  const [chatAnim, setChatAnim] = useState(false);
  const [selectedStartup, setSelectedStartup] = React.useState(null);
  const [startups, setStartups] = React.useState([
    {
      id: 1,
      name: 'AgriBoost',
      industry: 'AgriTech',
      entrepreneur: 'Maria Santos',
      location: 'Baguio City',
      stage: 'Seed',
      funding: 'Pre-Seed',
      website: 'https://agriboost.com',
      documents: 'agriboost-pitch.pdf',
      description: 'Empowering farmers with smart analytics and supply chain tools.',
      status: 'Pending',
    },
    {
      id: 2,
      name: 'Finwise',
      industry: 'Fintech',
      entrepreneur: 'Juan Dela Cruz',
      location: 'La Trinidad',
      stage: 'Series A',
      funding: 'Series A',
      website: 'https://finwise.com',
      documents: 'finwise-business-plan.pdf',
      description: 'Revolutionizing microloans for small businesses.',
      status: 'Accepted',
    },
    {
      id: 3,
      name: 'Marketly',
      industry: 'Digital Marketing',
      entrepreneur: 'Ana Lopez',
      location: 'Ifugao',
      stage: 'Ideation Stage',
      funding: 'None',
      website: 'https://marketly.com',
      documents: '',
      description: 'Connecting local businesses to digital audiences.',
      status: 'Declined',
    },
  ]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const roleLabels = {
    admin: 'Admin',
    entrepreneur: 'Entrepreneur',
    investor: 'Investor',
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
  const handleEventSave = (event) => {
    if (eventModal.event) {
      // Edit existing event
      setEvents(events.map(e =>
        e === eventModal.event ? { ...event, registrationLink: event.registrationLink } : e
      ));
    } else {
      // Add new event
      setEvents([...events, { ...event, registrationLink: event.registrationLink }]);
    }
    setEventModal({ open: false, event: null, date: null });
    setEventFiles([]);
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

  // Accept/Decline handlers at the top level of AdminDashboard
  function handleAcceptStartup(id) {
    setStartups(prev => prev.map(s => s.id === id ? { ...s, status: 'Accepted' } : s));
    if (selectedStartup && selectedStartup.id === id) {
      setSelectedStartup({ ...selectedStartup, status: 'Accepted' });
    }
  }
  function handleDeclineStartup(id) {
    setStartups(prev => prev.map(s => s.id === id ? { ...s, status: 'Declined' } : s));
    if (selectedStartup && selectedStartup.id === id) {
      setSelectedStartup({ ...selectedStartup, status: 'Declined' });
    }
  }

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

  // Main content for each tab
  const renderContent = () => {
    return (
      <>
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              // Define filteredUsers before use
              // Show upcoming events from the events state (created by admin)
              const upcomingEvents = events
                .filter(e => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3); // Show next 3 upcoming events
              return (
                <div className="flex flex-col gap-6 w-full">
                  {/* Topbar */}
                  <div className="flex items-center justify-between mb-6">
                    <input type="text" placeholder="Search" className={`rounded-lg px-4 py-2 w-1/3 focus:outline-none ${darkMode ? 'bg-[#232323] border border-gray-700 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`} />
                    <div className="flex items-center gap-6">
                      {/* Single Admin Notification Bell */}
                      <button className="relative group focus:outline-none" title="Admin Notifications" onClick={() => setShowMessages(true)}>
                        <FiBell size={22} className="text-orange-400 group_hover:text-orange-500 transition" />
                        {(pendingRequests.length > 0 || (tickets && tickets.some(t => t.status === 'Open'))) && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#232323]" style={{display:'inline-block'}}></span>
                        )}
                      </button>
                      <button className="relative group focus:outline-none" title="Messages" onClick={() => setShowMessages(true)}>
                        <FiMail size={22} className="text-orange-400 group_hover:text-orange-500 transition" />
                        {(pendingRequests.length > 0 || tickets.some(t => t.status === 'Open')) && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-[#232323]" style={{display:'inline-block'}}></span>
                        )}
                      </button>
                    </div>
                    {/* Messages Modal */}
                    {showMessages && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className={`bg-white dark:bg-[#232323] rounded-xl shadow-lg p-6 w-full max-w-md relative`}>
                          <button className="absolute top-2 right-2 text-xl text-orange-500 hover:text-orange-700" onClick={() => setShowMessages(false)}>&times;</button>
                          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>User Messages</h2>
                          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                            {pendingRequests.length === 0 && <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No new messages from users.</span>}
                            {pendingRequests.map(req => (
                              <div key={req.id} className={`rounded-lg p-3 border ${darkMode ? 'bg-[#181818] border-gray-700' : 'bg-orange-50 border-orange-300'}`}>
                                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>{req.name}</span>
                                <span className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{req.email}</span>
                                <span className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Requested: {req.time} ago</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Active Investors</span>
                      <span className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>189</span>
                      <span className={`text-xs rounded px-2 py-1 mt-2 ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>+8.2%</span>
                    </div>
                    <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Active Startups</span>
                      <span className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>53</span>
                      <span className={`text-xs rounded px-2 py-1 mt-2 ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>-1.4%</span>
                    </div>
                    <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Site Visitors</span>
                      <span className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>189</span>
                      <span className={`text-xs rounded px-2 py-1 mt-2 ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>+8.2%</span>
                    </div>
                    <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Upcoming Events</span>
                      <span className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>{upcomingEvents.length}</span>
                      <div className="mt-2 w-full">
                        {upcomingEvents.length === 0 && <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming events.</span>}
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
                  <div className={`rounded-xl shadow p-6 mt-4 min-h-[300px] flex flex-col border-t-4 border-orange-600 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
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
                <div className="flex flex-col gap-6">
                  {/* Calendar Section */}
                  <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-[#232323]' : 'bg-white'}`}>
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-orange-100 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={prevMonth}
                          className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-lg transition"
                        >
                          <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold">{monthName} {calendarDate.getFullYear()}</h2>
                        <button
                          onClick={nextMonth}
                          className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-lg transition"
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <button
                        onClick={() => setEventModal({ open: true, event: null, date: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                      >
                        <FiPlus className="w-5 h-5" />
                        <span>Add Event</span>
                      </button>
                    </div>
                    {/* Calendar Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400 py-2">
                            {day}
                          </div>
                        ))}
                        {monthMatrix.map((row, i) => (
                          <React.Fragment key={i}>
                            {row.map((day, j) => (
                              <div
                                key={`${i}-${j}`}
                                className={`aspect-square p-2 border border-orange-100 dark:border-gray-700 rounded-lg ${
                                  day.isCurrentMonth ? 'bg-white dark:bg-[#232323]' : 'bg-orange-50 dark:bg-[#1a1a1a]'
                                }`}
                              >
                                <div className="flex flex-col h-full">
                                  <span className={`text-sm ${day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                    {day.date}
                                  </span>
                                  <div className="flex-1 flex flex-col gap-1 mt-1">
                                    {getEventsForDate(day.dateStr).map(event => (
                                      <div
                                        key={event.id}
                                        className="text-xs p-1 rounded bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 truncate cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-800 transition"
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
                </div>
              );
            case 'users':
              // Filter users based on role and search query
              const filteredUsers = users.filter(user => {
                const matchesRole =
                  roleFilter === 'all' ||
                  (user.role && user.role.toLowerCase() === roleFilter.toLowerCase());
                const nameString =
                  (user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.full_name || '') +
                  ' ' +
                  (user.email || '');
                const matchesSearch = nameString.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesRole && matchesSearch;
              });

              return (
                <div className="flex flex-col gap-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
                  <div className="bg-white p-8 rounded-xl border border-orange-100 shadow-sm">
                    {/* Search and Roles */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-lg px-4 py-2 w-full md:w-1/2 focus:outline-none bg-orange-50 border border-orange-300 text-black"
                      />
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-lg px-4 py-2 focus:outline-none bg-orange-50 border border-orange-300 text-black"
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
                              <tr key={user.id} className="border-b border-orange-100 hover:bg-orange-50 transition">
                                <td className="px-4 py-3">
                                  {(user.first_name && user.last_name && `${user.first_name} ${user.last_name}`) ||
                                   user.full_name ||
                                   user.email}
                                </td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">
                                  {roleLabels[user.role] || user.role}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="p-2 rounded-lg hover:bg-orange-100"
                                    title="Edit User"
                                  >
                                    <FiEdit2 className="inline-block text-orange-500" />
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
                <div className={`flex flex-col gap-6 w-full border-2 border-orange-400 rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-[#232323] border-orange-700' : 'bg-white border-orange-400'}`}>
                  {/* Topbar for site performance */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Site Performance</h2>
                    <div className="flex items-center gap-4">
                      <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                        Generate Report
                      </button>
                    </div>
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

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 text-gray-800 pl-72 pr-80">
        {/* Floating Sidebar */}
        <aside className="fixed left-8 top-24 bottom-8 z-30 w-64 bg-white flex flex-col items-center py-8 border border-orange-100 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <img src={require('./imgs/taraki-logo-black2.png')} alt="Logo" className="h-10 w-auto object-contain mb-8" />
          </div>
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
        {(activeTab === 'users' || activeTab === 'startup') && (
          <aside className="fixed right-8 top-24 bottom-8 z-30 w-80 bg-white rounded-2xl shadow-xl border border-orange-100 flex flex-col p-6">
            <h2 className="text-lg font-bold mb-4 text-orange-700 border-b border-orange-100 pb-2">Pending Verification Applications</h2>
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              {pendingLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : pendingError ? (
                <div className="text-red-500">{pendingError}</div>
              ) : pendingRequests.length === 0 ? (
                <span className="text-gray-500">No pending verification applications.</span>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.document_id} className="rounded-lg p-3 border border-orange-100 bg-orange-50 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-black">{req.first_name} {req.last_name}</span>
                      <span className="block text-xs text-gray-700">{req.email}</span>
                      <span className="block text-xs text-gray-600">{req.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <button className="ml-2 p-2 rounded-full hover:bg-orange-200 flex items-center justify-center" title="View Details" onClick={() => handleOpenModal(req.document_id)}>
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
    </>
  );
}

export default AdminDashboard;