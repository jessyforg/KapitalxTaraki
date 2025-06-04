import React, { useState, useEffect } from 'react';
import { FiHome, FiCalendar, FiUsers, FiBarChart2, FiSettings, FiEdit2, FiPlus, FiUser} from 'react-icons/fi';
import { FaTicketAlt } from 'react-icons/fa'; // Add ticket icon
import './styles.css'; // For custom calendar and dashboard styles
import tarakiLogoWhite from './imgs/TARAKI 10X WHITE.png';
import tarakiLogoBlack from './imgs/taraki-logo-black2.png';


const initialTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
  { id: 'users', label: 'Users Management', icon: <FiUsers size={20} /> },
  { id: 'startup', label: 'Startup', icon: <FiBarChart2 size={20} /> },
  { id: 'events', label: 'Events', icon: <FiCalendar size={20} /> },
  { id: 'tickets', label: 'Tickets', icon: <FaTicketAlt size={20} /> },
  { id: 'sitePerformance', label: 'Site Performance', icon: <FiBarChart2 size={20} /> },
  { id: 'profile', label: 'Profile', icon: <FiUser size={20} /> }, // Profile tab with FiUser icon
];

function AdminDashboard() {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('admin-dashboard-dark-mode');
    return stored === null ? true : stored === 'true';
  });
  const [eventModal, setEventModal] = useState({ open: false, event: null, date: null });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarAnim, setCalendarAnim] = useState(''); // For animation
  const [events, setEvents] = useState([]);
  const [eventImagePreview, setEventImagePreview] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [eventFiles, setEventFiles] = useState([]); // For new file upload
  const [eventGuests, setEventGuests] = useState([]); // For guest emails and profiles
  const [guestInput, setGuestInput] = useState(""); // For guest input field
  const [eventNotification, setEventNotification] = useState(null); // For event creation notification
  const [roleFilter, setRoleFilter] = useState('all'); // Moved here
  // State for month/year picker
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(calendarDate.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(calendarDate.getMonth());
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  // Calendar rendering helpers
  const getMonthMatrix = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const matrix = [];
    let week = [];
    let dayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
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
      // Edit: update by index, not by object reference
      setEvents(evts => evts.map(e =>
        e === eventModal.event ? { ...event, image: eventImagePreview, date: event.date } : e
      ));
    } else {
      // Add
      setEvents(evts => [...evts, { ...event, image: eventImagePreview, date: event.date }]);
    }
    setEventModal({ open: false, event: null, date: null });
    setEventImagePreview(null);
  };

  // When opening modal for edit, set preview
  React.useEffect(() => {
    if (eventModal.open && eventModal.event && eventModal.event.image) {
      setEventImagePreview(eventModal.event.image);
    } else if (!eventModal.open) {
      setEventImagePreview(null);
    }
  }, [eventModal]);

  // Add event deletion logic
  const handleDeleteEvent = (eventToDelete) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(evts => evts.filter(e => e !== eventToDelete));
    }
  };

  // Main content for each tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        // Show upcoming events from the events state (created by admin)
        const upcomingEvents = events
          .filter(e => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3); // Show next 3 upcoming events
        return (
          <div className="flex flex-col gap-6 w-full">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-6">
              <input type="text" placeholder="Search" className="bg-[#232323] border border-gray-700 rounded-lg px-4 py-2 text-white w-1/3 focus:outline-none" />
              {/* Removed duplicate settings button here */}
            </div>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#232323] rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600">
                <span className="text-gray-400 text-sm">Active Investors</span>
                <span className="text-3xl font-bold mt-2 text-white">189</span>
                <span className="text-xs bg-orange-800 text-orange-300 rounded px-2 py-1 mt-2">+8.2%</span>
              </div>
              <div className="bg-[#232323] rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600">
                <span className="text-gray-400 text-sm">Active Startups</span>
                <span className="text-3xl font-bold mt-2 text-white">53</span>
                <span className="text-xs bg-orange-800 text-orange-300 rounded px-2 py-1 mt-2">-1.4%</span>
              </div>
              <div className="bg-[#232323] rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600">
                <span className="text-gray-400 text-sm">Site Visitors</span>
                <span className="text-3xl font-bold mt-2 text-white">189</span>
                <span className="text-xs bg-orange-800 text-orange-300 rounded px-2 py-1 mt-2">+8.2%</span>
              </div>
              <div className="bg-[#232323] rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600">
                <span className="text-gray-400 text-sm">Upcoming Events</span>
                <span className="text-3xl font-bold mt-2 text-white">{upcomingEvents.length}</span>
                <div className="mt-2 w-full">
                  {upcomingEvents.length === 0 && <span className="text-xs text-gray-400">No upcoming events.</span>}
                  {upcomingEvents.map((event, idx) => (
                    <div key={idx} className="flex flex-col mb-2 p-2 bg-[#181818] rounded border border-orange-900/30">
                      <span className="text-xs text-orange-400 font-semibold">{event.title}</span>
                      <span className="text-xs text-gray-300">{event.date} {event.time && `- ${event.time}`}</span>
                      <span className="text-xs text-gray-400">{event.location}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-2 px-3 py-1 bg-orange-600 text-white rounded text-xs font-semibold hover:bg-orange-700 transition"
                  onClick={() => setActiveTab('events')}
                >+ Create Event</button>
              </div>
            </div>
            {/* Chart Placeholder */}
            <div className="bg-[#232323] rounded-xl shadow p-6 mt-4 min-h-[300px] flex flex-col border-t-4 border-orange-600">
              <span className="font-semibold text-lg mb-2 text-white text-center">Website Traffic</span>
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <span>Chart coming soon...</span>
              </div>
            </div>
          </div>
        );
      case 'events':
        // Calendar UI and event list
        const monthMatrix = getMonthMatrix(calendarDate);
        const monthName = calendarDate.toLocaleString('default', { month: 'long' });
        const year = calendarDate.getFullYear();
        const todayStr = new Date().toISOString().slice(0, 10);
        return (
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-full md:max-w-screen-lg mx-auto min-h-[80vh]">
            {/* Calendar Section */}
            <div className={`flex-1 flex flex-col bg-[#232323] rounded-2xl shadow p-4 md:p-6 border-t-4 border-orange-600 justify-center items-center relative overflow-hidden${darkMode ? '' : ' bg-white border-orange-200'}`}
              style={{
                minWidth: 0,
                minHeight: '420px',
                height: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* Responsive calendar container */}
              <div
                className="w-full h-full flex flex-col justify-between"
                style={{
                  minHeight: '320px',
                  height: '100%',
                  maxHeight: '90vh',
                  aspectRatio: '1.25/1',
                }}
              >
                {/* --- Calendar Month Navigation Buttons --- */}
                <div className="flex items-center justify-between mb-4 w-full animate-fadeInDown">
                  <button
                    onClick={prevMonth}
                    className={`rounded-full p-2 sm:p-3 md:p-3.5 lg:p-4 w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center border focus:outline-none focus:ring-2 transition text-xl sm:text-2xl md:text-2xl lg:text-3xl ${darkMode ? 'bg-[#181818] text-orange-400 border-orange-700 hover:bg-orange-900' : 'bg-orange-50 text-orange-500 border-orange-200 hover:bg-orange-100'}`}
                    title="Previous Month"
                    aria-label="Previous Month"
                  >
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition"><polyline points="18 24 10 14 18 4" /></svg>
                  </button>
                  {/* Month/Year Picker */}
                  <div className="relative">
                    <span
                      className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-semibold cursor-pointer select-none px-2 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-4 md:py-5 lg:py-6 rounded transition hover:bg-orange-100 dark:hover:bg-orange-900"
                      style={{ transition: 'all 0.3s', animation: calendarAnim ? 'fadeIn 0.5s' : undefined }}
                      onClick={() => {
                        setShowMonthYearPicker(true);
                        setPickerYear(calendarDate.getFullYear());
                        setPickerMonth(calendarDate.getMonth());
                      }}
                    >
                      {monthName} {year}
                    </span>
                    {showMonthYearPicker && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-16 z-20 bg-white dark:bg-[#232323] rounded-xl shadow-lg border border-orange-200 dark:border-gray-700 p-4 animate-fadeIn flex flex-col gap-2 min-w-[220px]">
                        <div className="flex justify-between items-center mb-2">
                          <button
                            className="text-orange-500 hover:text-orange-700 text-xl font-bold"
                            onClick={() => setPickerYear(pickerYear - 1)}
                          >&lt;</button>
                          <span className="font-semibold text-lg text-orange-600 dark:text-orange-300 transition-all duration-300">
                            {pickerYear}
                          </span>
                          <button
                            className="text-orange-500 hover:text-orange-700 text-xl font-bold"
                            onClick={() => setPickerYear(pickerYear + 1)}
                          >&gt;</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 transition-all duration-300">
                          {monthNames.map((m, idx) => (
                            <button
                              key={m}
                              className={`px-2 py-1 rounded-lg font-medium transition text-sm ${pickerMonth === idx ? 'bg-orange-600 text-white' : 'hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300'}`}
                              onClick={() => setPickerMonth(idx)}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-end mt-3 gap-2">
                          <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-800 transition" onClick={() => setShowMonthYearPicker(false)}>Cancel</button>
                          <button className="px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 transition font-semibold" onClick={() => {
                            setCalendarDate(new Date(pickerYear, pickerMonth, 1));
                            setShowMonthYearPicker(false);
                          }}>Go</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={nextMonth}
                    className={`rounded-full p-2 sm:p-3 md:p-3.5 lg:p-4 w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center border focus:outline-none focus:ring-2 transition text-xl sm:text-2xl md:text-2xl lg:text-3xl ${darkMode ? 'bg-[#181818] text-orange-400 border-orange-700 hover:bg-orange-900' : 'bg-orange-50 text-orange-500 border-orange-200 hover:bg-orange-100'}`}
                    title="Next Month"
                    aria-label="Next Month"
                  >
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition"><polyline points="10 4 18 14 10 24" /></svg>
                  </button>
                </div>
                {/* Weekday header */}
                <div className="grid grid-cols-7 gap-1 mb-2 w-full animate-fadeIn">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <span key={d} className="text-gray-400 text-center text-base md:text-lg lg:text-xl font-medium py-2">{d}</span>
                  ))}
                </div>
                {/* Calendar grid */}
                <div
                  className={`flex-1 grid grid-cols-7 gap-1 w-full transition-transform duration-300 ${calendarAnim === 'slide-left' ? 'animate-slide-left' : ''} ${calendarAnim === 'slide-right' ? 'animate-slide-right' : ''} ${calendarAnim ? 'opacity-0 animate-fadeIn' : 'opacity-100'} animate-fadeIn`}
                  onAnimationEnd={() => setCalendarAnim('')}
                  style={{ minHeight: '320px' }}
                >
                  {monthMatrix.map((week, i) =>
                    week.map((date, j) => {
                      if (!date) return <div key={i + '-' + j} className="h-10 md:h-12 lg:h-16" />;
                      const pad = n => n.toString().padStart(2, '0');
                      const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                      const isToday =
                        date.getDate() === new Date().getDate() &&
                        date.getMonth() === new Date().getMonth() &&
                        date.getFullYear() === new Date().getFullYear();
                      // Only highlight today, not any other date
                      const hasEvent = getEventsForDate(dateStr).length > 0;
                      return (
                        <button
                          key={dateStr}
                          className={`w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10 flex flex-col items-center justify-center rounded-full transition-all duration-150 relative mx-auto my-auto
                            ${isToday ? 'border-2 border-orange-500 bg-orange-500 text-white font-bold z-10 ring-2 ring-orange-300/40' : ''}
                            ${hasEvent && !isToday ? 'bg-orange-600 text-white' : (!isToday ? 'hover:bg-orange-900 text-gray-200' : '')}
                          `}
                          onClick={() => setEventModal({ open: true, event: null, date: dateStr })}
                          title={hasEvent ? 'View/Add Event' : 'Add Event'}
                          style={{ boxShadow: isToday ? '0 0 0 1.5px #ff9800' : undefined }}
                        >                        <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 lg:w-8 lg:h-8 text-sm md:text-base lg:text-base leading-none font-medium absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{margin:0,padding:0}}>
                            {date.getDate()}
                        </span>
                          <span className="block h-2 mt-1 mb-1">
                            {hasEvent && <span className="w-2 h-2 bg-orange-400 rounded-full block mx-auto" />}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            {/* Events List Section */}
            <div className={`flex-shrink-0 w-full md:w-80 lg:w-96 rounded-2xl shadow p-4 md:p-6 border-t-4 border-orange-600 min-h-[350px] max-w-full md:max-w-[350px] lg:max-w-[400px] overflow-y-auto flex flex-col animate-fadeInRight ${darkMode ? 'bg-[#232323]' : 'bg-white'}`}>
              {/* Numeric indicators for events */}
              <div className="flex flex-col gap-1 mb-3">
                <span className={`text-base font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>Total Events: <span className={darkMode ? 'text-white' : 'text-black'}>{events.length}</span></span>
                <span className={`text-sm ${darkMode ? 'text-orange-200' : 'text-orange-600'}`}>This Month: <span className={darkMode ? 'text-white' : 'text-black'}>{events.filter(e => {
                  const d = new Date(e.date);
                  return d.getMonth() === calendarDate.getMonth() && d.getFullYear() === calendarDate.getFullYear();
                }).length}</span></span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Events</span>
                <button
                  className={`transition ${darkMode ? 'text-orange-400 hover:text-orange-600' : 'text-orange-500 hover:text-orange-700'}`}
                  onClick={() => setEventModal({ open: true, event: null, date: todayStr })}
                  title="Add Event"
                >
                  <FiPlus size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {events.length === 0 && <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No events.</span>}
                {events.map((event, idx) => (
                  <div key={idx} className={`rounded-lg px-3 py-2 flex flex-col mb-1 border border-gray-700 relative ${darkMode ? 'bg-[#181818]' : 'bg-gray-100'}`}>
                    {event.image && (
                      <img src={event.image} alt="Event" className="w-full h-24 object-cover rounded mb-2" />
                    )}
                    <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{event.title}</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{event.time} - {event.location}</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{event.date}</span>
                    {/* Guest count indicator */}
                    <span className={`text-xs mt-1 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>Guests: <span className={darkMode ? 'text-white' : 'text-black'}>{event.guests?.length || 0}</span></span>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        className={darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-600'}
                        onClick={() => setEventModal({ open: true, event, date: event.date })}
                        title="Edit Event"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        className={darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-500 hover:text-red-600'}
                        onClick={() => handleDeleteEvent(event)}
                        title="Delete Event"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Event Modal */}
            {eventModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-[#232323] via-[#181818] to-[#232323] rounded-2xl p-0 w-full max-w-lg md:max-w-xl lg:max-w-2xl shadow-2xl border-t-4 border-orange-600 relative overflow-hidden">
                  {/* Decorative header */}
                  <div className="bg-orange-600 flex items-center gap-3 px-6 py-4 rounded-t-2xl shadow">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Create Event</h3>
                    <button
                      className="ml-auto text-orange-100 hover:text-white text-2xl font-bold"
                      onClick={() => {
                        setEventModal({ open: false, event: null, date: null });
                        setEventGuests([]); setGuestInput(""); setEventFiles([]); setEventNotification(null);
                      }}
                      aria-label="Close"
                    >✕</button>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    {eventNotification && (
                      <div className={`mb-2 px-4 py-2 rounded text-sm font-semibold ${eventNotification.type === 'error' ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-green-900 text-green-300 border border-green-700'}`}>{eventNotification.message}</div>
                    )}
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const form = e.target;
                        let errorMsg = '';
                        if (!form.title.value.trim()) errorMsg = 'Event name is required.';
                        else if (!form.date.value) errorMsg = 'Date is required.';
                        else if (!form.time.value) errorMsg = 'Time is required.';
                        else if (!form.location.value.trim()) errorMsg = 'Location is required.';
                        else if (eventGuests.length === 0) errorMsg = 'Please add at least one name.';
                        if (errorMsg) {
                          setEventNotification({ type: 'error', message: errorMsg });
                          return;
                        }
                        setEventNotification({ type: 'success', message: 'Event created successfully!' });
                        setTimeout(() => setEventNotification(null), 2000);
                        handleEventSave({
                          title: form.title.value,
                          time: form.time.value,
                          location: form.location.value,
                          date: form.date.value,
                          guests: eventGuests,
                          notification: form.notification?.value,
                          files: eventFiles,
                        });
                        setEventGuests([]); setGuestInput(""); setEventFiles([]);
                      }}
                      className="flex flex-col gap-5"
                    >
                      {/* Event name */}
                      <div className="flex flex-col gap-1">
                        <label className="text-orange-400 font-semibold text-sm mb-1">Event Name</label>
                        <input
                          name="title"
                          defaultValue={eventModal.event?.title || ''}
                          placeholder="Enter event name"
                          className={`bg-[#181818] border ${eventNotification?.type === 'error' && eventNotification.message.includes('name') ? 'border-red-600' : 'border-orange-600'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition`}
                          required
                        />
                      </div>
                      {/* Date & Time */}
                      <div className="flex gap-3">
                        <div className="flex flex-col flex-1 gap-1">
                          <label className="text-orange-400 font-semibold text-sm mb-1">Date</label>
                          <input
                            type="date"
                            name="date"
                            defaultValue={eventModal.date || eventModal.event?.date || ''}
                            className={`bg-[#181818] border ${eventNotification?.type === 'error' && eventNotification.message.includes('Date') ? 'border-red-600' : 'border-orange-600'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition`}
                            required
                          />
                        </div>
                        <div className="flex flex-col flex-1 gap-1 relative">
                          <label className="text-orange-400 font-semibold text-sm mb-1">Time</label>
                          <input
                            type="time"
                            name="time"
                            defaultValue={eventModal.event?.time || ''}
                            className={`bg-[#181818] border ${eventNotification?.type === 'error' && eventNotification.message.includes('Time') ? 'border-red-600' : 'border-orange-600'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition`}
                            required
                          />
                        </div>
                      </div>
                      {/* Location */}
                      <div className="flex flex-col gap-1">
                        <label className="text-orange-400 font-semibold text-sm mb-1">Location</label>
                        <input
                          name="location"
                          defaultValue={eventModal.event?.location || ''}
                          placeholder="Enter Location"
                          className={`bg-[#181818] border ${eventNotification?.type === 'error' && eventNotification.message.includes('Location') ? 'border-red-600' : 'border-orange-600'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition`}
                          required
                        />
                      </div>
                      {/* RSVP/Register */}
                      <div className="flex flex-col gap-1">
                        <label className="text-orange-400 font-semibold text-sm mb-1">RSVP / Register</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={guestInput}
                            onChange={e => setGuestInput(e.target.value)}
                            placeholder="Add name to RSVP/Register"
                            className="bg-[#181818] border border-orange-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1"
                          />
                          <button
                            type="button"
                            className="bg-orange-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-orange-700 transition shadow"
                            onClick={() => {
                              if (guestInput && !eventGuests.some(g => g.name === guestInput)) {
                                setEventGuests([...eventGuests, { name: guestInput, email: '', avatar: null }]);
                                setGuestInput("");
                              }
                            }}
                          >Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {eventGuests.map((guest, i) => (
                            <div key={i} className="flex items-center gap-2 bg-[#181818] border border-orange-600 rounded-full px-3 py-1 shadow">
                              <span className="w-7 h-7 rounded-full bg-orange-700 flex items-center justify-center text-white text-sm font-bold">
                                {guest.name[0]?.toUpperCase() || 'U'}
                              </span>
                              <span className="text-white text-xs">{guest.name}</span>
                              <button
                                type="button"
                                className="ml-1 text-gray-400 hover:text-red-400"
                                onClick={() => setEventGuests(eventGuests.filter((_, idx) => idx !== i))}
                                title="Remove guest"
                              >✕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Upload attachments */}
                      <div className="flex flex-col gap-1">
                        <label className="text-orange-400 font-semibold text-sm mb-1">Attachments</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            id="event-files"
                            onChange={e => {
                              setEventFiles(Array.from(e.target.files));
                              setEventImagePreview(null); // Remove preview logic
                            }}
                          />
                          <label htmlFor="event-files" className="bg-[#181818] border border-orange-600 text-orange-400 rounded-lg px-4 py-2 text-xs font-semibold hover:bg-orange-900 transition cursor-pointer inline-block shadow">Select Files</label>
                          <div className="flex flex-col gap-1">
                            {eventFiles && eventFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-green-400 text-sm">
                                <span>✔</span>
                                <span>{file.name}</span>
                                <button type="button" className="ml-1 text-gray-400 hover:text-red-400" onClick={() => setEventFiles(eventFiles.filter((_, i) => i !== idx))}>✕</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="flex justify-end gap-2 mt-4">
                        <button type="button" className="px-4 py-2 rounded-lg border font-semibold transition bg-[#232323] border-orange-600 text-orange-400 hover:bg-orange-900" onClick={() => { setEventModal({ open: false, event: null, date: null }); setEventGuests([]); setGuestInput(""); }}>Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 bg-orange-600 text-white hover:bg-orange-700 shadow"> 
                          <FiPlus size={18} className="text-white" />
                          Create Event
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'users':
        // User Management Page (screenshot replica)
        const demoUsers = [
          { name: 'Demo User 1', email: 'demo1@email.com', role: 'Administrator' },
          { name: 'Demo User 2', email: 'demo2@email.com', role: 'Administrator' },
          { name: 'Demo User 3', email: 'demo3@email.com', role: 'Moderator' },
          { name: 'Demo User 4', email: 'demo4@email.com', role: 'Moderator' },
          { name: 'Demo User 5', email: 'demo5@email.com', role: 'Moderator' },
          { name: 'Demo User 6', email: 'demo6@email.com', role: 'User' },
          { name: 'Demo User 7', email: 'demo7@email.com', role: 'User' },
          { name: 'Demo User 8', email: 'demo8@email.com', role: 'User' },
          { name: 'Demo User 9', email: 'demo9@email.com', role: 'User' },
          { name: 'Demo User 10', email: 'demo10@email.com', role: 'User' },
        ];
        const filteredUsers = demoUsers.filter(u => roleFilter === 'all' || u.role.toLowerCase() === roleFilter);
        return (
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* User Management Table */}
            <div className="flex-1 bg-[#232323] rounded-xl shadow p-6 flex flex-col min-h-[400px]">
              {/* Search and Roles */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-[#181818] border border-gray-700 rounded-lg px-4 py-2 text-white w-full md:w-1/2 focus:outline-none"
                />
                <select
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-orange-400 mt-2 md:mt-0"
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="administrator">Administrator</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                </select>
              </div>
              {/* Table */}
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full text-left text-sm text-gray-300">
                  <thead>
                    <tr className="bg-[#333] text-orange-400">
                      <th className="px-4 py-3 font-semibold">USER PROFILE</th>
                      <th className="px-4 py-3 font-semibold">EMAIL</th>
                      <th className="px-4 py-3 font-semibold">ROLE</th>
                      <th className="px-4 py-3 font-semibold text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => (
                      <tr key={idx} className="border-b border-[#333] hover:bg-[#181818] transition">
                        <td className="px-4 py-3 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-orange-700 flex items-center justify-center text-white text-sm font-bold">
                            {user.name[0]}
                          </span>
                          <span>{user.name}</span>
                        </td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.role}</td>
                        <td className="px-4 py-3 flex items-center justify-center gap-3">
                          {/* Email icon */}
                          <button title="Email" className="text-gray-300 hover:text-orange-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4zm16 0l-8 8-8-8" /></svg>
                          </button>
                          {/* Edit icon */}
                          <button title="Edit" className="text-orange-400 hover:text-orange-600"><FiEdit2 size={16} /></button>
                          {/* Ban icon */}
                          <button title="Ban" className="text-red-500 hover:text-red-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pending Requests */}
            <div className="w-full lg:w-80 bg-[#232323] rounded-xl shadow p-6 flex flex-col min-h-[400px] max-w-full">
              <span className="font-semibold text-lg mb-4 text-white">Pending Requests</span>
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((_, idx) => (
                  <div key={idx} className="bg-[#181818] rounded-lg p-3 flex flex-col gap-1 border border-gray-700 relative">
                    <span className="font-semibold text-white">Demo Request {idx + 1} <span className="text-xs text-gray-400 ml-2">• 12 hours</span></span>
                    <span className="text-xs text-gray-400">pending{idx + 1}@email.com</span>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-orange-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-[#232323] rounded-xl shadow p-6 w-full min-h-[300px] flex flex-col">
            <span className="font-semibold text-lg mb-2">Analytics</span>
            <span className="text-gray-400">Analytics charts and insights coming soon.</span>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-[#232323] rounded-xl shadow p-6 w-full min-h-[300px] flex flex-col gap-4">
            <span className="font-semibold text-lg mb-2">Settings</span>
            <span className="text-gray-400">Settings options coming soon.</span>
            <button
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded px-4 py-2 transition self-start"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Logout
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${darkMode ? 'bg-[#181818]' : 'bg-gray-50'}`}> 
      {/* Blurry overlay when modal is open */}
      {eventModal.open && (
        <div className="fixed inset-0 z-40 backdrop-blur-[6px] bg-black/30 transition-all duration-300" style={{ pointerEvents: 'auto' }} />
      )}
      {/* Sidebar */}
      <aside className={`flex flex-col items-center w-64 min-h-[90vh] bg-[#181818] rounded-3xl m-6 p-0 shadow-lg`}>
        {/* Logo */}
        <div className="flex flex-col items-center mt-6 mb-8">
          <img
            src={tarakiLogoWhite}
            alt="TARAKI Logo"
            className="w-28 h-16 object-contain mb-2"
          />
          <div className="w-20 h-20 rounded-full bg-orange-700 border-8 border-orange-600 flex items-center justify-center">
            <span className="sr-only">Profile Circle</span>
          </div>
        </div>
        {/* Sidebar Tabs */}
        <nav className="flex flex-col gap-2 w-full px-4">
          {tabs.map((tab, idx) => (
            <div
              key={tab.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 select-none text-lg font-medium w-full
                ${activeTab === tab.id
                  ? 'bg-orange-600 text-white shadow-md scale-[1.04]'
                  : 'hover:bg-orange-900 text-gray-300'}
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-medium text-base truncate">{tab.label}</span>
            </div>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className={`flex-1 p-3 md:p-6 flex flex-col gap-4 md:gap-6 max-w-full md:max-w-screen-lg mx-auto ${darkMode ? '' : 'bg-white'}`}>
        {/* Topbar */}
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <span className={`text-xl md:text-2xl lg:text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>{tabs.find(t => t.id === activeTab)?.label}</span>
        </div>
        {/* Dynamic Content */}
        <div className="flex-1 flex flex-col">{renderContent()}</div>
      </main>
      {/* Top right settings button */}
      <div className="absolute top-4 right-4 md:right-6 z-30">
        <button
          className="p-2 rounded-full bg-white dark:bg-[#232323] shadow hover:bg-orange-100 dark:hover:bg-orange-900 transition"
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Settings"
        >
          <FiSettings size={24} className="text-orange-500" />
        </button>
        {showSettings && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#232323] rounded shadow-lg border border-orange-100 dark:border-gray-700 animate-fadeIn p-2 flex flex-col gap-2">
            {/* Dark mode toggle inside settings dropdown */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded transition text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle dark mode"
            >
              <span className="text-lg">{darkMode ? '🌙' : '☀️'}</span>
              <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              className="w-full text-left px-4 py-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900 rounded transition"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;