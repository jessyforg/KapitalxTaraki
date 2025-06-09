import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaUser, FaSearch, FaInbox, FaArchive, FaChevronDown, FaChevronUp, FaPaperclip, FaArrowLeft, FaInfoCircle, FaBell, FaBellSlash, FaFlag, FaUserCircle, FaTimes, FaEllipsisV, FaPlus } from 'react-icons/fa';
import classNames from 'classnames';
import axios from 'axios';

// Placeholder data for now
const mockConversations = [
  { id: 2, name: 'Jester Perez', role: 'user', avatar: '', lastMessage: 'Hey there!', archived: false },
  { id: 3, name: 'Rod', role: 'user', avatar: '', lastMessage: 'Let me know!', archived: false },
];
const mockRequests = [
  { id: 4, name: 'Jane Doe', role: 'user', avatar: '', intro: 'Hi, can we connect?' },
];
const mockMessages = [
  { id: 1, sender: 'me', content: 'Hello!', files: [] },
  { id: 2, sender: 'them', content: 'Hi there!', files: [] },
];

function Messages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  let initialUser = null, initialToken = null;
  try {
    initialUser = JSON.parse(localStorage.getItem('user'));
    initialToken = localStorage.getItem('token');
  } catch (e) {
    initialUser = null;
    initialToken = null;
  }
  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(initialToken);
  const [storageError, setStorageError] = useState(false);

  // State
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showRequests, setShowRequests] = useState(true);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [fileInput, setFileInput] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new state for categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [openCategoryMenu, setOpenCategoryMenu] = useState(null);

  // Add new state for user status
  const [status, setStatus] = useState(user?.status || 'online');
  const [statusDropdown, setStatusDropdown] = useState(false);
  const statusOptions = [
    { value: 'online', label: 'Online', color: 'bg-green-200 text-green-800' },
    { value: 'invisible', label: 'Invisible', color: 'bg-gray-200 text-gray-800' },
    { value: 'offline', label: 'Offline', color: 'bg-red-200 text-red-800' },
  ];

  // Add new state for selected chat user object
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  // Add selectedRequest state
  const [selectedRequest, setSelectedRequest] = useState(null); // request object, only for requests

  // Add state for toggling info sidebar
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);

  // API Configuration
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await api.get(`/messages/conversations?archived=${showArchived ? '1' : '0'}`);
      console.log('Fetched conversations:', response.data); // DEBUG
      setConversations(response.data);
    } catch (err) {
      setError('Failed to fetch conversations');
      console.error(err);
    }
  };

  // Fetch pending requests
  const fetchRequests = async () => {
    try {
      const response = await api.get('/messages/requests');
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch requests');
      console.error(err);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data);
      console.log('Fetched messages:', response.data);
      scrollToBottom();
    } catch (err) {
      setError('Failed to fetch messages');
      console.error(err);
    }
  };

  // Search users
  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('handleSearch called', search);
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    if (!user || !token) {
      setError('Please log in to search users');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/messages/search/users?q=${encodeURIComponent(search)}`);
      setSearchResults(response.data);
      console.log('Search results:', response.data);
    } catch (err) {
      console.error('Search error:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Clear invalid token
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (e) {
          console.warn('Error clearing localStorage:', e);
        }
        navigate('/login');
      } else {
        setError('Failed to search users. Please try again.');
      }
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !fileInput) || !selectedChat) return;

    const formData = new FormData();
    formData.append('content', messageInput);
    if (fileInput) {
      formData.append('file', fileInput);
    }

    try {
      setLoading(true);
      await api.post(`/messages/${selectedChat}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessageInput('');
      setFileInput(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Re-fetch messages after sending
      fetchMessages(selectedChat);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error === 'A message request is already pending') {
        setError('You already have a pending message request with this user. Please wait for them to respond.');
      } else {
        setError('Failed to send message');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle request actions
  const handleRequestAction = async (requestId, action) => {
    try {
      await api.post(`/messages/requests/${requestId}/${action}`);
      setRequests(prev => prev.filter(req => req.id !== requestId));
      if (action === 'approve') {
        fetchConversations();
      }
    } catch (err) {
      setError(`Failed to ${action} request`);
      console.error(err);
    }
  };

  // Helper to get conversation state
  const getConversationState = (userId) => {
    return conversations.find(c => c.id === userId || c.other_user_id === userId) || {};
  };

  // Toggle mute/archive/block with toggling logic
  const handleToggleMute = async (userId) => {
    const conv = getConversationState(userId);
    const newMute = !conv.muted;
    try {
      await api.post(`/messages/${userId}/mute`, { mute: newMute });
      fetchConversations();
    } catch (err) {
      setError('Failed to toggle mute');
      console.error(err);
    }
  };
  const handleToggleArchive = async (userId) => {
    const conv = getConversationState(userId);
    let newArchive;
    if (selectedCategory === 'archived') {
      newArchive = 0; // Always unarchive in archived view
    } else {
      newArchive = !conv.archived ? 1 : 0;
    }
    try {
      await api.post(`/messages/${userId}/archive`, { archive: newArchive });
      fetchConversations();
      setSelectedChat(null);
      setSelectedChatUser(null);
    } catch (err) {
      setError('Failed to toggle archive');
      console.error(err);
    }
  };
  const handleToggleBlock = async (userId) => {
    const conv = getConversationState(userId);
    const newBlock = !conv.blocked;
    try {
      await api.post(`/messages/${userId}/block`, { block: newBlock });
      fetchConversations();
    } catch (err) {
      setError('Failed to toggle block');
      console.error(err);
    }
  };

  // Submit report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post(`/messages/${selectedChat}/report`, {
        title: formData.get('title'),
        type: formData.get('type'),
        description: formData.get('description')
      });
      setShowReportModal(false);
    } catch (err) {
      setError('Failed to submit report');
      console.error(err);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await api.get('/messages/categories');
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  // Add category handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/messages/categories', { name: newCategoryName });
      setNewCategoryName("");
      setShowAddCategory(false);
      fetchCategories();
    } catch (err) {
      setError('Failed to add category');
    }
  };

  // Assign chat to category handler (placeholder)
  const handleAssignChatToCategory = async (chatId, categoryId) => {
    try {
      await api.post(`/messages/categories/${categoryId}/assign`, { chatId });
      fetchConversations();
    } catch (err) {
      setError('Failed to assign chat to category');
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setStatusDropdown(false);
    await api.post('/messages/users/status', { status: newStatus });
    setUser({ ...user, status: newStatus });
  };

  // Effects
  useEffect(() => {
    // Check localStorage access first
    try {
      localStorage.setItem('storage_test', '1');
      localStorage.removeItem('storage_test');
    } catch (e) {
      setStorageError(true);
      return;
    }

    // Then check user and token
    if (!user || !token) {
      navigate('/login');
      return;
    }

    console.log('Fetching conversations, showArchived:', showArchived);
    fetchConversations();
    fetchRequests();
  }, [showArchived, user, token]);

  useEffect(() => {
    if (selectedChat) {
      if (selectedCategory === 'requests') {
        const req = requests.find(r => r.request_id === selectedChat);
        if (req) {
          const otherUserId = req.sender_id === user.id ? req.receiver_id : req.sender_id;
          fetchMessages(otherUserId);
        }
      } else {
        fetchMessages(selectedChat);
      }
    }
  }, [selectedChat]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const chatWith = searchParams.get('chat_with');
    if (chatWith && !selectedChat) {
      setSelectedChat(Number(chatWith));
      // Optionally: setSelectedChatUser if you want to fetch user info here
    }
  }, [searchParams, selectedChat]);

  useEffect(() => {
    if (selectedCategory === 'archived') {
      setSelectedChat(null);
      setSelectedChatUser(null);
    }
  }, [selectedCategory]);

  // Refactor chatUser logic to always find the correct user
  const chatUser = selectedChat
    ? conversations.find(c => c.id === selectedChat)
      || searchResults.find(u => u.id === selectedChat)
      || selectedChatUser
    : null;

  const isRequest = selectedCategory === 'requests' && selectedRequest && selectedRequest.status === 'pending';

  // Helper: Get shared files from messages
  const sharedFiles = messages
    .flatMap(msg => msg.files || [])
    .filter((file, idx, arr) => file && arr.findIndex(f => f.id === file.id) === idx);

  // Helper: Format last message time
  function formatLastMessageTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      // Show only time, no milliseconds
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // Show only date
      return date.toLocaleDateString();
    }
  }

  // Filter conversations by selected category
  const filteredConversations = selectedCategory === 'all'
    ? conversations
    : conversations.filter(c => c.category_id === selectedCategory);

  // Helper to get robust boolean state
  const getBool = val => val === true || val === 1 || val === '1';

  let chatsToShow = filteredConversations;
  if (selectedCategory === 'requests') {
    chatsToShow = requests;
  } else if (selectedCategory === 'archived') {
    chatsToShow = conversations; // Already filtered by backend for archived
  } else if (selectedCategory !== 'all') {
    chatsToShow = conversations.filter(c => c.category_id === selectedCategory);
  } else {
    // For 'all', use all conversations returned by the backend (already filtered for non-archived)
    chatsToShow = conversations;
  }
  console.log('chatsToShow:', chatsToShow); // DEBUG

  if (storageError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-2xl font-bold text-red-600 mb-4">Storage Error</div>
          <div className="text-gray-700 dark:text-gray-200 mb-4">
            Access to localStorage is not allowed in this browser context.<br />
            Please open this app in a normal browser tab (not an iframe or incognito/private mode), and disable any privacy extensions that block storage.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trk-messages-page min-h-screen bg-[#181818] flex flex-col w-full h-screen p-2 md:p-6">
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex flex-1 w-full h-full max-w-full mx-auto gap-6 items-stretch justify-center">
        {/* Categories Sidebar - floating */}
        <aside className="w-20 min-w-[64px] bg-[#232323] dark:bg-[#181818] flex flex-col items-center py-6 gap-2 h-full rounded-2xl shadow-xl">
          {/* Built-in folders */}
          <button
            className={`w-12 h-12 flex items-center justify-center rounded-xl mb-2 ${selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-[#2d2d2d] text-gray-400'}`}
            onClick={() => { setSelectedCategory('all'); setShowArchived(false); }}
            title="All Chats"
          >
            <FaInbox size={24} />
          </button>
          <button
            className={`w-12 h-12 flex items-center justify-center rounded-xl mb-2 ${selectedCategory === 'requests' ? 'bg-orange-500 text-white' : 'bg-[#2d2d2d] text-gray-400'}`}
            onClick={() => { setSelectedCategory('requests'); setShowArchived(false); }}
            title="Message Requests"
          >
            <FaFlag size={24} />
          </button>
          <button
            className={`w-12 h-12 flex items-center justify-center rounded-xl mb-2 ${selectedCategory === 'archived' ? 'bg-orange-500 text-white' : 'bg-[#2d2d2d] text-gray-400'}`}
            onClick={() => { setSelectedCategory('archived'); setShowArchived(true); }}
            title="Archived"
          >
            <FaArchive size={24} />
          </button>
          {/* User-created categories */}
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`w-12 h-12 flex items-center justify-center rounded-xl mb-2 ${selectedCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-[#2d2d2d] text-gray-400 hover:bg-orange-100 hover:text-orange-600'}`}
              onClick={() => { setSelectedCategory(cat.id); setShowArchived(false); }}
              title={cat.name}
            >
              {cat.icon ? <img src={cat.icon} alt={cat.name} className="w-8 h-8" /> : cat.name.charAt(0).toUpperCase()}
            </button>
          ))}
          {/* Add category button */}
          <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-500 text-white mb-2" onClick={() => setShowAddCategory(true)} title="Add Category">
            <FaPlus size={24} />
          </button>
        </aside>
        {/* Chat List Sidebar - floating */}
        <aside className="w-80 bg-[#232323] dark:bg-[#181818] flex flex-col items-center py-8 px-4 h-full rounded-2xl shadow-xl">
          {/* User Profile */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-600 mb-2 overflow-hidden">
              {user?.profile_image ? (
                <img src={user.profile_image} alt={user.full_name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <FaUser size={40} />
              )}
            </div>
            <div className="font-semibold text-trkblack dark:text-white text-lg">{user?.full_name}</div>
            <div className="relative mt-2">
              <button
                className={`px-4 py-1 rounded-full font-semibold text-sm focus:outline-none flex items-center gap-2 ${statusOptions.find(opt => opt.value === status)?.color || 'bg-green-200 text-green-800'}`}
                onClick={() => setStatusDropdown(v => !v)}
              >
                {statusOptions.find(opt => opt.value === status)?.label || 'Online'}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {statusDropdown && (
                <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-[#232323] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-10">
                  {statusOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-orange-100 dark:hover:bg-orange-900 ${opt.value === status ? 'font-bold' : ''}`}
                      onClick={() => handleStatusChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Search */}
          <form onSubmit={handleSearch} className="w-full mb-4">
            <div className="relative">
              <input
                className="w-full rounded-xl border border-trkblack/10 dark:border-white/10 bg-gray-50 dark:bg-[#232323] py-2 pl-4 pr-10 text-trkblack dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Search chats..."
                value={search}
                onChange={e => { setSearch(e.target.value); console.log('Input changed:', e.target.value); }}
                disabled={loading}
                name="search"
                id="search-input"
                autoComplete="off"
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                disabled={loading}
                id="search-submit-btn"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FaSearch />
                )}
              </button>
            </div>
          </form>
          {/* Search Results or Chat List */}
          <div className="flex-1 w-full overflow-y-auto">
            {search && (searchResults.length > 0 || searchResults.length === 0) ? (
              <>
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 pt-2 pb-1 font-semibold uppercase tracking-wide">Search results</div>
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">No users found.</div>
                ) : (
                  searchResults.map(user => (
                    <button
                      key={user.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-1 transition text-left hover:bg-orange-100 dark:hover:bg-orange-900"
                      onClick={() => {
                        if (user.id !== undefined && user.id !== null) {
                          setSelectedChat(user.id);
                          setSelectedChatUser(user);
                          setSearch("");
                          setSearchResults([]);
                        } else {
                          console.warn('User has no id:', user);
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-600 overflow-hidden">
                        {user.profile_picture_url ? <img src={user.profile_picture_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" /> : <FaUser />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-trkblack dark:text-white truncate">{user.full_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                      </div>
                      <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">{user.role}</div>
                    </button>
                  ))
                )}
              </>
            ) : (
              <>
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 pt-2 pb-1 font-semibold uppercase tracking-wide">Last chats</div>
                {chatsToShow.map(conv => {
                  const isActive = selectedChat === conv.id;
                  const lastMsgPrefix = conv.last_sender_id === user.id ? 'You: ' : '';
                  return (
                    <div
                      key={conv.id}
                      className={classNames(
                        'relative group',
                        isActive ? 'bg-orange-100 dark:bg-orange-900 border-l-4 border-orange-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                        'rounded-2xl' // Increased border radius
                      )}
                      onClick={() => {
                        setSelectedChat(conv.id);
                        setSelectedRequest(null);
                        setSelectedChatUser(null);
                      }}
                    >
                      <div className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl mb-1 transition text-left">
                        <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-600 overflow-hidden">
                          {conv.profile_picture_url ? (
                            <img src={conv.profile_picture_url} alt={conv.full_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <FaUser />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-trkblack dark:text-white truncate">{conv.full_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {lastMsgPrefix}{conv.last_message}
                          </div>
                        </div>
                        {conv.last_request_status === 'pending' && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded-full font-semibold">Pending</span>
                        )}
                        <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                          {formatLastMessageTime(conv.last_message_time)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </aside>
        {/* Center Chat Area - floating */}
        <main className="flex-1 flex flex-col bg-[#232323] dark:bg-[#232323] rounded-2xl shadow-xl p-0 relative z-10" style={{ minWidth: 0 }}>
          {selectedChat && chatUser ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-8 py-5 border-b border-trkblack/10 dark:border-white/10 bg-[#232323] dark:bg-[#232323] rounded-t-2xl">
                <div className="w-12 h-12 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-600 overflow-hidden">
                  {chatUser.profile_picture_url || chatUser.profile_image ? (
                    <img src={chatUser.profile_picture_url || chatUser.profile_image} alt={chatUser.full_name || chatUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-orange-500" />
                  ) : (
                    <FaUser size={28} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-trkblack dark:text-white text-lg truncate">{chatUser.full_name || chatUser.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {chatUser.status === 'invisible' ? 'Offline' : (chatUser.status ? (chatUser.status.charAt(0).toUpperCase() + chatUser.status.slice(1)) : 'Online')}
                  </div>
                </div>
                {/* Accept/Decline for pending requests (recipient only) */}
                {isRequest && user.id === selectedRequest.receiver_id && (
                  <div className="flex gap-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
                      onClick={() => handleRequestAction(selectedRequest.sender_id, 'approve')}
                    >
                      ✔ Accept
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                      onClick={() => handleRequestAction(selectedRequest.sender_id, 'reject')}
                    >
                      ❌ Decline
                    </button>
                  </div>
                )}
                <button className="text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-full p-2" onClick={() => setShowInfoSidebar(v => !v)}>
                  <FaInfoCircle size={22} />
                </button>
              </div>
              {/* Main chat area: show request UI only for requests, otherwise show messages */}
              {isRequest ? (
                <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
                  <div className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-xl p-6 mb-4 w-full max-w-lg text-center">
                    <div className="font-semibold text-lg mb-2">Message Request</div>
                    <div className="mb-2">{selectedRequest.full_name} wants to chat with you:</div>
                    <div className="italic text-gray-700 dark:text-gray-300 mb-2">"{selectedRequest.intro_message || selectedRequest.content}"</div>
                    <div className="text-xs text-gray-500">Sent at: {selectedRequest.sent_at ? new Date(selectedRequest.sent_at).toLocaleString() : ''}</div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4 bg-[#f5f6fa] dark:bg-[#181818]">
                    {messages.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500 flex-col gap-2">
                        <FaUserCircle size={60} className="mb-2 text-orange-500" />
                        <div className="text-lg font-semibold">No messages yet. Start the conversation!</div>
                      </div>
                    ) : (
                      messages.map(msg => (
                        <div
                          key={msg.message_id || msg.id}
                          className={classNames(
                            "max-w-[70%] px-5 py-3 rounded-2xl text-sm shadow-sm",
                            msg.sender_id === user.id
                              ? "bg-[#2d2d2d] text-white self-end rounded-br-md"
                              : "bg-[#1a1a1a] text-white self-start rounded-bl-md"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs">
                              {msg.sender_id === user.id ? 'You' : chatUser?.name || chatUser?.full_name}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-2">{msg.time || ''}</span>
                          </div>
                          <div>{msg.content}</div>
                          {msg.files?.map(file => (
                            <div key={file.id || file.file_id} className="mt-2">
                              {file.type && file.type.startsWith('image/') ? (
                                <img src={file.url} alt={file.name} className="max-w-[200px] rounded-lg" />
                              ) : (
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                                  <FaPaperclip className="inline" />
                                  {file.name}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Message Input */}
                  <form className="flex items-center gap-2 px-8 py-5 border-t border-trkblack/10 dark:border-white/10 bg-white dark:bg-[#232323]" onSubmit={handleSendMessage}>
                    <label className="cursor-pointer text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900 rounded p-2">
                      <FaPaperclip size={20} />
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={e => setFileInput(e.target.files[0])}
                      />
                    </label>
                    <input
                      className="flex-1 rounded-xl border border-trkblack/10 dark:border-white/10 bg-gray-50 dark:bg-[#232323] py-3 px-5 text-trkblack dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Write your message..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                    />
                    <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-3 font-semibold shadow">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500 flex-col gap-2">
              <FaUserCircle size={60} className="mb-2 text-orange-500" />
              <div className="text-lg font-semibold">Select a conversation or search for a user to start chatting</div>
            </div>
          )}
        </main>
        {/* Right Sidebar: Chat Info & Shared Files - floating */}
        {selectedChat && chatUser && showInfoSidebar && (
          <aside className="w-80 bg-[#232323] dark:bg-[#232323] rounded-2xl shadow-xl flex flex-col py-6 px-4 relative z-10">
            {/* Chat Info */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-600 mb-2 overflow-hidden">
                {chatUser.profile_picture_url || chatUser.profile_image ? (
                  <img src={chatUser.profile_picture_url || chatUser.profile_image} alt={chatUser.full_name || chatUser.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <FaUser size={40} />
                )}
              </div>
              <div className="font-semibold text-trkblack dark:text-white text-lg">{chatUser.full_name || chatUser.name}</div>
              {chatUser.username && (
                <div className="text-xs text-gray-400 mb-2">@{chatUser.username}</div>
              )}
              {/* Action Buttons */}
              <div className="flex gap-4 mt-3 mb-2">
                <button title="View Profile" className="flex flex-col items-center text-gray-300 hover:text-orange-500" onClick={() => navigate(`/profile/${chatUser.id}`)}>
                  <FaUser size={20} />
                  <span className="text-xs mt-1">Profile</span>
                </button>
                <button title={getBool(getConversationState(chatUser.id).muted) ? "Unmute" : "Mute"} className="flex flex-col items-center text-gray-300 hover:text-orange-500" onClick={async () => { await handleToggleMute(chatUser.id); }}>
                  {getBool(getConversationState(chatUser.id).muted) ? <FaBell size={20} /> : <FaBellSlash size={20} />}
                  <span className="text-xs mt-1">{getBool(getConversationState(chatUser.id).muted) ? "Unmute" : "Mute"}</span>
                </button>
                <button
                  title={selectedCategory === 'archived' || getBool(getConversationState(chatUser.id).archived) ? "Unarchive" : "Archive"}
                  className="flex flex-col items-center text-gray-300 hover:text-orange-500"
                  onClick={async () => { await handleToggleArchive(chatUser.id); }}
                >
                  {selectedCategory === 'archived' || getBool(getConversationState(chatUser.id).archived) ? <FaInbox size={20} /> : <FaArchive size={20} />}
                  <span className="text-xs mt-1">{selectedCategory === 'archived' || getBool(getConversationState(chatUser.id).archived) ? "Unarchive" : "Archive"}</span>
                </button>
                <button title={getBool(getConversationState(chatUser.id).blocked) ? "Unblock" : "Block"} className="flex flex-col items-center text-gray-300 hover:text-orange-500" onClick={async () => { await handleToggleBlock(chatUser.id); }}>
                  {getBool(getConversationState(chatUser.id).blocked) ? <FaFlag size={20} /> : <FaFlag size={20} />}
                  <span className="text-xs mt-1">{getBool(getConversationState(chatUser.id).blocked) ? "Unblock" : "Block"}</span>
                </button>
                <button title="Report" className="flex flex-col items-center text-gray-300 hover:text-orange-500" onClick={() => setShowReportModal(true)}>
                  <FaInfoCircle size={20} />
                  <span className="text-xs mt-1">Report</span>
                </button>
              </div>
            </div>
            {/* Shared Files */}
            <div className="mb-6">
              <div className="font-semibold text-trkblack dark:text-white mb-2">Shared files</div>
              <div className="flex flex-col gap-2">
                {sharedFiles.length === 0 && <div className="text-xs text-gray-400">No files shared yet.</div>}
                {sharedFiles.map(file => (
                  <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#232323] hover:bg-orange-50 dark:hover:bg-orange-900 transition">
                    <span className="text-xl">
                      {file.type.startsWith('image/') ? (
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2a2 2 0 110 4 2 2 0 010-4zm8 8H6l2.293-2.293a1 1 0 011.414 0L14 15z" /></svg>
                      ) : (
                        <FaPaperclip />
                      )}
                    </span>
                    <span className="flex-1 truncate text-sm">{file.name}</span>
                    <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form className="bg-white dark:bg-[#232323] rounded-2xl shadow-2xl p-8 max-w-sm w-full relative" onSubmit={handleAddCategory}>
            <button className="absolute top-3 right-3 text-orange-500 hover:text-orange-700" onClick={() => setShowAddCategory(false)} type="button">
              <FaTimes size={24} />
            </button>
            <h2 className="text-xl font-bold text-orange-600 mb-4">Add Category</h2>
            <input className="w-full rounded-lg border border-trkblack/10 dark:border-white/10 bg-gray-50 dark:bg-[#232323] py-2 px-3 text-trkblack dark:text-white mb-4" placeholder="Category name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2 font-semibold shadow w-full">Add</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Messages; 