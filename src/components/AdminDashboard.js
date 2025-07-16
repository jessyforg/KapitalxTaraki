import React, { useState, useEffect, useRef } from 'react';
import { FiHome, FiUsers, FiBarChart2, FiCalendar, FiChevronLeft, FiChevronRight, FiPlus, FiEdit2, FiTrash2, FiEye, FiPause, FiPlay, FiX, FiMenu, FiSettings, FiCheck, FiLogOut, FiClock } from 'react-icons/fi';
import { FaTicketAlt, FaUser, FaBell, FaLock, FaPalette, FaEnvelope, FaQuestionCircle, FaBuilding, FaChartLine, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import { HiOutlineDocumentText, HiOutlineLocationMarker } from 'react-icons/hi';
import { MdOutlineEvent, MdEventAvailable } from 'react-icons/md';
import AdminUserDetailsModal from './AdminUserDetailsModal';
import Navbar from './Navbar';
import { useBreakpoint, useScreenSize } from '../hooks/useScreenSize';
import './styles.css'; // For custom calendar and dashboard styles
import { ReactComponent as PhMap } from './imgs/ph.svg';
import defaultAvatar from './imgs/default-avatar.png';
import { getTickets, updateTicket } from '../api/tickets';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import FAQ from './FAQ';
import { useNavigate } from 'react-router-dom';
import { updateProfilePhoto } from '../api/user';
import axios from 'axios';
import MobileSidebar from './MobileSidebar';
import HamburgerButton from './HamburgerButton';

// Message component for displaying success/error messages
const Message = ({ type, message }) => {
  if (!message) return null;
  return (
    <div className={`mt-4 p-4 rounded-md ${
      type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }`}>
      {message}
    </div>
  );
};

const initialTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
  { id: 'users', label: 'Users Management', icon: <FiUsers size={20} /> },
  { id: 'startup', label: 'Startup', icon: <FiBarChart2 size={20} /> },
  { id: 'events', label: 'Events', icon: <FiCalendar size={20} /> },
  { id: 'team', label: 'Team Management', icon: <FaUsers size={20} /> },
  { id: 'tickets', label: 'Tickets', icon: <FaTicketAlt size={20} /> },
  { id: 'sitePerformance', label: 'Site Performance', icon: <FiBarChart2 size={20} /> }
];

// Separate settings from main navigation
const isSettingsTab = (tab) => tab === 'settings';

// Demo profile data (move this above the AdminDashboard function if not already present)
// const profile = {
//   name: 'Admin User',
//   email: 'admin@taraki.com',
//   avatar: null, // You can use a static image or initials
// };

