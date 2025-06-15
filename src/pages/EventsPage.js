import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import eventImg1 from '../components/imgs/rc1.webp';
import eventImg2 from '../components/imgs/rc2.webp';

// Add this function after the mockEvents array
const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const logo = (
  <span className="font-extrabold text-white text-3xl tracking-tight">FIE<br />LD.</span>
);

function EventsPage() {
  const [tab, setTab] = useState("upcoming");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [filter, setFilter] = useState("All Events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          time: e.time,
          venue: e.location,
          type: e.status // use status as type (upcoming, ongoing, completed)
        }));
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Get unique event dates for highlighting
  const eventDates = events.map(e => e.date?.toDateString()).filter(Boolean);

  // Filter events by tab and filter
  const filteredEvents = events.filter(e =>
    (tab === "upcoming" ? e.type === "upcoming" : e.type === "completed" || e.type === "past") &&
    (filter === "All Events" || (e.tags && e.tags.includes(filter)))
  );

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

  // Example: Add images to events (in real app, this would come from API)
  const eventImages = {};

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <Navbar />
      {/* Add spacing between navbar and events section */}
      <div className="h-10 md:h-24 lg:h-28" />
      {/* Main content */}
      <div className="flex-1 w-full max-w-full mx-auto flex flex-col items-center">
        <div className="w-full max-w-full bg-white rounded-2xl shadow-xl flex flex-col md:flex-row p-4 md:p-8 lg:p-12 mt-0 md:mt-0 border border-gray-100">
          {/* Left: Filters, Tabs, Event List */}
          <div className="flex-[1_1_0%] md:pr-12">
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-8">
              <select
                className="border border-gray-300 rounded px-3 py-2 text-black focus:outline-none bg-gray-50"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option>All Events</option>
                {/* Optionally, dynamically generate tag options from events */}
                {Array.from(new Set(events.flatMap(e => e.tags))).filter(Boolean).map(tag => (
                  <option key={tag}>{tag}</option>
                ))}
              </select>
              <button className="bg-[#ea580c] text-white px-4 py-2 rounded ml-0 sm:ml-2 font-semibold shadow hover:bg-orange-700 transition">Filter</button>
              <div className="flex-1"></div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  className={`px-4 py-2 rounded font-semibold transition ${tab === 'upcoming' ? 'bg-[#ea580c] text-white shadow' : 'bg-gray-100 text-black hover:bg-orange-50'}`}
                  onClick={() => setTab('upcoming')}
                >
                  Upcoming Events
                </button>
                <button
                  className={`px-4 py-2 rounded font-semibold transition ${tab === 'past' ? 'bg-[#ea580c] text-white shadow' : 'bg-gray-100 text-black hover:bg-orange-50'}`}
                  onClick={() => setTab('past')}
                >
                  Past Events
                </button>
              </div>
            </div>
            {/* Event List */}
            <div>
              {loading ? (
                <div className="text-gray-500 text-center py-8">Loading events...</div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
              ) : Object.keys(groupedEvents).length === 0 ? (
                <div className="text-gray-500 text-center py-8">No events found.</div>
              ) : (
                Object.entries(groupedEvents).map(([date, events]) => (
                  <div key={date} className="mb-10">
                    <div className="uppercase text-xs font-bold text-[#ea580c] mb-2 border-b border-[#ea580c]/30 pb-1 tracking-wide">{date}</div>
                    {events.map(event => (
                      <button
                        key={event.id}
                        className="mb-8 pb-4 border-b border-gray-100 last:border-b-0 w-full text-left hover:bg-orange-50 rounded transition"
                        onClick={() => { setSelectedEvent(event); setModalOpen(true); }}
                      >
                        <div className="mb-1">
                          <span className="font-bold text-xl text-black leading-tight block">{event.title}</span>
                          <span className="block text-gray-400 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {event.date ? event.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                            <span className="ml-2">{event.time}</span>
                          </span>
                        </div>
                        <div className="text-gray-700 mb-2 text-base leading-snug">
                          {truncateText(event.description)}
                          {event.description && event.description.length > 100 && (
                            <span className="text-[#ea580c] ml-1">Read more</span>
                          )}
                        </div>
                        {event.venue && (
                          <div className="flex items-center text-gray-500 text-sm mb-2">
                            <svg className="w-4 h-4 mr-1 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 10c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" /></svg>
                            <span>{event.venue}</span>
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {event.tags && event.tags.map(tag => (
                            <span key={tag} className="bg-gray-200 text-xs px-2 py-1 rounded font-semibold text-gray-700">{tag}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Right: Calendar */}
          <div className="w-full md:w-96 mt-8 md:mt-0 flex flex-col items-center">
            <div className="bg-white rounded-lg shadow border border-[#ea580c]/30 p-4 w-full">
              <Calendar
                value={calendarDate}
                onChange={setCalendarDate}
                tileContent={tileContent}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Event Details Modal */}
      {modalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full p-6 relative animate-fadeIn flex flex-col md:flex-row gap-6">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-[#ea580c] text-2xl"
              onClick={() => { setModalOpen(false); setGalleryIndex(0); }}
              aria-label="Close modal"
            >
              &times;
            </button>
            {/* Left side: Event Details */}
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold mb-2 text-[#ea580c]">{selectedEvent.title}</h2>
              <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm">
                <svg className="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="font-bold text-black mr-1">{selectedEvent.date ? selectedEvent.date.toLocaleDateString(undefined, { weekday: 'long' }) : ''}</span>
                <span className="mr-1">{selectedEvent.date ? selectedEvent.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                <span className="mx-1">|</span>
                <span>{selectedEvent.time}</span>
              </div>
              <div className="text-gray-700 mb-3 text-base leading-snug whitespace-pre-line">{selectedEvent.description}</div>
              {selectedEvent.venue && (
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <svg className="w-5 h-5 mr-1 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 10c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" /></svg>
                  <span>{selectedEvent.venue}</span>
                </div>
              )}
              <div className="flex gap-2 flex-wrap mb-4">
                {selectedEvent.tags && selectedEvent.tags.map(tag => (
                  <span key={tag} className="bg-gray-200 text-xs px-2 py-1 rounded font-semibold text-gray-700">{tag}</span>
                ))}
              </div>
              {selectedEvent.rsvpLink && (
                <a
                  href={selectedEvent.rsvpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mb-4 px-6 py-2 bg-[#ea580c] text-white font-semibold rounded shadow hover:bg-orange-700 transition"
                >
                  RSVP / Register
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