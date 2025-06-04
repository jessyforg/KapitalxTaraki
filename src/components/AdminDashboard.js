  import React, { useState } from 'react';
  import { FiHome, FiCalendar, FiUsers, FiBarChart2, FiSettings, FiEdit2, FiPlus} from 'react-icons/fi';
  import { FaTicketAlt } from 'react-icons/fa'; // Add ticket icon
  import './styles.css'; // For custom calendar and dashboard styles


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
    const [darkMode, setDarkMode] = useState(() => {
      const stored = localStorage.getItem('admin-dashboard-dark-mode');
      return stored === null ? true : stored === 'true';
    });
    const [eventModal, setEventModal] = useState({ open: false, event: null, date: null });
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [calendarAnim, setCalendarAnim] = useState(''); // For animation
    const [events, setEvents] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [eventFiles, setEventFiles] = useState([]); // For new file upload
    const [eventNotification, setEventNotification] = useState(null); // For event creation notification
    const [roleFilter, setRoleFilter] = useState('all'); // Moved here
    const [roleFilterAnim, setRoleFilterAnim] = useState(''); // Add animation state for role filter
    // State for month/year picker
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(calendarDate.getFullYear());
    const [pickerMonth, setPickerMonth] = useState(calendarDate.getMonth());
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Add state for pending requests
    const [pendingRequests, setPendingRequests] = useState([
      { id: 1, name: 'Demo Request 1', email: 'pending1@email.com', time: '12 hours' },
      { id: 2, name: 'Demo Request 2', email: 'pending2@email.com', time: '12 hours' },
      { id: 3, name: 'Demo Request 3', email: 'pending3@email.com', time: '12 hours' },
      { id: 4, name: 'Demo Request 4', email: 'pending4@email.com', time: '12 hours' },
    ]);
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

    // Handler for ignore
    const handleIgnoreRequest = (id) => {
      setPendingRequests(reqs => reqs.filter(r => r.id !== id));
    };
    // Handler for remove (could be a different action, here just remove for demo)
    const handleRemoveRequest = (id) => {
      if (window.confirm('Are you sure you want to remove this request?')) {
        setPendingRequests(reqs => reqs.filter(r => r.id !== id));
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
                <input type="text" placeholder="Search" className={`rounded-lg px-4 py-2 w-1/3 focus:outline-none ${darkMode ? 'bg-[#232323] border border-gray-700 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`} />
                {/* Removed duplicate settings button here */}
              </div>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Active Investors</span>
                  <span className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>189</span>
                  <span className={`text-xs rounded px-2 py-1 mt-2 ${darkMode ? 'bg-orange-800 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>+8.2%</span>
                </div>
                <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Active Startups</span>
                  <span className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>53</span>
                  <span className={`text-xs rounded px-2 py-1 mt-2 ${darkMode ? 'bg-orange-800 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>-1.4%</span>
                </div>
                <div className={`rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-orange-600 ${darkMode ? 'bg-[#232323]' : 'bg-white border border-orange-200'}`}>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-orange-700'} text-sm`}>Site Visitors</span>
                  <span className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>189</span>
                  <span className={`text-xs rounded px-2 py-1 mt-2 ${darkMode ? 'bg-orange-800 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>+8.2%</span>
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
          const year = calendarDate.getFullYear();
          const todayStr = new Date().toISOString().slice(0, 10);
          return (
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-full md:max-w-screen-lg mx-auto min-h-[80vh]">
              {/* Calendar Section */}
              <div className={`flex-1 flex flex-col rounded-2xl shadow p-0 border-t-4 border-orange-600 ${darkMode ? 'bg-[#232323] border border-orange-900' : 'bg-white border border-orange-200'}`}
                style={{
                  minWidth: 0,
                  minHeight: '420px',
                  height: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '1rem',
                }}
              >
                <div className="p-4 md:p-6 flex-1 flex flex-col justify-center items-center relative overflow-hidden w-full h-full">
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
                        <span
                          key={d}
                          className={`text-center text-base md:text-lg lg:text-xl font-medium py-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    {/* Calendar grid */}
                    <div
                      className={`flex-1 grid grid-cols-7 gap-1 w-full transition-transform duration-300 ${calendarAnim === 'slide-left' ? 'animate-slide-left' : ''} ${calendarAnim === 'slide-right' ? 'animate-slide-right' : ''} ${calendarAnim ? 'opacity-0 animate-fadeIn' : 'opacity-100'} animate-fadeIn`}
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
                          const hasEvent = getEventsForDate(dateStr).length > 0;
                          return (
                            <button
                              key={dateStr}
                              className={`w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10 flex flex-col items-center justify-center rounded-full transition-all duration-150 relative mx-auto my-auto
                                ${isToday ? 'border-2 border-orange-500 bg-orange-500 text-white font-bold z-10 ring-2 ring-orange-300/40' : ''}
                                ${hasEvent && !isToday ? 'bg-orange-600 text-white' : (!isToday ? (darkMode ? 'hover:bg-orange-900 text-gray-200' : 'hover:bg-orange-100 text-gray-800') : '')}
                              `}
                              onClick={() => setEventModal({ open: true, event: null, date: dateStr })}
                              title={hasEvent ? 'View/Add Event' : 'Add Event'}
                              style={{ boxShadow: isToday ? '0 0 0 1.5px #ff9800' : undefined }}
                            >
                              <span className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 lg:w-8 lg:h-8 text-sm md:text-base lg:text-base leading-none font-medium absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${isToday ? '' : (darkMode ? 'text-gray-200' : 'text-gray-800')}`}
                                style={{margin:0,padding:0}}>
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
              </div>
              {/* Events List Section */}
              <div className={`flex-shrink-0 w-full md:w-80 lg:w-96 rounded-2xl shadow p-4 md:p-6 border-t-4 border-orange-600 min-h-[350px] max-w-full md:max-w-[350px] lg:max-w-[400px] overflow-y-auto flex flex-col animate-fadeInRight ${darkMode ? 'bg-[#232323] border border-orange-900' : 'bg-white border border-orange-200'}`}
                style={{ boxSizing: 'border-box' }}
              >
                {/* Numeric indicators for events */}
                <div className="flex flex-col gap-1 mb-3 border border-orange-300 dark:border-orange-900 rounded-lg p-3 bg-transparent">
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
                      {event.registrationLink && (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs mt-1 underline ${darkMode ? 'text-blue-300 hover:text-blue-400' : 'text-blue-700 hover:text-blue-900'}`}
                        >
                          Registration Link
                        </a>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          className={`rounded-full p-1 flex items-center justify-center focus:outline-none transition ${darkMode ? 'bg-[#232323]' : 'bg-orange-100'}`}
                          style={{ width: 28, height: 28 }}
                          onClick={() => setEventModal({ open: true, event, date: event.date })}
                          title="Edit Event"
                        >
                          <FiEdit2 size={18} color={darkMode ? '#fff' : '#222'} />
                        </button>
                        <button
                          className={`rounded-full p-1 flex items-center justify-center focus:outline-none transition ${darkMode ? 'bg-[#232323]' : 'bg-orange-100'}`}
                          style={{ width: 28, height: 28 }}
                          onClick={() => handleDeleteEvent(event)}
                          title="Delete Event"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={darkMode ? '#fff' : '#222'} strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Event Modal */}
              {eventModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div
                    className={`rounded-2xl p-0 w-full max-w-3xl shadow-2xl border-t-4 border-orange-600 relative overflow-hidden flex flex-row ${darkMode ? 'bg-gradient-to-br from-[#232323] via-[#181818] to-[#232323]' : 'bg-white'} mx-2 sm:mx-4 md:mx-8`}
                    style={{ border: darkMode ? undefined : '1.5px solid #fde68a', minWidth: '0', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'row' }}
                  >
                    {/* Left: Form Section */}
                    <div className="flex-1 flex flex-col justify-between p-6 gap-4 min-w-0 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                      {/* Decorative header */}
                      <div className={`flex items-center gap-3 px-6 py-4 rounded-t-2xl shadow ${darkMode ? 'bg-orange-600' : 'bg-orange-100'}`}>
                        <h3 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-orange-700'}`}>Create Event</h3>
                        <button
                          className={`ml-auto text-2xl font-bold ${darkMode ? 'text-orange-100 hover:text-white' : 'text-orange-700 hover:text-orange-900'}`}
                          onClick={() => {
                            setEventModal({ open: false, event: null, date: null });
                            setEventFiles([]); setEventNotification(null);
                          }}
                          aria-label="Close"
                        >✕</button>
                      </div>
                      <div className={`p-4 flex flex-col gap-4 ${darkMode ? '' : 'bg-white'}`}
                        style={{ color: darkMode ? undefined : '#222' }}
                      >
                        {eventNotification && (
                          <div className={`mb-2 px-4 py-2 rounded text-sm font-semibold ${eventNotification.type === 'error' ? (darkMode ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-red-100 text-red-700 border border-red-300') : (darkMode ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-green-100 text-green-700 border border-green-300')}`}>{eventNotification.message}</div>
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
                            else if (!form.registrationLink.value.trim()) errorMsg = 'Registration link is required.';
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
                              registrationLink: form.registrationLink.value,
                              eventType: form.eventType.value,
                              eventTag: form.eventTag.value,
                              notification: form.notification?.value,
                              files: eventFiles,
                            });
                            setEventFiles([]);
                          }}
                          className="flex flex-col gap-5"
                        >
                          {/* Event name */}
                          <div className="flex flex-col gap-1">
                            <label className={`font-semibold text-sm mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Event Name</label>
                            <input
                              name="title"
                              defaultValue={eventModal.event?.title || ''}
                              placeholder="Enter event name"
                              className={`rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${darkMode ? 'bg-[#181818] border border-orange-600 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`}
                              required
                            />
                          </div>
                          {/* Date & Time */}
                          <div className="flex gap-3">
                            <div className="flex flex-col flex-1 gap-1 relative">
                              <label className={`font-semibold text-sm mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Date</label>
                              <div className="relative">
                                <input
                                  type="date"
                                  name="date"
                                  defaultValue={eventModal.date || eventModal.event?.date || ''}
                                  className={`rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition w-full pr-10 ${darkMode ? 'bg-[#181818] border border-orange-600 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`}
                                  required
                                />
                                {/* Removed calendar icon */}
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 gap-1 relative">
                              <label className={`font-semibold text-sm mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Time</label>
                              <div className="relative">
                                <input
                                  type="time"
                                  name="time"
                                  defaultValue={eventModal.event?.time || ''}
                                  className={`rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition w-full pr-10 ${darkMode ? 'bg-[#181818] border border-orange-600 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`}
                                  required
                                />
                                {/* Removed clock icon */}
                              </div>
                            </div>
                          </div>
                          {/* Location */}
                          <div className="flex flex-col gap-1">
                            <label className={`font-semibold text-sm mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Location</label>
                            <div className="relative">
                              <input
                                name="location"
                                autoComplete="off"
                                value={locationQuery}
                                onChange={handleLocationInput}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Enter Location (e.g. Baguio City, Tarlac, etc.)"
                                className={`rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition w-full ${darkMode ? 'bg-[#181818] border border-orange-600 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`}
                                required
                              />
                              {/* Suggestions dropdown */}
                              {showSuggestions && locationSuggestions.length > 0 && (
                                <div className="absolute z-30 left-0 w-full bg-white dark:bg-[#232323] border border-orange-200 dark:border-orange-700 rounded-lg shadow-lg max-h-56 overflow-y-auto animate-fadeIn mt-1" style={{top: '100%'}}>
                                  {locationSuggestions.map((s, idx) => (
                                    <div
                                      key={s.place_id}
                                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900 text-sm border-b last:border-b-0 border-orange-50 dark:border-orange-900"
                                      onClick={() => handleSuggestionSelect(s)}
                                    >
                                      <span className="text-gray-400 dark:text-gray-500">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" opacity="0.2"/><path d="M12 6v6l4 2"/></svg>
                                      </span>
                                      <span className="truncate text-gray-800 dark:text-gray-200 font-medium">{s.display_name.split(',')[0]}</span>
                                      <span className="truncate text-gray-500 dark:text-gray-400 ml-1">{s.display_name.replace(s.display_name.split(',')[0], '').slice(0, 40)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Show loading spinner while fetching coordinates */}
                            {mapLoading && (
                              <div className="flex items-center gap-2 mt-2 text-orange-500 text-xs">
                                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
                                Loading map…
                              </div>
                            )}
                            {/* Show a map preview with a pin if coordinates are available */}
                            {mapCoords && !mapLoading && (
                              <div className="mt-2 rounded overflow-hidden border border-orange-200 dark:border-orange-700 shadow" style={{height:'200px', minHeight:'120px'}}>
                                <iframe
                                  title="Map Preview"
                                  width="100%"
                                  height="200"
                                  frameBorder="0"
                                  style={{ border: 0, width: '100%', height: '100%' }}
                                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(mapCoords.lon)-0.01}%2C${parseFloat(mapCoords.lat)-0.01}%2C${parseFloat(mapCoords.lon)+0.01}%2C${parseFloat(mapCoords.lat)+0.01}&layer=mapnik&marker=${mapCoords.lat}%2C${mapCoords.lon}`}
                                  allowFullScreen
                                ></iframe>
                              </div>
                            )}
                            {/* Show error if location not found or fetch fails */}
                            {mapError && !mapLoading && (
                              <span className="text-xs text-red-500 mt-1">{mapError}</span>
                            )}
                          </div>
                          {/* RSVP/Register */}
                          <div className="flex flex-col gap-1">
                            <label className={`font-semibold text-sm mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>RSVP / Register Link</label>
                            <input
                              type="url"
                              name="registrationLink"
                              defaultValue={eventModal.event?.registrationLink || ''}
                              placeholder="Paste registration link (Google Form, Microsoft Form, etc.)"
                              className={`rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 ${darkMode ? 'bg-[#181818] border border-orange-600 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`}
                              required
                              pattern="https?://.+"
                              onBlur={e => {
                                const value = e.target.value.trim();
                                if (value) {
                                  const allowedPatterns = [
                                    /https?:\/\/(docs|forms)\.google\.com\/forms\//i,
                                    /https?:\/\/(www\.)?microsoft\.com\/forms\//i,
                                  ];
                                  const isForm = allowedPatterns.some(pat => pat.test(value));
                                  if (!isForm) {
                                    setEventNotification({ type: 'error', message: 'Please paste a valid form link (Google Form, Microsoft Form, Typeform, etc.). Social media or video links are not allowed.' });
                                    e.target.value = '';
                                    setTimeout(() => setEventNotification(null), 3000);
                                  }
                                }
                              }}
                            />
                            <span className="text-xs text-gray-400 mt-1">Paste a registration form link for this event (required).</span>
                          </div>
                          {/* Type and Tag Buttons */}
                          <div className="flex gap-4 mb-2">
                            {/* Type Button */}
                            <div className="flex flex-col gap-1 flex-1">
                              <label className={`font-semibold text-sm mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Type</label>
                              <select
                                name="eventType"
                                defaultValue={eventModal.event?.eventType || 'upcoming'}
                                className={`rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition w-full ${darkMode ? 'bg-[#181818] border border-orange-600 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`}
                                required
                              >
                                <option value="upcoming">Upcoming Event</option>
                                <option value="past">Past Event</option>
                              </select>
                            </div>
                            {/* Tag Button */}
                            <div className="flex flex-col gap-1 flex-1">
                              <label className={`font-semibold text-sm mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Tag (Organization)</label>
                              <select
                                name="eventTag"
                                defaultValue={eventModal.event?.eventTag || 'TARAKI'}
                                className={`rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition w-full ${darkMode ? 'bg-[#181818] border border-orange-600 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`}
                                required
                              >
                                <option value="TARAKI">TARAKI</option>
                                <option value="InTTO">InTTO</option>
                                <option value="IFSU-TBI">IFSU-TBI</option>
                                <option value="SILBI-TBI">SILBI-TBI</option>
                                <option value="SLU">SLU</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                          {/* Upload attachments */}
                          <div className="flex flex-col gap-1">
                            <label className={`font-semibold text-sm mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Attachments</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                id="event-files"
                                onChange={e => {
                                  const files = Array.from(e.target.files);
                                  setEventFiles(files);
                                  if (files && files.length > 0) {
                                    const reader = new FileReader();
                                    reader.onload = ev => setEventImagePreview(ev.target.result);
                                    reader.readAsDataURL(files[0]);
                                  } else {
                                    setEventImagePreview(null);
                                  }
                                }}
                              />
                              <label htmlFor="event-files" className={`rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer inline-block shadow ${darkMode ? 'bg-[#181818] border border-orange-600 text-orange-400 hover:bg-orange-900' : 'bg-orange-50 border border-orange-300 text-orange-700 hover:bg-orange-100'}`}>Select Files</label>
                              <div className="flex flex-col gap-1">
                                {eventFiles && eventFiles.map((file, idx) => (
                                  <div key={idx} className={`flex items-center gap-2 text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                                    <span>✔</span>
                                    <span>{file.name}</span>
                                    <button type="button" className={`ml-1 ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`} onClick={() => {
                                      const newFiles = eventFiles.filter((_, i) => i !== idx);
                                      setEventFiles(newFiles);
                                      if (idx === 0 && eventImagePreview) setEventImagePreview(null);
                                    }}>✕</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Image preview for the first selected file */}
                            {eventImagePreview && (
                              <div className="mt-2">
                                <img src={eventImagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded border border-orange-200 dark:border-orange-700 shadow" />
                              </div>
                            )}
                          </div>
                          {/* Action buttons */}
                          <div className="flex justify-end gap-2 mt-4">
                            <button type="button" className={`px-4 py-2 rounded-lg border font-semibold transition ${darkMode ? 'bg-[#232323] border-orange-600 text-orange-400 hover:bg-orange-900' : 'bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200'}`} onClick={() => { setEventModal({ open: false, event: null, date: null }); setEventFiles([]); }}>Cancel</button>
                            <button type="submit" className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 shadow ${darkMode ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-orange-500 text-white hover:bg-orange-600'}`}> 
                              <FiPlus size={18} className="text-white" />
                              Create Event
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                    {/* Right: Info/Preview Section */}
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
            { name: 'Demo User 3', email: 'demo3@email.com', role: 'Investor' },
            { name: 'Demo User 4', email: 'demo4@email.com', role: 'Investor' },
            { name: 'Demo User 5', email: 'demo5@email.com', role: 'Investor' },
            { name: 'Demo User 6', email: 'demo6@email.com', role: 'Entrepreneur' },
            { name: 'Demo User 7', email: 'demo7@email.com', role: 'Entrepreneur' },
            { name: 'Demo User 8', email: 'demo8@email.com', role: 'Entrepreneur' },
            { name: 'Demo User 9', email: 'demo9@email.com', role: 'Entrepreneur' },
            { name: 'Demo User 10', email: 'demo10@email.com', role: 'Entrepreneur' },
          ];
          const filteredUsers = demoUsers.filter(u => roleFilter === 'all' || u.role.toLowerCase() === roleFilter);
          return (
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              {/* User Management Table */}
              <div className={`flex-1 rounded-xl shadow p-6 flex flex-col min-h-[400px] ${darkMode ? 'bg-[#232323] border border-orange-500' : 'bg-white border border-orange-200'}`}>
                {/* Search and Roles */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className={`rounded-lg px-4 py-2 w-full md:w-1/2 focus:outline-none ${darkMode ? 'bg-[#181818] border border-gray-700 text-white' : 'bg-orange-50 border border-orange-300 text-black'}`}
                  />
                  <div className="relative w-full md:w-auto">
                    <select
                      className={`font-semibold rounded-xl px-4 py-2 transition focus:outline-none focus:ring-2 mt-2 md:mt-0 pr-8 relative w-full md:w-auto ${roleFilterAnim} ${darkMode ? 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-400' : 'bg-orange-100 hover:bg-orange-200 text-orange-700 focus:ring-orange-300'}`}
                      value={roleFilter}
                      onChange={e => {
                        setRoleFilterAnim('animate-pulse');
                        setRoleFilter(e.target.value);
                        setTimeout(() => setRoleFilterAnim(''), 400); // Remove animation after 400ms
                      }}
                      style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat' }}
                    >
                      <option value="all">All Roles</option>
                      <option value="administrator">Administrator</option>
                      <option value="investor">Investor</option>
                      <option value="entrepreneur">Entrepreneur</option>
                    </select>
                    {/* Custom arrow icon overlay for select, styled like navbar */}
                    <span className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center" style={{marginTop: '2px'}}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 8L10 12L14 8" stroke={darkMode ? '#fff' : '#FF9800'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
                {/* Table */}
                <div className="overflow-x-auto rounded-lg">
                  <table className={`min-w-full text-left text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <thead>
                      <tr className={`${darkMode ? 'bg-[#333] text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
                        <th className="px-4 py-3 font-semibold">USER PROFILE</th>
                        <th className="px-4 py-3 font-semibold">EMAIL</th>
                        <th className="px-4 py-3 font-semibold">ROLE</th>
                        <th className="px-4 py-3 font-semibold text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, idx) => (
                        <tr key={idx} className={`${darkMode ? 'border-b border-[#333] hover:bg-[#181818]' : 'border-b border-orange-100 hover:bg-orange-50'} transition`}>
                          <td className="px-4 py-3 flex items-center gap-2">
                            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold ${darkMode ? 'bg-orange-700 text-white' : 'bg-orange-400 text-white'}`}>{user.name[0]}</span>
                            <span className={darkMode ? '' : 'text-black'}>{user.name}</span>
                          </td>
                          <td className={darkMode ? 'px-4 py-3' : 'px-4 py-3 text-black'}>{user.email}</td>
                          <td className={darkMode ? 'px-4 py-3' : 'px-4 py-3 text-black'}>{user.role}</td>
                          <td className="px-4 py-3 flex items-center justify-center gap-4">
                            {/* Message icon (restore original color, no filter) */}
                            <button
                              title="Message"
                              className={`rounded-full p-1 flex items-center justify-center focus:outline-none ${darkMode ? 'bg-[#232323]' : 'bg-orange-100'}`}
                              style={{ width: 32, height: 32 }}
                              onClick={() => window.location.href = `mailto:${user.email}?subject=Message from Admin&body=Hello ${user.name},`}
                            >
                              <img
                                src={require('./imgs/messenger.png')}
                                alt="Message"
                                style={{ width: 22, height: 22, display: 'block', objectFit: 'contain' }}
                              />
                            </button>
                            {/* Warning icon (orange for both modes) */}
                            <button
                              title="Send Warning"
                              className="flex items-center justify-center focus:outline-none"
                              style={{ width: 32, height: 32 }}
                              onClick={() => window.location.href = `mailto:${user.email}?subject=Warning from Admin&body=Dear ${user.name},\n\nThis is a warning regarding your account. Please contact support if you have questions.`}
                            >
                              <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="22" stroke="#FF9800" strokeWidth="4"/>
                                <rect x="22" y="14" width="4" height="14" rx="2" fill="#FF9800"/>
                                <circle cx="24" cy="34" r="2" fill="#FF9800"/>
                              </svg>
                            </button>
                            {/* Ban icon (red for both modes) */}
                            <button
                              title="Ban User"
                              className="flex items-center justify-center focus:outline-none"
                              style={{ width: 32, height: 32 }}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to ban ${user.name}?`)) {
                                  alert(`${user.name} has been banned (demo only).`);
                                  // Here you would call your backend to ban the user
                                }
                              }}
                            >
                              <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="22" stroke="#FF0000" strokeWidth="4"/>
                                <line x1="14" y1="14" x2="34" y2="34" stroke="#FF0000" strokeWidth="4" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Pending Requests */}
              <div className={`w-full lg:w-80 rounded-xl shadow p-6 flex flex-col min-h-[400px] max-w-full ${darkMode ? 'bg-[#232323] border border-orange-500' : 'bg-white border border-orange-200'}`}>
                <span className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : 'text-orange-700'}`}>Pending Requests</span>
                <div className="flex flex-col gap-3">
                  {pendingRequests.length === 0 && <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No pending requests.</span>}
                  {pendingRequests.map((req) => (
                    <div key={req.id} className={`rounded-lg p-3 flex flex-col gap-1 border relative ${darkMode ? 'bg-[#181818] border-gray-700' : 'bg-orange-50 border-orange-300'}`}>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>{req.name} <span className={`text-xs ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>• {req.time}</span></span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{req.email}</span>
                      {/* Three dots menu for actions */}
                      <div className={`absolute top-2 right-2 group ${darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-orange-400 hover:text-orange-600'}`}>
                        <button className="focus:outline-none" onClick={() => setPendingRequests(pendingRequests.map(r => r.id === req.id ? { ...r, showMenu: !r.showMenu } : { ...r, showMenu: false }))}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>
                        </button>
                        {req.showMenu && (
                          <div className={`absolute right-0 mt-2 w-28 rounded shadow-lg z-20 flex flex-col animate-fadeIn ${darkMode ? 'bg-[#232323] border border-orange-700' : 'bg-white border border-orange-200'}`}>
                            <button
                              className={`text-left px-4 py-2 text-xs transition ${darkMode ? 'text-gray-300 hover:bg-orange-900 hover:text-orange-400' : 'text-orange-700 hover:bg-orange-100 hover:text-orange-500'}`}
                              onClick={() => { handleIgnoreRequest(req.id); setPendingRequests(pendingRequests.map(r => r.id === req.id ? { ...r, showMenu: false } : r)); }}
                            >Ignore</button>
                            <button
                              className={`text-left px-4 py-2 text-xs transition ${darkMode ? 'text-red-400 hover:bg-red-900 hover:text-white' : 'text-red-600 hover:bg-red-100 hover:text-red-800'}`}
                              onClick={() => {
                                handleRemoveRequest(req.id);
                                setPendingRequests(pendingRequests.filter(r => r.id !== req.id));
                              }}
                            >Remove</button>
                          </div>
                        )}
                      </div>
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
        <aside className={`flex flex-col items-center w-64 min-h-[90vh] rounded-3xl m-6 p-0 shadow-lg transition-colors duration-300 ${darkMode ? 'bg-[#181818] border-none' : 'bg-white border border-gray-200'}`}
          style={{
            border: darkMode ? 'none' : '1.5px solid #e5e7eb',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mt-6 mb-8">
            <img
              src={darkMode ? require('./imgs/TARAKI 10X WHITE.png') : require('./imgs/taraki-logo-black2.png')}
              alt="Taraki Logo"
              className="h-10 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
            />
            <div className="w-20 h-20 rounded-full bg-orange-700 border-8 border-orange-600 flex items-center justify-center mt-8">
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
                    ? (darkMode ? 'bg-orange-600 text-white shadow-md scale-[1.04]' : 'bg-orange-600 text-white shadow-md scale-[1.04]')
                    : (darkMode ? 'hover:bg-orange-900 text-gray-300' : 'hover:bg-orange-100 text-gray-700')}
                  `}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={`text-xl ${darkMode ? 'text-white' : 'text-black'}`}>{tab.icon}</span>
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
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#232323] rounded-xl shadow-lg border border-orange-100 dark:border-gray-700 animate-fadeIn p-2 flex flex-col gap-2">
              {/* Profile info at the top of settings dropdown */}
              <div className="flex items-center gap-3 px-2 py-3 border-b border-orange-100 dark:border-gray-700 mb-2">
                <div className="w-12 h-12 rounded-full bg-orange-700 flex items-center justify-center text-white text-xl font-bold border-4 border-orange-300 shadow-md overflow-hidden aspect-square">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover rounded-full aspect-square" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center">{profile.name[0]}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base text-gray-900 dark:text-white">{profile.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-300">{profile.email}</span>
                </div>
                <button
                  className="ml-auto px-3 py-1 rounded bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition"
                  title="Edit Profile"
                  onClick={() => alert('Profile editing coming soon!')}
                >Edit</button>
              </div>
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