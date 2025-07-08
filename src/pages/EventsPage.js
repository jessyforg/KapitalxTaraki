import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendar } from 'react-icons/fa';
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import eventImg1 from '../components/imgs/rc1.webp';
import eventImg2 from '../components/imgs/rc2.webp';
import Navbar from '../components/Navbar';

// Add this function after the mockEvents array
const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const logo = (
  <span className="font-extrabold text-white text-3xl tracking-tight">FIE<br />LD.</span>
);

function EventsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      return null;
    }
  });
  const [tab, setTab] = useState("upcoming");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [filter, setFilter] = useState("All Events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(window.innerWidth >= 768); // Show calendar by default on desktop
  // Add new state for day events modal
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);

  const handleBack = () => {
    if (user?.role === 'entrepreneur') {
      navigate('/entrepreneur-dashboard');
    } else if (user?.role === 'investor') {
      navigate('/investor-dashboard');
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Failed to fetch events');
        let data = await res.json();
        // Convert event_date/time to JS Date objects for calendar
        data = data.map(e => ({
          ...e,
          date: e.event_date ? new Date(e.event_date) : null,
          tags: e.tags ? e.tags.split(',').map(t => t.trim()) : [],
          rsvpLink: e.rsvp_link,
          time: e.start_time && e.end_time 
            ? `${formatTime(e.start_time)} - ${formatTime(e.end_time)}`
            : e.start_time 
            ? formatTime(e.start_time)
            : e.time,
          venue: e.location,
          type: e.status, // use status as type (upcoming, ongoing, completed)
          status: e.status
        }));
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    
    // Set up periodic refresh every minute to get latest status updates
    const interval = setInterval(fetchEvents, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Additional real-time checks for events starting/ending soon
  useEffect(() => {
    const checkAndRefreshForTransitions = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Find events that might transition in the next few minutes
      const eventsNeedingChecks = events.filter(event => {
        if (!event.date || !event.start_time) return false;
        
        const isToday = event.date.toDateString() === now.toDateString();
        if (!isToday) return false;
        
        const [startHour, startMin] = event.start_time.split(':').map(Number);
        const eventStartMinutes = startHour * 60 + startMin;
        
        // Check if event starts within the next 2 minutes or just started
        const timeDiff = eventStartMinutes - currentMinutes;
        return timeDiff >= -2 && timeDiff <= 2;
      });
      
      // If there are events about to transition, refresh the data
      if (eventsNeedingChecks.length > 0) {
        const fetchEvents = async () => {
          try {
            const res = await fetch('/api/events');
            if (!res.ok) throw new Error('Failed to fetch events');
            let data = await res.json();
            data = data.map(e => ({
              ...e,
              date: e.event_date ? new Date(e.event_date) : null,
              tags: e.tags ? e.tags.split(',').map(t => t.trim()) : [],
              rsvpLink: e.rsvp_link,
              time: e.start_time && e.end_time 
                ? `${formatTime(e.start_time)} - ${formatTime(e.end_time)}`
                : e.start_time 
                ? formatTime(e.start_time)
                : e.time,
              venue: e.location,
              type: e.status,
              status: e.status
            }));
            setEvents(data);
          } catch (err) {
            console.error('Error refreshing events:', err);
          }
        };
        fetchEvents();
      }
    };
    
    // Check every 30 seconds for events that are about to start or just started
    const frequentInterval = setInterval(checkAndRefreshForTransitions, 30 * 1000);
    
    return () => clearInterval(frequentInterval);
  }, [events]);

  // Helper function to format time from 24-hour to 12-hour format
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get unique event dates for highlighting
  const eventDates = events.map(e => e.date?.toDateString()).filter(Boolean);

  // Filter events by tab and filter
  const filteredEvents = events.filter(e => {
    // Tab filtering
    let tabMatch = false;
    if (tab === "upcoming") {
      tabMatch = e.type === "upcoming";
    } else if (tab === "ongoing") {
      tabMatch = e.type === "ongoing";
    } else if (tab === "past") {
      tabMatch = e.type === "completed" || e.type === "past";
    }
    
    // Filter by event type/tag
    const filterMatch = filter === "All Events" || (e.tags && e.tags.includes(filter));
    
    return tabMatch && filterMatch;
  });

  // Group events by date
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    if (!event.date) return acc;
    const dateStr = event.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(event);
    return acc;
  }, {});

  // Calendar tile content for highlighting
  function tileContent({ date, view }) {
    if (view === 'month' && eventDates.includes(date.toDateString())) {
      return <div className="w-2 h-2 mx-auto mt-1 rounded-full bg-[#ea580c]"></div>;
    }
    return null;
  }

  // Count events by status
  const eventCounts = {
    upcoming: events.filter(e => e.status === 'upcoming').length,
    ongoing: events.filter(e => e.status === 'ongoing').length,
    past: events.filter(e => e.status === 'completed' || e.status === 'past').length
  };

  // Function to handle date click
  const handleDateClick = (date) => {
    if (!date) return;
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate.toISOString().split('T')[0] === dateStr;
    });
    
    if (dayEvents.length > 0) {
      setSelectedDate(date);
      setSelectedDateEvents(dayEvents);
      setShowDayEventsModal(true);
    }
  };

  // Function to format time
  const formatEventTime = (startTime, endTime) => {
    if (!startTime) return '';
    const formattedStart = formatTime(startTime);
    return endTime ? `${formattedStart} - ${formatTime(endTime)}` : formattedStart;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#18191a]">
      <Navbar hideNavLinks />
      <div className="max-w-[95%] mx-auto pt-24">
        <div className="w-full">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors text-3xl rounded-full w-12 h-12 focus:outline-none focus:ring-2 focus:ring-orange-200"
              aria-label="Back"
            >
              <FaArrowLeft />
            </button>
            <h1 className="font-bold text-2xl laptop-s:text-3xl desktop-s:text-4xl text-gray-800 dark:text-white">
              Events
            </h1>
          </div>
          {/* Main content */}
          <div className="flex-1 w-full max-w-full mx-auto flex flex-col items-center">
            <div className="w-full max-w-full bg-white dark:bg-[#232526] rounded-2xl shadow-xl flex flex-col md:flex-row p-4 md:p-8 lg:p-12 mt-0 md:mt-0 border border-gray-100 dark:border-gray-700">
              {/* Left: Filters, Tabs, Event List */}
              <div className="flex-[1_1_0%] md:pr-12">
                <div className="flex flex-col gap-4 mb-8">
                  {/* Filter row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 md:flex-initial">
                      <select
                        className="flex-1 md:flex-initial border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-black dark:text-white focus:outline-none bg-gray-50 dark:bg-[#18191a]"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                      >
                        <option>All Events</option>
                        {Array.from(new Set(events.flatMap(e => e.tags))).filter(Boolean).map(tag => (
                          <option key={tag}>{tag}</option>
                        ))}
                      </select>
                      <button className="bg-[#ea580c] text-white px-4 py-2 rounded font-semibold shadow hover:bg-orange-700 transition whitespace-nowrap">
                        Filter
                      </button>
                    </div>
                    {/* Calendar toggle for mobile */}
                    <button
                      className="md:hidden flex items-center gap-2 px-4 py-2 rounded bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#444] transition"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <FaCalendar />
                      {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
                    </button>
                  </div>
                  
                  {/* Event type tabs */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${tab === 'upcoming' ? 'bg-[#ea580c] text-white shadow' : 'bg-gray-100 dark:bg-[#232526] text-black dark:text-white hover:bg-orange-50 dark:hover:bg-[#333]'}`}
                      onClick={() => setTab('upcoming')}
                    >
                      Upcoming Events
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === 'upcoming' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {eventCounts.upcoming}
                      </span>
                    </button>
                    <button
                      className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${tab === 'ongoing' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 dark:bg-[#232526] text-black dark:text-white hover:bg-green-50 dark:hover:bg-[#333]'}`}
                      onClick={() => setTab('ongoing')}
                    >
                      🔴 Live Events
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === 'ongoing' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                        {eventCounts.ongoing}
                      </span>
                    </button>
                    <button
                      className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${tab === 'past' ? 'bg-[#ea580c] text-white shadow' : 'bg-gray-100 dark:bg-[#232526] text-black dark:text-white hover:bg-orange-50 dark:hover:bg-[#333]'}`}
                      onClick={() => setTab('past')}
                    >
                      Past Events
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === 'past' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                        {eventCounts.past}
                      </span>
                    </button>
                  </div>
                </div>
                {/* Event List */}
                <div>
                  {loading ? (
                    <div className="text-gray-500 dark:text-gray-300 text-center py-8">Loading events...</div>
                  ) : error ? (
                    <div className="text-red-500 dark:text-red-400 text-center py-8">{error}</div>
                  ) : Object.keys(groupedEvents).length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-300 text-center py-8">
                      {tab === 'ongoing' ? 'No live events at the moment.' : `No ${tab} events found.`}
                    </div>
                  ) : (
                    Object.entries(groupedEvents).map(([date, events]) => (
                      <div key={date} className="mb-10">
                        <div className="uppercase text-xs font-bold text-[#ea580c] mb-2 border-b border-[#ea580c]/30 pb-1 tracking-wide">{date}</div>
                        {events.map(event => (
                          <button
                            key={event.id}
                            className={`mb-8 p-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 w-full text-left hover:bg-orange-50 dark:hover:bg-[#232526] rounded-lg transition relative shadow-sm ${
                              tab === 'upcoming' ? 'bg-white text-gray-800' : 
                              tab === 'ongoing' ? 'bg-green-50 dark:bg-green-900/20 text-gray-800 dark:text-white border-l-4 border-l-green-500' :
                              'bg-gray-100 dark:bg-[#232526] text-black dark:text-white'
                            }`}
                            onClick={() => { setSelectedEvent(event); setModalOpen(true); }}
                          >
                            {/* Live indicator for ongoing events */}
                            {event.status === 'ongoing' && (
                              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg">
                                <svg className="w-4 h-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="8"/>
                                </svg>
                                LIVE
                              </div>
                            )}
                            
                            <div className="mb-1">
                              <span className="font-bold text-xl text-black dark:text-white leading-tight block pr-16">{event.title}</span>
                              <span className="block text-gray-400 dark:text-gray-300 text-sm mt-1 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" /></svg>
                                {event.date ? event.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                                <span className="ml-2">{event.time}</span>
                                {event.status === 'ongoing' && (
                                  <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">• Currently happening</span>
                                )}
                              </span>
                            </div>
                            <div className="text-gray-700 dark:text-gray-200 mb-2 text-base leading-snug">
                              {truncateText(event.description)}
                              {event.description && event.description.length > 100 && (
                                <span className="text-[#ea580c] ml-1">Read more</span>
                              )}
                            </div>
                            {event.venue && (
                              <div className="flex items-center text-gray-500 dark:text-gray-300 text-sm mb-2">
                                <svg className="w-4 h-4 mr-1 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 10c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" /></svg>
                                <span>{event.venue}</span>
                              </div>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              {event.tags && event.tags.map(tag => (
                                <span key={tag} className="bg-gray-200 dark:bg-[#333] text-xs px-2 py-1 rounded font-semibold text-gray-700 dark:text-white">{tag}</span>
                              ))}
                              {event.status === 'ongoing' && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold animate-pulse">
                                  LIVE NOW
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Right: Calendar - Now toggleable on mobile */}
              <div className={`w-full md:w-96 mt-8 md:mt-0 flex flex-col items-center transition-all duration-300 ${showCalendar ? 'block' : 'hidden md:block'}`}>
                <div className="bg-white dark:bg-[#232526] rounded-lg shadow border border-[#ea580c]/30 p-4 w-full calendar-theme-fix">
                  <Calendar
                    value={calendarDate}
                    onChange={setCalendarDate}
                    tileContent={tileContent}
                    onClickDay={handleDateClick}
                    tileClassName={({ date }) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const hasEvents = events.some(event => {
                        const eventDate = new Date(event.event_date);
                        return eventDate.toISOString().split('T')[0] === dateStr;
                      });
                      return hasEvents ? 'cursor-pointer hover:bg-orange-50 dark:hover:bg-[#2a2b2c]' : '';
                    }}
                  />
                </div>
                
                {/* Event Status Summary */}
                <div className="mt-4 w-full bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Event Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Upcoming:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{eventCounts.upcoming}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        🔴 Live:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{eventCounts.ongoing}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                      <span className="font-semibold text-gray-600 dark:text-gray-400">{eventCounts.past}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Day Events Modal */}
      {showDayEventsModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[#232526] w-full md:w-[480px] rounded-t-2xl md:rounded-2xl shadow-xl animate-slideUp md:animate-fadeIn">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#ea580c]">
                {selectedDate.toLocaleDateString(undefined, { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setShowDayEventsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FaArrowLeft className="rotate-90 md:rotate-0" size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {selectedDateEvents.map(event => (
                <div 
                  key={event.id}
                  className="mb-4 last:mb-0 p-4 bg-orange-50/50 dark:bg-[#2a2a2a] rounded-lg border border-orange-100 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-[#2d2d2d] transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setModalOpen(true);
                    setShowDayEventsModal(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#ea580c] dark:text-orange-400">{event.title}</h4>
                    {event.status === 'ongoing' && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {event.time && (
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.venue}</span>
                      </div>
                    )}
                  </div>
                  {event.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {event.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Event Details Modal */}
      {modalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white dark:bg-[#232526] rounded-xl shadow-lg max-w-6xl w-full p-6 relative animate-fadeIn flex flex-col md:flex-row gap-6">
            <button
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-[#ea580c] text-2xl"
              onClick={() => { setModalOpen(false); setGalleryIndex(0); }}
              aria-label="Close modal"
            >
              &times;
            </button>
            {/* Left side: Event Details */}
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-[#ea580c] dark:text-orange-300">{selectedEvent.title}</h2>
                {selectedEvent.status === 'ongoing' && (
                  <span className="bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <svg className="w-4 h-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8"/>
                    </svg>
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-300 text-sm">
                <svg className="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" /></svg>
                <span className="font-bold text-black dark:text-white mr-1">{selectedEvent.date ? selectedEvent.date.toLocaleDateString(undefined, { weekday: 'long' }) : ''}</span>
                <span className="mr-1">{selectedEvent.date ? selectedEvent.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                <span className="mx-1">|</span>
                <span>{selectedEvent.time}</span>
                {selectedEvent.status === 'ongoing' && (
                  <>
                    <span className="mx-1">|</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">Currently happening</span>
                  </>
                )}
              </div>
              <div className="text-gray-700 dark:text-gray-200 mb-3 text-base leading-snug whitespace-pre-line">{selectedEvent.description}</div>
              {selectedEvent.venue && (
                <div className="flex items-center text-gray-500 dark:text-gray-300 text-sm mb-4">
                  <svg className="w-5 h-5 mr-1 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 10c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" /></svg>
                  <span>{selectedEvent.venue}</span>
                </div>
              )}
              <div className="flex gap-2 flex-wrap mb-4">
                {selectedEvent.tags && selectedEvent.tags.map(tag => (
                  <span key={tag} className="bg-gray-200 dark:bg-[#333] text-xs px-2 py-1 rounded font-semibold text-gray-700 dark:text-white">{tag}</span>
                ))}
                {selectedEvent.status === 'ongoing' && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold animate-pulse">
                    LIVE NOW
                  </span>
                )}
              </div>
              {selectedEvent.rsvpLink && (
                <a
                  href={selectedEvent.rsvpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block mb-4 px-6 py-2 font-semibold rounded shadow transition ${
                    selectedEvent.status === 'ongoing' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-[#ea580c] text-white hover:bg-orange-700'
                  }`}
                >
                  {selectedEvent.status === 'ongoing' ? 'Join Live Event' : 'RSVP / Register'}
                </a>
              )}
            </div>
            {/* Right side: Event Gallery Carousel */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Event Gallery</h3>
              {/* No images for now */}
              <div className="text-gray-400">No images available.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage; 