function AdminDashboard() {
  const [selectedStartupModal, setSelectedStartupModal] = useState(null);
  const [startupModalOpen, setStartupModalOpen] = useState(false);
  const [tabs] = useState(initialTabs);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      return null;
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-dashboard-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Add responsive state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isDesktop, isMobile, isTablet } = useBreakpoint();
  const screenSize = useScreenSize();
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
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title: '', description: '', type: 'bug' });
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  // Add state for ticket filters and search
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All Status');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('All Types');
  const [ticketSort, setTicketSort] = useState('Newest');
  const [ticketSearch, setTicketSearch] = useState('');
  const [chatAnim, setChatAnim] = useState(false);
  const [selectedStartup, setSelectedStartup] = React.useState(null);
  const [startups, setStartups] = React.useState([]);
  const [startupLoading, setStartupLoading] = useState(false);
  const [startupError, setStartupError] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingVerificationUsers, setPendingVerificationUsers] = useState([]);
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
  const [showUserVerificationModal, setShowUserVerificationModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState(null); // 'approve' or 'reject'
  const [selectedUserForVerification, setSelectedUserForVerification] = useState(null);
  const [verificationComment, setVerificationComment] = useState('');
  const [userRejectionReason, setUserRejectionReason] = useState('');

  // Team management state
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamMemberForm, setTeamMemberForm] = useState({
    name: '',
    position: '',
    description: '',
    image: null
  });

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
      const userStatus = isSuspended ? 'suspended' : (isVerified ? 'active' : 'unverified');
      if (userStatus === 'active' || userStatus === 'suspended') {
        counts[userStatus]++;
      }
    });
    // Pending count comes from users who have submitted verification documents
    counts.pending = pendingVerificationUsers.length;
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



  const filteredUsers = (() => {
    // For pending tab, use pendingVerificationUsers (users who have submitted documents)
    if (activeTab === 'users' && userTab === 'pending') {
      return pendingVerificationUsers.filter(u => {
        // Search query filter
        const matchesSearch = !searchQuery || 
          (u.first_name && u.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (u.last_name && u.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Role filter
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        
        return matchesSearch && matchesRole;
      });
    }
    
    // For other tabs, use regular users
    return users.filter(u => {
      // Search query filter
      const matchesSearch = !searchQuery || 
        (u.first_name && u.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.last_name && u.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Role filter
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      
      // User status filter for tabs (only for non-pending tabs)
      if (activeTab === 'users') {
        // Handle both boolean and integer values for is_verified and is_suspended
        const isVerified = u.is_verified === true || u.is_verified === 1 || u.verification_status === 'verified';
        const isSuspended = u.is_suspended === true || u.is_suspended === 1;
        const userStatus = isSuspended ? 'suspended' : (isVerified ? 'active' : 'unverified');
        const matchesUserTab = userTab === userStatus;
        
        return matchesSearch && matchesRole && matchesUserTab;
      }
      
      // Report filters (for site performance)
      const matchesReportRole = !roleFilterReport || u.role === roleFilterReport;
      const matchesLocation = !locationFilter || u.location === locationFilter;
      const matchesIndustry = !industryFilter || u.industry === industryFilter;
      
      // For site performance tab, use report filters
      return matchesReportRole && matchesLocation && matchesIndustry;
    });
  })();
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

  // Fetch users with pending verification documents
  const fetchPendingVerificationUsers = async () => {
    try {
      const response = await fetch('/api/admin/verification/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch pending verification users');
      const data = await response.json();
      // Group documents by user_id and get unique users
      const userMap = new Map();
      data.forEach(doc => {
        if (!userMap.has(doc.user_id)) {
          userMap.set(doc.user_id, {
            id: doc.user_id,
            first_name: doc.first_name,
            last_name: doc.last_name,
            email: doc.email,
            role: doc.role,
            is_verified: doc.is_verified,
            verification_status: 'pending',
            verification_documents: []
          });
        }
        userMap.get(doc.user_id).verification_documents.push(doc);
      });
      setPendingVerificationUsers(Array.from(userMap.values()));
    } catch (err) {
      console.error('Error fetching pending verification users:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
      fetchPendingVerificationUsers();
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

  // Responsive sidebar effects
  useEffect(() => {
    // Close mobile sidebar when switching to desktop
    if (isDesktop) {
      setIsMobileSidebarOpen(false);
    }
  }, [isDesktop]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event) => {
      if (isMobileSidebarOpen && 
          !event.target.closest('.mobile-sidebar') && 
          !event.target.closest('.hamburger-btn')) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileSidebarOpen, isMobile]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen, isMobile]);

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
    setSelectedStartup({
      ...startup,
      documents: {
        businessPermit: startup.business_permit_url || null,
        secRegistration: startup.sec_registration_url || null
      }
    });
    setPendingStartupModalOpen(true);
  };

  // Add new function to handle document preview
  const handleDocumentPreview = (url) => {
    if (!url) return;
    
    // Check if it's a PDF
    if (url.toLowerCase().endsWith('.pdf')) {
      window.open(url, '_blank');
    } else {
      // For images, show in modal
      setPreviewDocument({
        url,
        isOpen: true
      });
    }
  };

  // Add state for document preview
  const [previewDocument, setPreviewDocument] = useState({ url: '', isOpen: false });

  // Add function to close preview
  const handleClosePreview = () => {
    setPreviewDocument({ url: '', isOpen: false });
  };

  // Modify the pending startup modal content
  const renderPendingStartupModal = () => {
    if (!selectedStartup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Verify Startup: {selectedStartup.name}</h2>
            <button
              onClick={handleClosePendingStartupModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Startup Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
              <div className="space-y-3">
                <p><span className="font-semibold">Industry:</span> {selectedStartup.industry}</p>
                <p><span className="font-semibold">Location:</span> {selectedStartup.location}</p>
                <p><span className="font-semibold">Full Address:</span> {selectedStartup.full_address || 'Not provided'}</p>
                <p><span className="font-semibold">Telephone:</span> {selectedStartup.telephone_number || 'Not provided'}</p>
                <p><span className="font-semibold">Stage:</span> {formatStartupStage(selectedStartup.startup_stage)}</p>
                <p><span className="font-semibold">Funding Stage:</span> {toTitleCase(selectedStartup.funding_stage)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact & Social Media</h3>
              <div className="space-y-3">
                <p>
                  <span className="font-semibold">Website:</span>{' '}
                  {selectedStartup.website ? (
                    <a href={selectedStartup.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  ) : 'Not provided'}
                </p>
                {selectedStartup.facebook_url && (
                  <p>
                    <span className="font-semibold">Facebook:</span>{' '}
                    <a href={selectedStartup.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Profile
                    </a>
                  </p>
                )}
                {selectedStartup.linkedin_url && (
                  <p>
                    <span className="font-semibold">LinkedIn:</span>{' '}
                    <a href={selectedStartup.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Profile
                    </a>
                  </p>
                )}
                {/* Add other social media links similarly */}
              </div>
            </div>
          </div>

          {/* Verification Documents */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4">Verification Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Permit */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Business Permit</h4>
                  {selectedStartup.documents.businessPermit ? (
                    <button
                      onClick={() => handleDocumentPreview(selectedStartup.documents.businessPermit)}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-eye"></i>
                      View Document
                    </button>
                  ) : (
                    <span className="text-red-500">Not Uploaded</span>
                  )}
                </div>
                {selectedStartup.documents.businessPermit && (
                  <p className="text-sm text-gray-500 break-all">{selectedStartup.documents.businessPermit}</p>
                )}
              </div>

              {/* SEC Registration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">SEC Registration</h4>
                  {selectedStartup.documents.secRegistration ? (
                    <button
                      onClick={() => handleDocumentPreview(selectedStartup.documents.secRegistration)}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-eye"></i>
                      View Document
                    </button>
                  ) : (
                    <span className="text-red-500">Not Uploaded</span>
                  )}
                </div>
                {selectedStartup.documents.secRegistration && (
                  <p className="text-sm text-gray-500 break-all">{selectedStartup.documents.secRegistration}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{selectedStartup.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => handleDeclineStartup(selectedStartup.id)}
              className="bg-red-100 text-red-600 px-6 py-2 rounded-lg hover:bg-red-200 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => handleAcceptStartup(selectedStartup.id)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add document preview modal
  const renderDocumentPreviewModal = () => {
    if (!previewDocument.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Document Preview</h3>
            <button
              onClick={handleClosePreview}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="relative w-full h-[70vh]">
            <img
              src={previewDocument.url}
              alt="Document Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    );
  };

  const handleClosePendingStartupModal = () => {
    setSelectedStartup(null);
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

  // Dynamic API URL that works for both localhost and network access
  const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    return `http://${window.location.hostname}:5000/api`;
  };

  const getBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return `http://${window.location.hostname}:5000`;
  };

  // Fetch dashboard analytics
  const fetchDashboardStats = () => {
    fetch(`${getApiUrl()}/admin/dashboard-stats`)
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
            case 'team':
              return (
                <div className="bg-white dark:bg-[#232323] rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Team Management</h2>
                    <button
                      onClick={() => {
                        setSelectedTeamMember(null);
                        setTeamMemberForm({ name: '', position: '', description: '', image: null });
                        setIsTeamModalOpen(true);
                      }}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      <FiPlus size={20} />
                      Add Team Member
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="bg-white dark:bg-[#232323] rounded-lg shadow-md overflow-hidden">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img 
                            src={member.image_url ? `${getBaseUrl()}${member.image_url}` : defaultAvatar}
                            alt={member.name}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              console.error('Image load error:', e.target.src);
                              e.target.onerror = null;
                              e.target.src = defaultAvatar;
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                          <p className="text-gray-600 dark:text-gray-300">{member.position}</p>
                          <p className="mt-2 text-gray-700 dark:text-gray-400">{member.description}</p>
                          <div className="mt-4 flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditTeamMember(member)}
                              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center gap-1"
                            >
                              <FiEdit2 size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTeamMember(member.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                            >
                              <FiTrash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Team Member Modal */}
                  {isTeamModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                          {selectedTeamMember ? 'Edit Team Member' : 'Add Team Member'}
                        </h2>
                        <form onSubmit={handleTeamMemberSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                            <input
                              type="text"
                              value={teamMemberForm.name}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                            <input
                              type="text"
                              value={teamMemberForm.position}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, position: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                              value={teamMemberForm.description}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                              rows="4"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                            <input
                              type="file"
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, image: e.target.files[0] })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                              accept="image/*"
                              {...(!selectedTeamMember && { required: true })}
                            />
                          </div>
                          <div className="flex justify-end space-x-2 mt-6">
                            <button
                              type="button"
                              onClick={() => {
                                setIsTeamModalOpen(false);
                                setSelectedTeamMember(null);
                                setTeamMemberForm({ name: '', position: '', description: '', image: null });
                              }}
                              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              {selectedTeamMember ? 'Save Changes' : 'Add Member'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              );
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
                  {/* Calendar Toggle Button - Only show on mobile/tablet */}
                  <div className="mb-4 md:hidden">
                    <button
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#232526] text-gray-700 dark:text-gray-200 rounded-lg shadow-sm border border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-[#2a2b2c] transition-colors"
                    >
                      <FiCalendar className="text-orange-500" />
                      <span>{showCalendar ? 'Hide Calendar' : 'Show Calendar'}</span>
                    </button>
                  </div>

                  {/* Calendar Section */}
                  <div className={`flex-1 min-w-0 ${showCalendar ? 'block' : 'hidden md:block'} transition-all duration-300`}>
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
                      <div className="grid grid-cols-7 gap-1 md:gap-2 min-w-[280px] md:min-w-[420px]">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                          <div key={day} className="text-center font-medium text-orange-700 py-2 text-[11px] md:text-base">
                            {window.innerWidth < 768 ? day.slice(0, 1) : day}
                          </div>
                        ))}
                        {monthMatrix.map((row, i) => (
                          <React.Fragment key={i}>
                            {row.map((day, j) => (
                              <div
                                key={`${i}-${j}`}
                                className={`aspect-square p-1 md:p-2 border border-orange-100 rounded-lg ${
                                  day && day.getMonth() === calendarDate.getMonth() ? 'bg-white' : 'bg-orange-50'
                                }`}
                                onClick={() => {
                                  if (day) {
                                    const dayEvents = getEventsForDate(day.toISOString().split('T')[0]);
                                    if (dayEvents.length > 0) {
                                      // Show a modal with all events for this day
                                      setSelectedDate(day);
                                      setSelectedDateEvents(dayEvents);
                                      setShowDayEventsModal(true);
                                    }
                                  }
                                }}
                              >
                                <div className="flex flex-col h-full">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs md:text-sm ${day && day.getMonth() === calendarDate.getMonth() ? 'text-orange-700' : 'text-gray-400'}`}>{day ? day.getDate() : ''}</span>
                                  </div>
                                  <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                                    {day && (() => {
                                      const dayEvents = getEventsForDate(day.toISOString().split('T')[0]);
                                      if (dayEvents.length === 0) return null;
                                      
                                      // On mobile, just show dots indicating events
                                      if (window.innerWidth < 768) {
                                        return (
                                          <div className="flex gap-0.5 mt-1">
                                            {dayEvents.slice(0, 3).map((_, idx) => (
                                              <div
                                                key={idx}
                                                className="w-1.5 h-1.5 rounded-full bg-orange-500"
                                                title={`${dayEvents.length} events today`}
                                              />
                                            ))}
                                            {dayEvents.length > 3 && (
                                              <span className="text-[8px] text-orange-500 font-medium">+{dayEvents.length - 3}</span>
                                            )}
                                          </div>
                                        );
                                      }
                                      
                                      // Desktop view remains the same with event titles
                                      return (
                                        <>
                                          {dayEvents.slice(0, 2).map(event => (
                                            <div
                                              key={event.id}
                                              className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 truncate cursor-pointer hover:bg-orange-200 transition w-full text-center"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditEvent(event);
                                              }}
                                              title={`${event.title} ${event.start_time ? `at ${event.start_time}` : ''}`}
                                            >
                                              {event.title}
                                            </div>
                                          ))}
                                          {dayEvents.length > 2 && (
                                            <div 
                                              className="text-[9px] px-1 py-0.5 rounded bg-orange-500 text-white cursor-pointer hover:bg-orange-600 transition w-full text-center font-medium"
                                              title={`${dayEvents.length} total events: ${dayEvents.map(e => e.title).join(', ')}`}
                                            >
                                              +{dayEvents.length - 2} more
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
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
                <div className={`flex flex-col gap-4 sm:gap-6 w-full min-w-0 border border-orange-100 dark:border-orange-700 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 ${darkMode ? 'bg-[#232323]' : 'bg-white'}`}> 
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

                  <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-black dark:text-white'>User Management</h1>
                  
                  {/* Tab Buttons */}
                  <div className="flex gap-1 sm:gap-2 mb-4 overflow-x-auto scrollbar-hide">
                    <button
                      className={`px-2 sm:px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${userTab === 'active' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setUserTab('active');
                        setSelectedUserIds([]);
                      }}
                    >
                      Active
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${userTab === 'active' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {userStatusCounts.active}
                      </span>
                    </button>
                    <button
                      className={`px-2 sm:px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${userTab === 'pending' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setUserTab('pending');
                        setSelectedUserIds([]);
                      }}
                    >
                      Pending
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${userTab === 'pending' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {userStatusCounts.pending}
                      </span>
                    </button>
                    <button
                      className={`px-2 sm:px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${userTab === 'suspended' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setUserTab('suspended');
                        setSelectedUserIds([]);
                      }}
                    >
                      Suspended
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${userTab === 'suspended' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {userStatusCounts.suspended}
                      </span>
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                      placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-lg px-4 py-3 w-full focus:outline-none border placeholder-gray-400 
                      bg-white text-black border-orange-300 
                     dark:bg-[#1b1b1b] dark:text-white dark:border-orange-700"
                      />
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-lg px-4 py-3 pr-8 focus:outline-none border w-full sm:w-auto
                       bg-white text-black border-orange-300 
                       dark:bg-[#1b1b1b] dark:text-white dark:border-orange-700"
                        >
                        <option value="all">All Roles</option>
                        <option value="admin">Administrator</option>
                        <option value="entrepreneur">Entrepreneur</option>
                        <option value="investor">Investor</option>
                      </select>
                    </div>
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

                  {/* Mobile/Desktop Table */}
                  <div className="bg-white dark:bg-[#1b1b1b] p-3 sm:p-4 lg:p-8 rounded-xl border border-orange-100 dark:border-orange-700 shadow-sm w-full">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : error ? (
                      <div className="text-red-500 text-center py-8 text-sm sm:text-base">{error}</div>
                    ) : (
                      <>
                        {/* Mobile Card Layout */}
                        <div className="block lg:hidden space-y-4">
                          {filteredUsers.length === 0 ? (
                            <div className="text-center text-gray-400 py-8 text-sm">
                              No {userTab} users found.
                            </div>
                          ) : (
                            filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                className="bg-white rounded-lg border border-orange-100 shadow-sm p-4 mb-3"
                                onClick={() => { setSelectedUserModal(user); setShowUserDetailsModal(true); }}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedUserIds.includes(user.id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleSelectUser(user.id, e.target.checked);
                                      }}
                                      className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                      <div className="font-medium text-black dark:text-white text-sm">
                                        {(user.first_name && user.last_name && `${user.first_name} ${user.last_name}`) ||
                                        user.full_name || user.email}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                  </div>
                                  <div onClick={e => e.stopPropagation()}>
                                    {userTab === 'pending' ? (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => viewUserVerificationDocuments(user)}
                                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                          title="View Documents"
                                        >
                                          <FiEye className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => openVerificationModal(user, 'approve')}
                                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                          title="Verify User"
                                        >
                                          <FiCheck className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => openVerificationModal(user, 'reject')}
                                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                          title="Reject Verification"
                                        >
                                          <FiX className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => viewUserVerificationDocuments(user)}
                                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                          title="View Documents"
                                        >
                                          <FiEye className="w-3 h-3" />
                                        </button>
                                        {renderUserActionDropdown(user)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Role:</span>
                                    <div className="font-medium text-black dark:text-white">
                                      {roleLabels[user.role] || user.role}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                    <div className="font-medium text-black dark:text-white">{user.location || 'N/A'}</div>
                                  </div>
                                </div>
                                
                                <div className="mt-3 flex justify-between items-center">
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">Status:</span>
                                    <div className="mt-1">{renderUserStatusBadge(user)}</div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden lg:block overflow-x-auto w-full rounded-lg">
                          <table className="min-w-full w-full table-fixed divide-y divide-orange-100">
                          <thead>
                            <tr className="bg-orange-100">
                                <th className="px-4 py-3 font-semibold w-[50px] text-xs xl:text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                                  onChange={(e) => handleSelectAllUsers(e.target.checked)}
                                  className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                />
                              </th>
                                <th className="px-4 py-3 font-semibold w-[200px] text-xs xl:text-sm">Name</th>
                                <th className="px-4 py-3 font-semibold w-[200px] text-xs xl:text-sm">Email</th>
                                <th className="px-4 py-3 font-semibold w-[120px] text-xs xl:text-sm">Role</th>
                                <th className="px-4 py-3 font-semibold w-[120px] text-xs xl:text-sm">Location</th>
                                <th className="px-4 py-3 font-semibold w-[100px] text-xs xl:text-sm">Status</th>
                                <th className="px-4 py-3 font-semibold w-[110px] text-center text-xs xl:text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-[#1b1b1b] divide-y divide-orange-100">
                            {filteredUsers.length === 0 ? (
                              <tr>
                                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm lg:text-base">
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
                                  <td className="px-4 py-3 w-[50px]" onClick={e => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={selectedUserIds.includes(user.id)}
                                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                      className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                    />
                                  </td>
                                  
                                  <td className="px-4 py-3 w-[200px] truncate overflow-hidden whitespace-nowrap">
                                      <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">
                          {(user.first_name && user.last_name && `${user.first_name} ${user.last_name}`) ||
                          user.full_name || user.email}
                                    </div>
                          </td>
                                  
                                  <td className="px-4 py-3 w-[200px] truncate overflow-hidden whitespace-nowrap">
                                      <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{user.email}</div>
                          </td>
                                  
                                  <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                                      <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">
                          {roleLabels[user.role] || user.role}
                                    </div>
                          </td>
                                  
                                  <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                                      <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{user.location || 'N/A'}</div>
                            </td>
                                  
                                  <td className="px-4 py-3 w-[100px] truncate overflow-hidden whitespace-nowrap">
                                    {renderUserStatusBadge(user)}
                                  </td>
                                  
                                  <td className="px-4 py-3 w-[110px] text-center" onClick={e => e.stopPropagation()}>
                                    {userTab === 'pending' ? (
                                      <div className="flex gap-1 justify-center">
                                        <button
                                          onClick={() => viewUserVerificationDocuments(user)}
                                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                          title="View Documents"
                                        >
                                          <FiEye className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => openVerificationModal(user, 'approve')}
                                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                          title="Verify User"
                                        >
                                          <FiCheck className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => openVerificationModal(user, 'reject')}
                                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                          title="Reject Verification"
                                        >
                                          <FiX className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-1 justify-center">
                                        <button
                                          onClick={() => viewUserVerificationDocuments(user)}
                                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                          title="View Documents"
                                        >
                                          <FiEye className="w-3 h-3" />
                                        </button>
                                        {renderUserActionDropdown(user)}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      </>
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
                <div className="bg-white dark:bg-[#1b1b1b] p-6 rounded-xl border border-orange-100 dark:border-orange-700 shadow-sm w-full">
                  <h1 className='text-3xl font-bold mb-6 text-black dark:text-white'>Settings</h1>
                  {renderSettingsNav()}
                  {renderAdminSettingsContent()}
                </div>
              );
case 'sitePerformance':
  return (
    <div className={`flex flex-col gap-6 w-full border-2 border-orange-400 dark:border-orange-700 rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-[#232323]' : 'bg-white'}`}> 
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full sm:w-auto border rounded px-2 py-1 pr-6">
          <option value="startups">Startups</option>
          <option value="users">Users</option>
        </select>
        <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} className="w-full sm:w-auto border rounded px-2 py-1 pr-6">
          <option value="">All Industries</option>
          {allIndustries.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="w-full sm:w-auto border rounded px-2 py-1 pr-6">
          <option value="">All Locations</option>
          {allLocations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        {reportType === 'users' && (
          <select value={roleFilterReport} onChange={e => setRoleFilterReport(e.target.value)} className="w-full sm:w-auto border rounded px-2 py-1 pr-6">
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

      {/* Mobile/Desktop Content */}
      <div className="bg-white dark:bg-[#1b1b1b] p-3 sm:p-4 lg:p-8 rounded-xl border border-orange-100 dark:border-orange-700 shadow-sm w-full">
        {(reportType === 'startups' ? filteredStartups : filteredUsers).length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No results found.
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block lg:hidden space-y-4">
              {(reportType === 'startups' ? filteredStartups : filteredUsers).map(item => (
                <div
                  key={item.startup_id || item.id}
                  className="bg-white rounded-lg border border-orange-100 shadow-sm p-4 mb-3"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-black dark:text-white text-sm mb-1">
                        {item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.full_name || item.email}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {reportType === 'startups' ? item.industry : item.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Industry:</span>
                      <div className="font-medium text-black dark:text-white">{item.industry || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Location:</span>
                      <div className="font-medium text-black dark:text-white">{item.location || 'N/A'}</div>
                    </div>
                    {reportType === 'startups' && (
                      <>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Founder:</span>
                          <div className="font-medium text-black dark:text-white">{item.entrepreneur_name || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Stage:</span>
                          <div className="font-medium text-black dark:text-white">{formatStartupStage(item.startup_stage) || 'N/A'}</div>
                        </div>
                      </>
                    )}
                    {reportType === 'users' && (
                      <>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Role:</span>
                          <div className="font-medium text-black dark:text-white">{roleLabels[item.role] || item.role || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Status:</span>
                          <div className="font-medium text-black dark:text-white">{renderUserStatusBadge(item)}</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {reportType === 'startups' && item.approval_status && (
                    <div className="mt-3 flex justify-between items-center">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Status:</span>
                        <div className="mt-1">{renderStatusBadge(item.approval_status)}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block overflow-x-auto w-full rounded-lg">
              <table className="min-w-full w-full table-fixed divide-y divide-orange-100">
          <thead>
            <tr className="bg-orange-100">
                    <th className="px-4 py-3 font-semibold w-[180px] text-xs xl:text-sm">Name</th>
                    <th className="px-4 py-3 font-semibold w-[180px] text-xs xl:text-sm">Industry</th>
                    <th className="px-4 py-3 font-semibold w-[120px] text-xs xl:text-sm">{reportType === 'startups' ? 'Founder' : 'Role'}</th>
                    <th className="px-4 py-3 font-semibold w-[120px] text-xs xl:text-sm">Location</th>
                    <th className="px-4 py-3 font-semibold w-[120px] text-center text-xs xl:text-sm">{reportType === 'startups' ? 'Stage' : 'Email'}</th>
                    <th className="px-4 py-3 font-semibold w-[100px] text-xs xl:text-sm">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#1b1b1b] divide-y divide-orange-100">
                  {(reportType === 'startups' ? filteredStartups : filteredUsers).map(item => (
                <tr key={item.startup_id || item.id} className="group border-b border-orange-100 hover:bg-orange-50 dark:hover:bg-white transition cursor-pointer">
                  {/* Name */}
                  <td className="px-4 py-3 w-[180px] truncate overflow-hidden whitespace-nowrap">
                        <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">
                          {item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.full_name || item.email}
                        </div>
                  </td>

                  {/* Industry */}
                      <td className="px-4 py-3 w-[180px] truncate overflow-hidden whitespace-nowrap">
                        <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.industry || 'N/A'}</div>
                  </td>

                      {/* Founder/Role */}
                      <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                        <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">
                          {reportType === 'startups' ? (item.entrepreneur_name || 'N/A') : (roleLabels[item.role] || item.role || 'N/A')}
                        </div>
                  </td>

                  {/* Location */}
                      <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                        <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{item.location || 'N/A'}</div>
                  </td>

                      {/* Stage/Email */}
                      <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap text-center">
                        <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">
                          {reportType === 'startups' ? (formatStartupStage(item.startup_stage) || 'N/A') : (item.email || 'N/A')}
                        </div>
                  </td>

                  {/* Status */}
                      <td className="px-4 py-3 w-[100px] truncate overflow-hidden whitespace-nowrap">
                        {reportType === 'startups' ? renderStatusBadge(item.approval_status) : renderUserStatusBadge(item)}
                  </td>
                </tr>
                  ))}
          </tbody>
        </table>
            </div>
          </>
        )}
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

                  <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-black dark:text-white'>Startup Management</h1>
                  
                  {/* Tab Buttons */}
                  <div className="flex gap-1 sm:gap-2 mb-4 overflow-x-auto scrollbar-hide">
                    <button
                      className={`px-2 sm:px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${startupTab === 'approved' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setStartupTab('approved');
                        setSelectedStartupIds([]);
                      }}
                    >
                      Approved
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${startupTab === 'approved' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {startupStatusCounts.approved}
                      </span>
                    </button>
                    <button
                      className={`px-2 sm:px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${startupTab === 'pending' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setStartupTab('pending');
                        setSelectedStartupIds([]);
                      }}
                    >
                      Pending
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${startupTab === 'pending' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {startupStatusCounts.pending}
                      </span>
                    </button>
                    <button
                      className={`px-2 sm:px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${startupTab === 'suspended' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 bg-white hover:bg-orange-50'}`}
                      onClick={() => {
                        setStartupTab('suspended');
                        setSelectedStartupIds([]);
                      }}
                    >
                      Suspended
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${startupTab === 'suspended' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
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
                  {/* Mobile/Desktop Table */}
                  <div className="bg-white dark:bg-[#1b1b1b] p-3 sm:p-4 lg:p-8 rounded-xl border border-orange-100 dark:border-orange-700 shadow-sm w-full">
                    {startupLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : startupError ? (
                      <div className="text-red-500 text-center py-8 text-sm sm:text-base">{startupError}</div>
                    ) : (
                      <>
                        {/* Mobile Card Layout */}
                        <div className="block lg:hidden space-y-4">
                          {startups.filter(startup => startup.approval_status === startupTab).length === 0 ? (
                            <div className="text-center text-gray-400 py-8 text-sm">
                              No {startupTab === 'pending' ? 'pending' : startupTab === 'suspended' ? 'suspended' : 'approved'} startups found.
                            </div>
                          ) : (
                            startups.filter(startup => startup.approval_status === startupTab).map((startup) => (
                              <div
                                key={startup.startup_id}
                                className="bg-white rounded-lg border border-orange-100 shadow-sm p-4 mb-3"
                                onClick={() => { setSelectedStartupModal(startup); setStartupModalOpen(true); }}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedStartupIds.includes(startup.startup_id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleSelectStartup(startup.startup_id, e.target.checked);
                                      }}
                                      className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-black dark:text-white text-sm mb-1">
                                        {startup.name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{startup.industry}</div>
                                    </div>
                                  </div>
                                  <div onClick={e => e.stopPropagation()}>
                                    {startupTab === 'pending' ? (
                                      <div className="flex gap-1">
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
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Founder:</span>
                                    <div className="font-medium text-black dark:text-white">
                                      {startup.entrepreneur_name || 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                    <div className="font-medium text-black dark:text-white">{startup.location || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Stage:</span>
                                    <div className="font-medium text-black dark:text-white">
                                      {formatStartupStage(startup.startup_stage) || 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                    <div className="mt-1">{renderStatusBadge(startup.approval_status)}</div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden lg:block overflow-x-auto w-full rounded-lg">
                          <table className="min-w-full w-full table-fixed divide-y divide-orange-100">
                          <thead>
                            <tr className="bg-orange-100">
                                <th className="px-4 py-3 font-semibold w-[50px] text-xs xl:text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedStartupIds.length === startups.filter(startup => startup.approval_status === startupTab).length && startups.filter(startup => startup.approval_status === startupTab).length > 0}
                                  onChange={(e) => handleSelectAllStartups(e.target.checked)}
                                  className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                />
                              </th>
                                <th className="px-4 py-3 font-semibold w-[160px] text-xs xl:text-sm">Name</th>
                                <th className="px-4 py-3 font-semibold w-[160px] text-xs xl:text-sm">Industry</th>
                                <th className="px-4 py-3 font-semibold w-[120px] text-xs xl:text-sm">Founder</th>
                                <th className="px-4 py-3 font-semibold w-[120px] text-xs xl:text-sm">Location</th>
                                <th className="px-4 py-3 font-semibold w-[100px] text-center text-xs xl:text-sm">Stage</th>
                                <th className="px-4 py-3 font-semibold w-[100px] text-xs xl:text-sm">Status</th>
                                <th className="px-4 py-3 font-semibold w-[120px] text-center text-xs xl:text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-[#1b1b1b] divide-y divide-orange-100">
                            {startups.filter(startup => startup.approval_status === startupTab).length === 0 ? (
                              <tr>
                                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm lg:text-base">No {startupTab === 'pending' ? 'pending' : startupTab === 'suspended' ? 'suspended' : 'approved'} startups found.</td>
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
                                      <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.name}</div>
                                  </td>
                                  
                                  {/* Industry */}
                                  <td className="px-4 py-3 w-[160px] truncate overflow-hidden whitespace-nowrap">
                                      <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.industry}</div>
                                  </td>
                                  
                                  {/* Founder */}
                                  <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                                      <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.entrepreneur_name}</div>
                                  </td>
                                  
                                  {/* Location */}
                                  <td className="px-4 py-3 w-[120px] truncate overflow-hidden whitespace-nowrap">
                                      <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{startup.location}</div>
                                  </td>
                                  
                                  {/* Stage */}
                                  <td className="px-4 py-3 w-[100px] truncate overflow-hidden whitespace-nowrap text-center">
                                      <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{formatStartupStage(startup.startup_stage)}</div>
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
                      </>
                    )}
                  </div>
                </div>
              );
            case 'tickets':
              // Add these mappings at the top of the Tickets section (before the return):
              const ticketStatusOptions = [
                { value: 'All Status', label: 'All Status' },
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' },
              ];
              const ticketTypeOptions = [
                { value: 'All Types', label: 'All Types' },
                { value: 'bug', label: 'Bug' },
                { value: 'suggestion', label: 'Suggestion' },
                { value: 'other', label: 'Other' },
              ];

              // Filtering and sorting logic
              const filteredTickets = tickets
                .filter(ticket =>
                  (ticketStatusFilter === 'All Status' || ticket.status === ticketStatusFilter) &&
                  (ticketTypeFilter === 'All Types' || ticket.type === ticketTypeFilter) &&
                  (
                    (ticket.title && ticket.title.toLowerCase().includes(ticketSearch.toLowerCase())) ||
                    (ticket.ticket_id && ticket.ticket_id.toString().includes(ticketSearch))
                  )
                )
                .sort((a, b) => {
                  if (ticketSort === 'Newest') {
                    return new Date(b.created_at) - new Date(a.created_at);
                  } else {
                    return new Date(a.created_at) - new Date(b.created_at);
                  }
                });
              return (
                <div className="flex flex-col gap-6">
                  {activeTab === 'tickets' && (
                    <h1 className='text-3xl font-bold mb-6 text-black dark:text-white'>Support Tickets</h1>
                  )}
                  {/* Ticket Filters & Sorting */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <select
                      value={ticketStatusFilter}
                      onChange={e => setTicketStatusFilter(e.target.value)}
                      className="w-full sm:w-auto border rounded px-2 py-1 pr-6"
                    >
                      {ticketStatusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <select
                      value={ticketTypeFilter}
                      onChange={e => setTicketTypeFilter(e.target.value)}
                      className="w-full sm:w-auto border rounded px-2 py-1 pr-6"
                    >
                      {ticketTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <select
                      value={ticketSort}
                      onChange={e => setTicketSort(e.target.value)}
                      className="w-full sm:w-auto border rounded px-2 py-1 pr-6"
                    >
                      <option value="Newest">Newest</option>
                      <option value="Oldest">Oldest</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={ticketSearch}
                      onChange={e => setTicketSearch(e.target.value)}
                      className="w-full sm:w-auto border rounded px-2 py-1"
                    />
                  </div>
                  <div className="bg-white dark:bg-[#1b1b1b] p-3 sm:p-4 lg:p-8 rounded-xl border border-orange-100 dark:border-orange-700 shadow-sm w-full">
                    {ticketsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : ticketsError ? (
                      <div className="text-red-500 text-center py-8 text-sm sm:text-base">{ticketsError}</div>
                    ) : filteredTickets.length === 0 ? (
                      <div className="text-center text-gray-400 py-8 text-sm">No tickets found.</div>
                    ) : (
                      <>
                        {/* Mobile Card Layout */}
                        <div className="block lg:hidden space-y-4">
                          {filteredTickets.map(ticket => (
                            <React.Fragment key={ticket.ticket_id}>
                              <div className="bg-white rounded-lg border border-orange-100 shadow-sm p-4 mb-3">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-black dark:text-white text-sm mb-1">
                                      #{ticket.ticket_id} - {ticket.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Submitted by User #{ticket.user_id}
                                    </div>
                                  </div>
                                  <button
                                    className="px-2 py-1 bg-orange-200 text-orange-800 rounded hover:bg-orange-300 text-xs font-medium"
                                    onClick={() => {
                                      setEditingTicket(ticket.ticket_id);
                                      setAdminResponse(ticket.admin_response || '');
                                      setAdminNotes(ticket.admin_notes || '');
                                      setUpdateMessage('');
                                    }}
                                  >
                                    Respond
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                    <div className="font-medium text-black dark:text-white">
                                      {toTitleCase(ticket.type)}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                    <div className="font-medium text-black dark:text-white">
                                      {toTitleCase(ticket.status)}
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                    <div className="font-medium text-black dark:text-white">
                                      {new Date(ticket.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                
                                {(ticket.admin_response || ticket.admin_notes) && (
                                  <div className="border-t border-gray-200 pt-2 mt-2">
                                    {ticket.admin_response && (
                                      <div className="text-xs mb-1">
                                        <span className="text-gray-500 dark:text-gray-400">Response:</span>
                                        <div className="text-black dark:text-white">{ticket.admin_response}</div>
                                      </div>
                                    )}
                                    {ticket.admin_notes && (
                                      <div className="text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                                        <div className="text-black dark:text-white">{ticket.admin_notes}</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {editingTicket === ticket.ticket_id && (
                                <div className="bg-orange-50 dark:bg-[#2a2a2a] rounded-lg p-4 mb-3">
                                  <div className="flex flex-col gap-2">
                                    <textarea
                                      className="w-full border border-gray-300 dark:border-orange-700 bg-white dark:bg-[#232323] text-black dark:text-white rounded px-3 py-2 mb-2 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                      placeholder="Admin Response"
                                      value={adminResponse}
                                      onChange={e => setAdminResponse(e.target.value)}
                                      rows={3}
                                    />
                                    <textarea
                                      className="w-full border border-gray-300 dark:border-orange-700 bg-white dark:bg-[#232323] text-black dark:text-white rounded px-3 py-2 mb-2 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                      placeholder="Admin Notes"
                                      value={adminNotes}
                                      onChange={e => setAdminNotes(e.target.value)}
                                      rows={2}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm font-medium"
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
                                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                                        onClick={() => setEditingTicket(null)}
                                      >Cancel</button>
                                    </div>
                                    {updateMessage && <div className="text-sm text-orange-700 dark:text-orange-400 mt-2">{updateMessage}</div>}
                                  </div>
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden lg:block overflow-x-auto w-full rounded-lg">
                          <div className="overflow-x-auto max-h-[calc(100vh-300px)]">
                            <table className="min-w-full w-full divide-y divide-orange-100">
                              <thead>
                                <tr className="bg-orange-100 text-orange-700">
                                  <th className="px-3 py-2 font-semibold w-16 text-xs xl:text-sm sticky top-0 bg-orange-100">ID</th>
                                  <th className="px-3 py-2 font-semibold w-40 text-xs xl:text-sm sticky top-0 bg-orange-100">Title</th>
                                  <th className="px-3 py-2 font-semibold w-24 text-xs xl:text-sm sticky top-0 bg-orange-100">Type</th>
                                  <th className="px-3 py-2 font-semibold w-24 text-xs xl:text-sm sticky top-0 bg-orange-100">Status</th>
                                  <th className="px-3 py-2 font-semibold w-20 text-xs xl:text-sm sticky top-0 bg-orange-100">User ID</th>
                                  <th className="px-3 py-2 font-semibold w-28 text-xs xl:text-sm sticky top-0 bg-orange-100">Created</th>
                                  <th className="px-3 py-2 font-semibold w-32 text-xs xl:text-sm sticky top-0 bg-orange-100">Response</th>
                                  <th className="px-3 py-2 font-semibold w-32 text-xs xl:text-sm sticky top-0 bg-orange-100">Notes</th>
                                  <th className="px-3 py-2 font-semibold w-20 text-center text-xs xl:text-sm sticky top-0 bg-orange-100">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-[#1b1b1b] divide-y divide-orange-100">
                                {filteredTickets.length === 0 ? (
                                  <tr>
                                    <td colSpan={9} className="px-3 py-8 text-center text-gray-400 text-sm">No tickets found.</td>
                                  </tr>
                                ) : (
                                  filteredTickets.map(ticket => (
                                    <React.Fragment key={ticket.ticket_id}>
                                      <tr className="group border-b border-orange-100 hover:bg-orange-50 dark:hover:bg-white transition">
                                        <td className="px-3 py-2 w-16 truncate">
                                          <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600">#{ticket.ticket_id}</div>
                                        </td>
                                        <td className="px-3 py-2 w-40">
                                          <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{ticket.title}</div>
                                        </td>
                                        <td className="px-3 py-2 w-24">
                                          <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{toTitleCase(ticket.type)}</div>
                                        </td>
                                        <td className="px-3 py-2 w-24">
                                          <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{toTitleCase(ticket.status)}</div>
                                        </td>
                                        <td className="px-3 py-2 w-20">
                                          <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{ticket.user_id}</div>
                                        </td>
                                        <td className="px-3 py-2 w-28">
                                          <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{new Date(ticket.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-3 py-2 w-32">
                                          <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{ticket.admin_response || ''}</div>
                                        </td>
                                        <td className="px-3 py-2 w-32">
                                          <div className="text-xs xl:text-sm font-medium text-black dark:text-white group-hover:text-orange-600 truncate">{ticket.admin_notes || ''}</div>
                                        </td>
                                        <td className="px-3 py-2 w-20 text-center">
                                          <button
                                            className="px-2 py-1 bg-orange-200 text-orange-800 rounded hover:bg-orange-300 text-xs font-medium"
                                            onClick={() => {
                                              setEditingTicket(ticket.ticket_id);
                                              setAdminResponse(ticket.admin_response || '');
                                              setAdminNotes(ticket.admin_notes || '');
                                              setUpdateMessage('');
                                            }}
                                          >Respond</button>
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
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
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
  const handleVerifyUser = async (userId, comment = '') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verification_comment: comment })
      });

      if (!res.ok) throw new Error('Failed to verify user');

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_verified: true, verification_status: 'verified' }
          : u
      ));
      
      // Remove from pending verification users
      setPendingVerificationUsers(pendingVerificationUsers.filter(u => u.id !== userId));
      
      setUserActionNotification({ type: 'success', message: 'User verified successfully' });
      setTimeout(() => setUserActionNotification(null), 3000);
    } catch (error) {
      setUserActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setUserActionNotification(null), 3000);
    }
  };

  const handleRejectUser = async (userId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: reason })
      });

      if (!res.ok) throw new Error('Failed to reject user verification');

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_verified: false, verification_status: 'not approved' }
          : u
      ));
      
      // Remove from pending verification users
      setPendingVerificationUsers(pendingVerificationUsers.filter(u => u.id !== userId));
      
      setUserActionNotification({ type: 'success', message: 'User verification rejected' });
      setTimeout(() => setUserActionNotification(null), 3000);
    } catch (error) {
      setUserActionNotification({ type: 'error', message: error.message });
      setTimeout(() => setUserActionNotification(null), 3000);
    }
  };

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
      fetchPendingVerificationUsers();
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

  // Handle verification modal actions
  const openVerificationModal = (user, action) => {
    setSelectedUserForVerification(user);
    setVerificationAction(action);
    setVerificationComment('');
    setUserRejectionReason('');
    setShowUserVerificationModal(true);
  };

  const viewUserVerificationDocuments = async (user) => {
    try {
      // Fetch user's verification documents
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${user.id}/verification-documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Add verification documents to user object
        const userWithDocs = {
          ...user,
          verification_documents: data.documents || []
        };
        setSelectedUserModal(userWithDocs);
        setShowUserDetailsModal(true);
      } else {
        console.error('Failed to fetch verification documents');
        // Still show modal even if documents can't be fetched
        setSelectedUserModal(user);
        setShowUserDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching verification documents:', error);
      // Still show modal even if documents can't be fetched
      setSelectedUserModal(user);
      setShowUserDetailsModal(true);
    }
  };

  const handleVerificationModalSubmit = async () => {
    try {
      if (verificationAction === 'approve') {
        await handleVerifyUser(selectedUserForVerification.id, verificationComment);
      } else if (verificationAction === 'reject') {
        if (!userRejectionReason.trim()) {
          setUserActionNotification({ type: 'error', message: 'Rejection reason is required' });
          return;
        }
        await handleRejectUser(selectedUserForVerification.id, userRejectionReason);
      }
      
      // Close modal and reset state
      setShowUserVerificationModal(false);
      setSelectedUserForVerification(null);
      setVerificationAction(null);
      setVerificationComment('');
      setUserRejectionReason('');
    } catch (error) {
      // Error is already handled in the individual functions
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
        <BsThreeDots className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );

  // Render user action dropdown
  const renderUserActionDropdown = (user) => (
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
      <BsThreeDots className="w-4 h-4 text-gray-600 dark:text-gray-300" />
    </button>
  );

  // Render user dropdown as a separate component positioned fixed
  const renderUserActionDropdownPortal = () => {
    if (!showUserActionDropdown) return null;
    
    const user = users.find(u => u.id === showUserActionDropdown);
    if (!user) return null;

    // Check if user is pending verification
    const isVerified = user.is_verified === true || user.is_verified === 1 || user.verification_status === 'verified';
    const isSuspended = user.is_suspended === true || user.is_suspended === 1;
    const isPending = !isVerified && !isSuspended;

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
          <HiOutlineDocumentText className="w-4 h-4" />
          View Details
        </button>

        {/* Verification actions for pending users */}
        {isPending && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openVerificationModal(user, 'approve');
                setShowUserActionDropdown(null);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 dark:hover:bg-green-800 flex items-center gap-2 text-green-600"
            >
              <FiCheck className="w-4 h-4" />
              Verify User
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openVerificationModal(user, 'reject');
                setShowUserActionDropdown(null);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-800 flex items-center gap-2 text-red-600"
            >
              <FiX className="w-4 h-4" />
              Reject Verification
            </button>
          </>
        )}
        
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
          <HiOutlineLocationMarker className="w-4 h-4" />
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
          <MdOutlineEvent className="w-4 h-4" />
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
            <MdEventAvailable className="w-4 h-4" />
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

  // Settings content is now rendered by renderAdminSettingsContent

  const navigate = useNavigate();

  // Add this effect to redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/settings');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Force light mode on logout
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taraki-dark-mode', 'false');
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
    }
    navigate('/');
  };

  // Ticket modal handlers
  const handleTicketChange = (e) => {
    setTicketForm({ ...ticketForm, [e.target.name]: e.target.value });
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${getApiUrl()}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketForm)
      });
      
      if (response.ok) {
        setTicketMessage('Ticket submitted successfully!');
        setTicketForm({ title: '', description: '', type: 'bug' });
        setShowTicketModal(false);
      } else {
        setTicketMessage('Failed to submit ticket.');
      }
    } catch (error) {
      setTicketMessage('Error submitting ticket.');
    }
  };

  const [showCalendar, setShowCalendar] = useState(window.innerWidth >= 768); // Add this state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);

  // Password management state and handlers
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState('');

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSave = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMessage('New passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new
        })
      });

      if (response.ok) {
        setPasswordMessage('Password changed successfully!');
        setPasswordForm({ current: '', new: '', confirm: '' });
      } else {
        const data = await response.json();
        setPasswordMessage(data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage('An error occurred while changing password.');
    }
  };

  // Settings tabs configuration
  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser className="text-lg" /> },
    { id: 'security', label: 'Security', icon: <FaLock className="text-lg" /> },
    { id: 'help', label: 'Help & Support', icon: <FaQuestionCircle className="text-lg" /> }
  ];

  // Settings tab navigation
  const renderSettingsNav = () => (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-4" aria-label="Settings tabs">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSettingsTab(tab.id)}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
              settingsTab === tab.id
                ? 'border-orange-500 text-orange-600 dark:text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderAdminSettingsContent = () => {
    switch (settingsTab) {
      case 'profile':
        return (
          <div className="space-y-4">
            {renderProfilePhoto()}
            {profileMessage && <Message type={profileMessage.includes('successfully') ? 'success' : 'error'} message={profileMessage} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={user?.first_name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={user?.last_name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <input
                  type="text"
                  value="Administrator"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="current"
                    value={passwordForm.current}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    name="new"
                    value={passwordForm.new}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm"
                    value={passwordForm.confirm}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <button
                  onClick={handlePasswordSave}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Update Password
                </button>
                {passwordMessage && <Message type={passwordMessage.includes('success') ? 'success' : 'error'} message={passwordMessage} />}
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Help & Support</h3>
              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-base font-medium text-orange-800 dark:text-orange-400 mb-2">Submit Support Ticket</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Need help? Submit a ticket and our support team will assist you.</p>
                  <button
                    onClick={() => setShowTicketModal(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                  >
                    Submit Ticket
                  </button>
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">Documentation</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-orange-500 hover:text-orange-600 text-sm">Admin Guide</a>
                    </li>
                    <li>
                      <a href="#" className="text-orange-500 hover:text-orange-600 text-sm">FAQs</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Add profile photo state and handler
  const [profileMessage, setProfileMessage] = useState('');

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setProfileMessage('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage('File size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await updateProfilePhoto(formData);
      setProfileMessage('Profile photo updated successfully!');
      
      // Update local user state with new photo
      setUser(prev => ({
        ...prev,
        profile_image: response.profile_image
      }));
    } catch (error) {
      setProfileMessage(error.message || 'Failed to update profile photo.');
    }
  };

  const renderProfilePhoto = () => (
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
      {user?.profile_image ? (
        <img
          src={user.profile_image}
          alt={`${user.first_name} ${user.last_name}`}
          className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl">
          {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'A'}
        </div>
      )}
      <div className="flex flex-col space-y-2 w-full sm:w-auto">
        <label className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors cursor-pointer text-center text-sm sm:text-base">
          Change Photo
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </label>
        <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">Max file size: 5MB</span>
      </div>
    </div>
  );

  // Add useEffect for initial data loading
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUsers(),
          fetchStartups(),
          fetchEvents(),
          fetchDashboardStats(),
          fetchPendingVerificationUsers()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Add useEffect for user tab changes
  useEffect(() => {
    const loadTabData = async () => {
      try {
        setLoading(true);
        if (userTab === 'pending') {
          await fetchPendingVerificationUsers();
        } else {
          await fetchUsers();
        }
      } catch (error) {
        console.error('Error loading tab data:', error);
        setError('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    loadTabData();
  }, [userTab]);

  // Add useEffect for search and filter
  useEffect(() => {
    const loadFilteredData = async () => {
      try {
        setLoading(true);
        await fetchUsers();
      } catch (error) {
        console.error('Error loading filtered data:', error);
        setError('Failed to apply filters.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadFilteredData, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, roleFilter]);

  // Add error display component
  const renderError = () => {
    if (!error) return null;
    return (
      <div className="fixed top-24 right-8 z-50 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg shadow-lg animate-fadeIn">
        <div className="flex items-center justify-between">
          <span>{error}</span>
          <button 
            className="ml-4 text-lg font-semibold hover:opacity-70"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  // Add loading indicator
  const renderLoading = () => {
    if (!loading) return null;
    return (
      <div className="fixed top-24 right-8 z-50 p-4 bg-white dark:bg-[#232323] border border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200 rounded-lg shadow-lg animate-fadeIn">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  };



  // Add these functions inside the AdminDashboard component
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/team`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch team members');
      setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleTeamMemberSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', teamMemberForm.name);
    formData.append('position', teamMemberForm.position);
    formData.append('description', teamMemberForm.description);
    if (teamMemberForm.image) {
      formData.append('image', teamMemberForm.image);
    }

    try {
      const url = selectedTeamMember 
        ? `${getApiUrl()}/team/${selectedTeamMember.id}`
        : `${getApiUrl()}/team`;

      const response = await fetch(url, {
        method: selectedTeamMember ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save team member');

      fetchTeamMembers();
      setIsTeamModalOpen(false);
      setSelectedTeamMember(null);
      setTeamMemberForm({ name: '', position: '', description: '', image: null });
    } catch (error) {
      console.error('Error saving team member:', error);
      alert(error.message || 'Failed to save team member. Please try again.');
    }
  };

  const handleDeleteTeamMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch(`${getApiUrl()}/team/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete team member');

        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert(error.message || 'Failed to delete team member. Please try again.');
      }
    }
  };

  const handleEditTeamMember = (member) => {
    setSelectedTeamMember(member);
    setTeamMemberForm({
      name: member.name,
      position: member.position,
      description: member.description,
      image: null
    });
    setIsTeamModalOpen(true);
  };

  // Add this to your useEffect that loads initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUsers(),
          fetchPendingVerificationUsers(),
          fetchStartups(),
          fetchEvents(),
          fetchTeamMembers(),
          fetchDashboardStats()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Add this to your renderContent function
  const renderTeamManagement = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Team Management</h2>
        <button
          onClick={() => {
            setSelectedTeamMember(null);
            setTeamMemberForm({ name: '', position: '', description: '', image: null });
            setIsTeamModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white dark:bg-[#232323] rounded-lg shadow-md overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={member.image_url ? `${getBaseUrl()}${member.image_url}` : defaultAvatar}
                alt={member.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  console.error('Image load error:', e.target.src);
                  e.target.onerror = null;
                  e.target.src = defaultAvatar;
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{member.position}</p>
              <p className="mt-2 text-gray-700 dark:text-gray-400">{member.description}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEditTeamMember(member)}
                  className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <FiEdit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTeamMember(member.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <FiTrash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4">
              {selectedTeamMember ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            <form onSubmit={handleTeamMemberSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={teamMemberForm.name}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  value={teamMemberForm.position}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, position: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={teamMemberForm.description}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Image</label>
                <input
                  type="file"
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, image: e.target.files[0] })}
                  className="w-full"
                  accept="image/*"
                  {...(!selectedTeamMember && { required: true })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );



  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
        {/* Error and Loading displays */}
        {renderError()}
        {renderLoading()}
        
        {/* Desktop Sidebar */}
        {isDesktop && (
          <aside className="fixed left-8 top-24 bottom-8 z-30 w-64 bg-white dark:bg-[#232323] flex flex-col pt-4 pb-4 border border-orange-100 dark:border-orange-700 rounded-2xl shadow-xl">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-4 px-4">
            <div className="relative w-16 h-16 mb-2">
                <img 
                src={user?.profile_image || defaultAvatar}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-orange-500"
                />
                </div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">{user?.name || 'Admin Demo'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">ENTREPRENEUR</p>
            </div>

            {/* Navigation Links */}
          <nav className="flex-1 px-3">
            <div className="space-y-1.5">
              {tabs.map((item) => (
                <button
                  key={item.id}
                    onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm rounded-lg
                    ${activeTab === item.id 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900'
                    }
                    transition-colors duration-150 ease-in-out
                  `}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                </button>
              ))}
            </div>
            </nav>
            
          {/* Bottom Actions */}
          <div className="px-3 mt-2">
              <button
                onClick={() => setActiveTab('settings')}
              className={`
                w-full flex items-center px-3 py-2 text-sm rounded-lg mb-1.5
                ${activeTab === 'settings' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900'
                }
                transition-colors duration-150 ease-in-out
              `}
              >
              <FiSettings className="text-xl mr-3" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">Settings</span>
              </button>
              
              <button
                onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-150 ease-in-out"
              >
              <FiLogOut className="text-xl mr-3" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">Logout</span>
              </button>
          </div>
        </aside>
        )}

        {/* Mobile Hamburger Button */}
        {!isDesktop && (
          <HamburgerButton
            isOpen={isMobileSidebarOpen}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
        )}

        {/* Mobile Sidebar */}
        {!isDesktop && (
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            title="Dashboard"
          >
            <div className="flex flex-col h-full">
              {/* Profile Section */}
              <div className="flex flex-col items-center mb-4 px-4 pt-4">
                <div className="relative w-16 h-16 mb-2">
                  <img 
                    src={user?.profile_image || defaultAvatar}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-2 border-orange-500"
                  />
                </div>
                <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">{user?.name || 'Admin Demo'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">ENTREPRENEUR</p>
                </div>
                
              {/* Navigation Links */}
              <nav className="flex-1 px-3">
                <div className="space-y-1.5">
                  {tabs.map((item) => (
                <button
                      key={item.id}
                  onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center px-3 py-2 text-sm rounded-lg
                        ${activeTab === item.id 
                          ? 'bg-orange-500 text-white' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900'
                        }
                        transition-colors duration-150 ease-in-out
                      `}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                </button>
                  ))}
              </div>
              </nav>
              
              {/* Bottom Actions */}
              <div className="px-3 mt-2 mb-4">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm rounded-lg mb-1.5
                    ${activeTab === 'settings' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900'
                    }
                    transition-colors duration-150 ease-in-out
                  `}
                >
                  <FiSettings className="text-xl mr-3" />
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">Settings</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-150 ease-in-out"
                >
                  <FiLogOut className="text-xl mr-3" />
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">Logout</span>
                </button>
              </div>
            </div>
          </MobileSidebar>
        )}

        {/* Main Content */}
        <main className={`
          flex-1 transition-all duration-300 min-w-0 max-w-full overflow-hidden
          ${isDesktop ? 'p-6 lg:p-10 mt-24 ml-72' : 'p-3 pt-24'}
        `}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;