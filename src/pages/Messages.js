import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaUser, FaSearch, FaInbox, FaArchive, FaChevronDown, FaChevronUp, FaPaperclip, FaArrowLeft, FaInfoCircle, FaBell, FaBellSlash, FaFlag, FaUserCircle, FaTimes, FaEllipsisV, FaPlus } from 'react-icons/fa';
import classNames from 'classnames';
import axios from 'axios';

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Initialize user and token first
  let initialUser = null, initialToken = null;
  try {
    initialUser = JSON.parse(localStorage.getItem('user'));
    initialToken = localStorage.getItem('token');
  } catch (e) {
    initialUser = null;
    initialToken = null;
  }

  // Constants
  const statusOptions = [
    { value: 'online', label: 'Online', color: 'bg-green-200 text-green-800' },
    { value: 'invisible', label: 'Invisible', color: 'bg-gray-200 text-gray-800' },
    { value: 'offline', label: 'Offline', color: 'bg-red-200 text-red-800' },
  ];

  // State definitions
  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(initialToken);
  const [storageError, setStorageError] = useState(false);
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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [openCategoryMenu, setOpenCategoryMenu] = useState(null);
  const [status, setStatus] = useState(user?.status || 'online');
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);

  // Add file size and type validation
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  // Add file validation helper
  const validateFile = (file) => {
    if (!file) return { valid: false, error: 'No file selected' };
    
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please upload images, PDFs, Word documents, or text files.' };
    }
    
    return { valid: true };
  };

  // Dynamic API URL that works for both localhost and network access
  const getApiUrl = () => {
    // If we're accessing from localhost, use localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // Otherwise, use the same hostname as the frontend (for network access)
    return `http://${window.location.hostname}:5000/api`;
  };

  // API Configuration
  const api = axios.create({
    baseURL: getApiUrl(),
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Extract filename from path
  const getFileNameFromPath = (filePath) => {
    if (!filePath) return '';
    return filePath.split(/[/\\]/).pop() || '';
  };

  // Add URL cache and messages cache to prevent reconstructing data
  const urlCache = useRef(new Map());
  const messagesCache = useRef(new Map());

  // Get or create cached URL
  const getCachedFileUrl = (file) => {
    const cacheKey = `${file.id || file.file_id}_${file.name || file.filename}_${file.path}`;
    
    if (urlCache.current.has(cacheKey)) {
      return urlCache.current.get(cacheKey);
    }
    
    let url;
    if (file.url?.startsWith('/')) {
      url = `${getApiUrl().replace('/api', '')}${file.url}`;
    } else if (file.url?.startsWith('http')) {
      url = file.url;
    } else {
      url = `${getApiUrl().replace('/api', '')}/uploads/messages/${file.filename || file.name || getFileNameFromPath(file.path)}`;
    }
    
    urlCache.current.set(cacheKey, url);
    return url;
  };

  // Get cached processed message
  const getCachedMessage = (msg) => {
    const cacheKey = `${msg.message_id}_${msg.content}_${msg.files?.length || 0}`;
    
    if (messagesCache.current.has(cacheKey)) {
      return messagesCache.current.get(cacheKey);
    }
    
    const processedMessage = {
      ...msg,
      timestamp: msg.created_at || msg.timestamp || msg.sent_at || new Date().toISOString(),
      files: Array.isArray(msg.files) ? msg.files.map(file => ({
        ...file,
        url: getCachedFileUrl(file),
        type: file.type || file.mimetype || 'application/octet-stream',
        name: file.name || file.filename || 'Untitled',
        size: file.size || 0
      })) : []
    };
    
    messagesCache.current.set(cacheKey, processedMessage);
    return processedMessage;
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await api.get(`/messages/conversations?archived=${showArchived ? '1' : '0'}`);
      console.log('Fetched conversations:', response.data);
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
      console.log('Fetched requests:', response.data);
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch requests');
      console.error(err);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (userId, forceUpdate = false) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      console.log('Fetched messages:', response.data);
      
      // Create a unique signature for this batch of messages
      const messageSignature = response.data.map(msg => 
        `${msg.message_id}_${msg.content}_${msg.files?.length || 0}`
      ).join('|');
      
      // Check if we've already processed this exact set of messages
      const lastSignature = messagesCache.current.get('last_signature');
      if (!forceUpdate && lastSignature === messageSignature && messages.length > 0) {
        console.log('Messages signature unchanged - skipping update');
        return;
      }
      
      // Transform messages to ensure proper file handling and timestamps
      const messagesWithFiles = response.data.map(msg => getCachedMessage(msg));
      
      // Store the signature
      messagesCache.current.set('last_signature', messageSignature);
      
      // Only update if messages have actually changed or if it's a forced update
      if (forceUpdate || !areMessagesEqual(messages, messagesWithFiles)) {
        console.log('Messages updated - setting new messages');
        setMessages(messagesWithFiles);
        scrollToBottom();
      } else {
        console.log('Messages unchanged - skipping update');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    }
  };

  // Message comparison that considers cached objects
  const areMessagesEqual = (oldMessages, newMessages) => {
    if (oldMessages.length !== newMessages.length) {
      return false;
    }
    
    for (let i = 0; i < oldMessages.length; i++) {
      const oldMsg = oldMessages[i];
      const newMsg = newMessages[i];
      
      // Compare essential message properties
      if (
        oldMsg.message_id !== newMsg.message_id ||
        oldMsg.content !== newMsg.content ||
        oldMsg.sender_id !== newMsg.sender_id ||
        oldMsg.receiver_id !== newMsg.receiver_id ||
        (oldMsg.files?.length || 0) !== (newMsg.files?.length || 0)
      ) {
        return false;
      }
      
      // Compare files more carefully
      if (oldMsg.files && newMsg.files) {
        for (let j = 0; j < oldMsg.files.length; j++) {
          const oldFile = oldMsg.files[j];
          const newFile = newMsg.files[j];
          if (
            (oldFile?.id || oldFile?.file_id) !== (newFile?.id || newFile?.file_id) ||
            oldFile?.name !== newFile?.name
          ) {
            return false;
          }
        }
      }
    }
    
    return true;
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

  // Add responsive image size helper
  const useImageDimensions = () => {
    const [dimensions, setDimensions] = useState({ width: 200, maxWidth: '60vw' });

    useEffect(() => {
      const updateDimensions = () => {
        const isMobile = window.innerWidth < 768;
        setDimensions({
          width: isMobile ? 180 : 250,
          maxWidth: isMobile ? '80vw' : '60vw'
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    return dimensions;
  };

  // Memoized ImagePreview component to prevent unnecessary re-renders
  const ImagePreview = React.memo(({ src, alt, className, fileId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const dimensions = useImageDimensions();

    // Reset loading state when src changes
    useEffect(() => {
      setIsLoading(true);
      setError(false);
    }, [src]);

    const handleLoad = useCallback(() => setIsLoading(false), []);
    const handleError = useCallback((e) => {
      console.error('Image load error:', e);
      setError(true);
      setIsLoading(false);
    }, []);

    return (
      <div className={`relative ${className || ''}`} style={{ maxWidth: dimensions.maxWidth }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
          </div>
        )}
        <img
          key={`img-${fileId}-${src}`} // Stable key to prevent remounting
          src={src}
          alt={alt}
          className={`rounded-lg transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ maxWidth: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
          onLoad={handleLoad}
          onError={handleError}
        />
        {error && (
          <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-500">
            Failed to load image
          </div>
        )}
      </div>
    );
  }, (prevProps, nextProps) => {
    // Comparison function for memoization
    return (
      prevProps.src === nextProps.src &&
      prevProps.alt === nextProps.alt &&
      prevProps.className === nextProps.className &&
      prevProps.fileId === nextProps.fileId
    );
  });

  // Update the messages display section
  const renderMessages = () => {
    if (!messages.length) {
      return (
        <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500 flex-col gap-2">
          <FaUserCircle size={40} className="md:w-15 md:h-15 mb-2 text-orange-500" />
          <div className="text-base md:text-lg font-semibold text-center">No messages yet. Start the conversation!</div>
        </div>
      );
    }

    return messages.map(msg => {
      const isOwnMessage = msg.sender_id === user?.id;
      return (
        <div
          key={msg.message_id || msg.id}
          className={classNames(
            "max-w-[85%] md:max-w-[70%] px-4 md:px-5 py-3 rounded-2xl text-sm shadow-sm",
            isOwnMessage
              ? "bg-[#2d2d2d] text-white self-end rounded-br-md"
              : "bg-[#1a1a1a] text-white self-start rounded-bl-md"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-xs">
              {isOwnMessage ? 'You' : `${selectedChatUser?.first_name} ${selectedChatUser?.last_name}`}
            </span>
            <span className="text-[10px] text-gray-400 ml-2">
              {formatMessageTime(msg.created_at || msg.timestamp || msg.sent_at)}
            </span>
          </div>
          
          {/* Message content - only show if it's not the default file attachment text */}
          {msg.content && msg.content !== '[File attachment]' && (
            <div className="text-sm md:text-base break-words mb-2">{msg.content}</div>
          )}
          
          {/* Files display */}
          {msg.files && msg.files.length > 0 && (
            <div className="space-y-2">
              {msg.files.map((file, index) => (
                <div key={file.id || file.file_id || index} className="rounded-lg overflow-hidden">
                  {file.type?.startsWith('image/') ? (
                    <div className="group relative cursor-pointer">
                      <ImagePreview
                        src={file.url}
                        alt={file.name || 'Attached image'}
                        className="w-full"
                        fileId={file.id}
                      />
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            title="Open in new tab"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                          <a
                            href={file.url}
                            download={file.name}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            title="Download"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 bg-black/20 p-2 rounded-lg hover:bg-black/30 transition-colors"
                    >
                      <FaPaperclip className="w-4 h-4 text-orange-500" />
                      <span className="text-sm flex-1 truncate">
                        {file.name || 'Attached file'}
                      </span>
                      {file.size && (
                        <span className="text-xs text-gray-400">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  // Update handleSendMessage to include better file handling
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !fileInput) || !selectedChat) return;

    // Validate file if present
    if (fileInput) {
      const validation = validateFile(fileInput);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }

    const formData = new FormData();
    
    // Only add content if there's actual text
    if (messageInput.trim()) {
      formData.append('content', messageInput.trim());
    }
    
    // Add file if present
    if (fileInput) {
      try {
        formData.append('file', fileInput);
        formData.append('filename', fileInput.name);
        formData.append('filetype', fileInput.type);
        formData.append('filesize', fileInput.size.toString());
        
        // If no text content, add a placeholder
        if (!messageInput.trim()) {
          formData.append('content', '[File attachment]');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Error processing file. Please try again.');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Log formData contents for debugging
      for (let pair of formData.entries()) {
        console.log('FormData:', pair[0], pair[1]);
      }

      const response = await api.post(`/messages/${selectedChat}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds
        maxContentLength: MAX_FILE_SIZE + 1000, // File size + some extra for metadata
      });

      console.log('Message sent response:', response.data);

      // Clear inputs
      setMessageInput('');
      setFileInput(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear caches to ensure fresh data after sending
      clearCaches(true);

      // Fetch updated messages
      await fetchMessages(selectedChat, true);
    } catch (err) {
      console.error('Error sending message:', err);
      
      if (err.response?.status === 413) {
        setError('File is too large. Please upload a file smaller than 5MB.');
      } else if (err.response?.status === 415) {
        setError('File type not supported. Please upload images, PDFs, Word documents, or text files.');
      } else if (err.response?.data?.error === 'A message request is already pending') {
        setError('You already have a pending message request with this user. Please wait for them to respond.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Upload timed out. Please try again with a smaller file.');
      } else if (err.response?.data?.sqlMessage?.includes("'content' cannot be null")) {
        // This shouldn't happen now, but keep the check just in case
        setError('Message content is required. Please try again.');
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle request actions
  const handleRequestAction = async (requestId, action) => {
    try {
      await api.post(`/messages/requests/${requestId}/${action}`);
      
      // Remove from requests list
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      // If approved, refresh conversations and clear selected request state
      if (action === 'approve') {
        await fetchConversations();
        // Clear the selected request state to hide buttons
        setSelectedRequest(null);
        // Refresh messages for the current chat
        if (selectedChat) {
          await fetchMessages(selectedChat, true);
        }
      } else {
        // If rejected, also clear the chat selection
        setSelectedChat(null);
        setSelectedChatUser(null);
        setSelectedRequest(null);
        setMessages([]);
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

  // Clear caches when needed
  const clearCaches = (clearAll = false) => {
    if (clearAll) {
      urlCache.current.clear();
      messagesCache.current.clear();
      console.log('All caches cleared');
    } else {
      // Only clear messages cache, keep URL cache for stability
      messagesCache.current.clear();
      console.log('Messages cache cleared');
    }
  };

  // Update the user selection handler to fetch user info if not present
  const handleSelectChat = async (userId) => {
    if (!userId) {
      console.error('No user ID provided to handleSelectChat');
      return;
    }
    
    // Clear caches when switching to a different chat
    if (selectedChat !== userId) {
      clearCaches(true); // Only clear all caches when switching chats
    }
    
    setSelectedChat(userId);
    
    // If we're in requests view, find the request first
    if (selectedCategory === 'requests') {
      const request = requests.find(r => r.request_id === userId || r.sender_id === userId);
      if (request) {
        setSelectedRequest(request);
        // Use the sender's ID for fetching user info
        const otherUserId = request.sender_id === user.id ? request.receiver_id : request.sender_id;
        try {
          const response = await api.get(`/messages/users/${otherUserId}`);
          setSelectedChatUser(response.data);
        } catch (err) {
          console.error('Failed to fetch user info:', err);
          setError('Failed to fetch user info');
          return;
        }
      }
      return;
    }
    
    // For regular chats, proceed as before
    let userObj = conversations.find(c => c.id === userId) || searchResults.find(u => u.id === userId);
    if (!userObj) {
      try {
        const response = await api.get(`/messages/users/${userId}`);
        userObj = response.data;
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setError('Failed to fetch user info');
        return;
      }
    }
    setSelectedChatUser(userObj);
  };

  // Refactor chatUser logic to always find the correct user
  const chatUser = selectedChat
    ? conversations.find(c => c.id === selectedChat)
      || searchResults.find(u => u.id === selectedChat)
      || selectedChatUser
    : null;

  // Check if current chat is a pending request
  const isPendingRequest = () => {
    // Check if we're in requests view and have a selected request
    if (selectedCategory === 'requests' && selectedRequest && selectedRequest.status === 'pending') {
      return true;
    }
    
    // Check if the selected chat has a pending request status
    const conversation = conversations.find(c => c.id === selectedChat);
    if (conversation && conversation.last_request_status === 'pending') {
      return true;
    }
    
    // Check if there's a pending request for this user in the requests list
    const pendingRequest = requests.find(r => 
      (r.sender_id === selectedChat || r.receiver_id === selectedChat) && 
      r.status === 'pending'
    );
    
    return !!pendingRequest;
  };

  // Get the current pending request data
  const getCurrentPendingRequest = () => {
    if (selectedCategory === 'requests' && selectedRequest && selectedRequest.status === 'pending') {
      return selectedRequest;
    }
    
    return requests.find(r => 
      (r.sender_id === selectedChat || r.receiver_id === selectedChat) && 
      r.status === 'pending'
    );
  };

  const isRequest = selectedCategory === 'requests' && selectedRequest && selectedRequest.status === 'pending';
  const currentPendingRequest = getCurrentPendingRequest();
  const showAcceptDecline = isPendingRequest() && user.id === (currentPendingRequest?.receiver_id);

  // Helper: Get shared files from messages
  const sharedFiles = messages
    .flatMap(msg => msg.files || [])
    .filter((file, idx, arr) => file && arr.findIndex(f => f.id === file.id) === idx);

  // Add a helper function for formatting dates
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      // Handle different timestamp formats
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', timestamp);
        return '';
      }
      
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        return date.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Filter conversations by selected category
  const filteredConversations = selectedCategory === 'all'
    ? conversations
    : conversations.filter(c => c.category_id === selectedCategory);

  // Helper to get robust boolean state
  const getBool = val => val === true || val === 1 || val === '1';

  let chatsToShow = filteredConversations;
  if (selectedCategory === 'requests') {
    chatsToShow = requests.map(req => ({
      ...req,
      id: req.sender_id, // Use sender_id as the ID for requests
      first_name: req.first_name,
      last_name: req.last_name,
      profile_picture_url: req.profile_picture_url,
      last_message: req.intro_message || req.content,
      last_message_time: req.sent_at,
      last_request_status: 'pending'
    }));
  } else if (selectedCategory === 'archived') {
    chatsToShow = conversations.filter(c => getBool(c.archived));
  } else if (selectedCategory !== 'all') {
    chatsToShow = conversations.filter(c => c.category_id === selectedCategory);
  } else {
    chatsToShow = conversations;
  }
      console.log('chatsToShow:', chatsToShow);

  // Real-time polling for messages and conversations
  useEffect(() => {
    let messagePollingInterval;
    let conversationPollingInterval;
    
    if (user && token) {
      // Poll for new messages every 5 seconds when a chat is selected (reduced frequency)
      if (selectedChat) {
        messagePollingInterval = setInterval(() => {
          fetchMessages(selectedChat);
        }, 5000);
      }
      
      // Poll for conversation updates every 15 seconds (reduced frequency)
      conversationPollingInterval = setInterval(() => {
        fetchConversations();
        fetchRequests();
      }, 15000);
    }
    
    // Cleanup intervals
    return () => {
      if (messagePollingInterval) clearInterval(messagePollingInterval);
      if (conversationPollingInterval) clearInterval(conversationPollingInterval);
    };
  }, [selectedChat, user, token]);

  // Focus-based polling - poll more frequently when window is focused
  useEffect(() => {
    let focusPollingInterval;
    
    const handleFocus = () => {
      if (user && token) {
        // Immediate refresh when window gains focus
        fetchConversations();
        fetchRequests();
        if (selectedChat) {
          fetchMessages(selectedChat, true); // Force update when window gains focus
        }
        
        // More frequent polling when focused (every 4 seconds - less aggressive)
        focusPollingInterval = setInterval(() => {
          if (selectedChat) {
            fetchMessages(selectedChat); // Don't force update during polling
          }
          fetchConversations();
        }, 4000);
      }
    };
    
    const handleBlur = () => {
      if (focusPollingInterval) {
        clearInterval(focusPollingInterval);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Start focused polling if already focused
    if (document.hasFocus()) {
      handleFocus();
    }
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      if (focusPollingInterval) clearInterval(focusPollingInterval);
    };
  }, [selectedChat, user, token]);

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
      } else if (selectedCategory === 'archived') {
        // For archived messages, we need to fetch messages for the selected chat
        fetchMessages(selectedChat);
      } else {
        fetchMessages(selectedChat);
      }
    }
  }, [selectedChat, selectedCategory]);

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
    <div className="trk-messages-page min-h-screen bg-white dark:bg-[#181818] flex flex-col w-full h-screen p-2 md:p-6">
      {/* Back Button */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#181818] px-4 py-3 md:p-6 mb-2 md:mb-4 shadow-sm hidden md:block">
        <button
          onClick={() => {
            if (user?.role === 'entrepreneur') {
              navigate('/entrepreneur-dashboard');
            } else if (user?.role === 'investor') {
              navigate('/investor-dashboard');
            } else if (user?.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }}
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium md:font-semibold transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 py-1.5 px-2 -ml-2"
        >
          <FaArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Back to {user?.role === 'entrepreneur' ? 'Dashboard' : user?.role === 'investor' ? 'Dashboard' : user?.role === 'admin' ? 'Admin' : 'Home'}</span>
        </button>
      </div>
      
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
      <div className="flex flex-1 w-full h-full max-w-full mx-auto gap-2 md:gap-6 items-stretch justify-center">
        {/* Categories Sidebar - hidden on mobile */}
        <aside className="hidden md:flex w-20 min-w-[64px] bg-gray-50 dark:bg-[#181818] flex-col items-center py-6 gap-2 h-full rounded-2xl shadow-xl border border-gray-200 dark:border-none">
          {/* Built-in folders */}
          <button
            key="all"
            className={`w-12 h-12 flex items-center justify-center rounded-xl mb-2 ${selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-[#2d2d2d] text-gray-400'}`}
            onClick={() => { setSelectedCategory('all'); setShowArchived(false); }}
            title="All Chats"
          >
            <FaInbox size={24} />
          </button>
          <button
            key="requests"
            className={`w-12 h-12 flex items-center justify-center rounded-xl mb-2 ${selectedCategory === 'requests' ? 'bg-orange-500 text-white' : 'bg-[#2d2d2d] text-gray-400'}`}
            onClick={() => { setSelectedCategory('requests'); setShowArchived(false); }}
            title="Message Requests"
          >
            <FaFlag size={24} />
          </button>
          <button
            key="archived"
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
        {/* Chat List Sidebar - responsive width */}
        <aside className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white dark:bg-[#181818] flex-col items-center py-2 md:py-8 px-2 md:px-4 h-full rounded-2xl shadow-xl border border-gray-200 dark:border-none`}>
          {/* Mobile category tabs */}
          <div className="md:hidden w-full flex gap-1 mb-3 px-1">
            <button
              className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium ${selectedCategory === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-[#2d2d2d] text-gray-600 dark:text-gray-400'}`}
              onClick={() => { setSelectedCategory('all'); setShowArchived(false); }}
            >
              All
            </button>
            <button
              className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium ${selectedCategory === 'requests' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-[#2d2d2d] text-gray-600 dark:text-gray-400'}`}
              onClick={() => { setSelectedCategory('requests'); setShowArchived(false); }}
            >
              Requests
            </button>
            <button
              className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium ${selectedCategory === 'archived' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-[#2d2d2d] text-gray-600 dark:text-gray-400'}`}
              onClick={() => { setSelectedCategory('archived'); setShowArchived(true); }}
            >
              Archived
            </button>
          </div>
          {/* User Profile - hidden on mobile */}
          <div className="hidden md:flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-600 mb-2 overflow-hidden">
              {user?.profile_image ? (
                <img src={user.profile_image} alt={`${user.first_name} ${user.last_name}`} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <FaUser size={40} />
              )}
            </div>
            <div className="font-semibold text-trkblack dark:text-white text-lg">{user?.first_name} {user?.last_name}</div>
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
          <form onSubmit={handleSearch} className="w-full mb-3 px-1">
            <div className="relative">
              <input
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#232323] py-2.5 pl-10 pr-4 text-trkblack dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm shadow-sm"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                disabled={loading}
                id="search-submit-btn"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FaSearch className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
          {/* Search Results or Chat List */}
          <div className="flex-1 w-full overflow-y-auto px-1">
            {search && (searchResults.length > 0 || searchResults.length === 0) ? (
              <>
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 pt-2 pb-1 font-semibold uppercase tracking-wide">Search results</div>
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">No users found.</div>
                ) : (
                  searchResults.map(user => (
                    <button
                      key={`search-${user.id}`}
                      className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-xl mb-1 transition text-left hover:bg-orange-100 dark:hover:bg-orange-900"
                      onClick={() => user.id && handleSelectChat(user.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-600 overflow-hidden">
                        {user.profile_picture_url ? <img src={user.profile_picture_url} alt={`${user.first_name} ${user.last_name}`} className="w-10 h-10 rounded-full object-cover" /> : <FaUser />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-trkblack dark:text-white truncate text-sm">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                      </div>
                      <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">{user.role}</div>
                    </button>
                  ))
                )}
              </>
            ) : (
              <>
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 pt-2 pb-1 font-semibold uppercase tracking-wide">
                  {selectedCategory === 'requests' ? 'Message Requests' : 'Last chats'}
                </div>
                {chatsToShow.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">
                    {selectedCategory === 'requests' ? 'No message requests' : 'No conversations yet'}
                  </div>
                ) : (
                  chatsToShow.map(conv => {
                    const isActive = selectedChat === conv.id;
                    const lastMsgPrefix = conv.last_sender_id === user.id ? 'You: ' : '';
                    return (
                      <div
                        key={`chat-${conv.id}`}
                        className={classNames(
                          'relative group',
                          isActive ? 'bg-orange-100 dark:bg-orange-900 border-l-4 border-orange-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                          'rounded-2xl'
                        )}
                        onClick={() => conv.id && handleSelectChat(conv.id)}
                      >
                        <div className="w-full flex items-start gap-3 px-3 py-3 md:py-2 rounded-2xl mb-1 transition text-left">
                          <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-600 overflow-hidden flex-shrink-0">
                            {conv.profile_picture_url ? (
                              <img src={conv.profile_picture_url} alt={`${conv.first_name} ${conv.last_name}`} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <div className="font-semibold text-trkblack dark:text-white truncate text-sm">
                                {conv.first_name} {conv.last_name}
                              </div>
                              {conv.last_request_status === 'pending' && (
                                <span className="px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded-full font-semibold whitespace-nowrap">
                                  Pending
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {lastMsgPrefix}{conv.last_message}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 whitespace-nowrap self-start mt-0.5">
                            {formatMessageTime(conv.last_message_time)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </aside>
        {/* Center Chat Area - full width on mobile */}
        <main className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col bg-gray-50 dark:bg-[#232323] rounded-2xl shadow-xl p-0 relative z-10 border border-gray-200 dark:border-none`} style={{ minWidth: 0 }}>
          {selectedChat && chatUser ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 md:px-8 py-3 md:py-5 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#232323] rounded-t-2xl shadow-sm">
                {/* Mobile back button */}
                <button 
                  className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                  onClick={() => {
                    setSelectedChat(null);
                    setSelectedChatUser(null);
                    setSelectedRequest(null);
                    setMessages([]);
                    setShowInfoSidebar(true); // Reset sidebar state
                    // Update URL to remove chat_with parameter
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.delete('chat_with');
                    setSearchParams(newSearchParams);
                  }}
                >
                  <FaArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 overflow-hidden">
                  {chatUser.profile_picture_url || chatUser.profile_image ? (
                    <img src={chatUser.profile_picture_url || chatUser.profile_image} alt={`${chatUser.first_name} ${chatUser.last_name}`} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" />
                  ) : (
                    <FaUser className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-trkblack dark:text-white text-base md:text-lg truncate">{chatUser.first_name} {chatUser.last_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${chatUser.status === 'online' ? 'bg-green-500' : chatUser.status === 'invisible' ? 'bg-gray-400' : 'bg-red-500'}`}></span>
                    {chatUser.status === 'invisible' ? 'Offline' : (chatUser.status ? (chatUser.status.charAt(0).toUpperCase() + chatUser.status.slice(1)) : 'Online')}
                  </div>
                </div>
                {/* Accept/Decline for pending requests (recipient only) - Show in all views */}
                {showAcceptDecline && (
                  <div className="flex gap-1.5">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-xl font-medium text-sm shadow-sm"
                      onClick={() => handleRequestAction(currentPendingRequest?.sender_id || selectedChat, 'approve')}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-xl font-medium text-sm shadow-sm"
                      onClick={() => handleRequestAction(currentPendingRequest?.sender_id || selectedChat, 'reject')}
                    >
                      Decline
                    </button>
                  </div>
                )}
                <button 
                  className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg p-2" 
                  onClick={() => setShowInfoSidebar(v => !v)}
                >
                  <FaInfoCircle className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              {/* Main chat area: show request UI only for requests, otherwise show messages */}
              {isRequest ? (
                <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-6">
                  <div className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-xl p-4 md:p-6 mb-4 w-full max-w-lg text-center">
                    <div className="font-semibold text-lg mb-2">Message Request</div>
                    <div className="mb-2">{`${selectedRequest.first_name} ${selectedRequest.last_name}`} wants to chat with you:</div>
                    <div className="italic text-gray-700 dark:text-gray-300 mb-2">"{selectedRequest.intro_message || selectedRequest.content}"</div>
                    <div className="text-xs text-gray-500">Sent at: {selectedRequest.sent_at ? new Date(selectedRequest.sent_at).toLocaleString() : ''}</div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-4 bg-[#f5f6fa] dark:bg-[#181818]">
                    {renderMessages()}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Message Input */}
                  <form className="flex flex-col px-3 md:px-8 py-3 md:py-5 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#232323] rounded-b-2xl" onSubmit={handleSendMessage}>
                    {fileInput && <ImagePreview src={URL.createObjectURL(fileInput)} alt={fileInput.name} className="w-full" fileId={fileInput.id} />}
                    <div className="flex items-center gap-2 mt-2">
                      <label className="cursor-pointer text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg p-2">
                        <FaPaperclip className="w-5 h-5" />
                        <input
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const validation = validateFile(file);
                              if (!validation.valid) {
                                setError(validation.error);
                                e.target.value = ''; // Clear the input
                                return;
                              }
                              setFileInput(file);
                            }
                          }}
                          accept={ALLOWED_FILE_TYPES.join(',')}
                        />
                      </label>
                      <input
                        className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#232323] py-2.5 px-4 text-trkblack dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm shadow-sm"
                        placeholder="Write your message..."
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        className={`rounded-xl px-4 py-2.5 font-medium shadow-sm transition-colors ${messageInput.trim() || fileInput ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                        disabled={!messageInput.trim() && !fileInput}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500 flex-col gap-2">
              <FaUserCircle size={40} className="md:w-15 md:h-15 mb-2 text-orange-500" />
              <div className="text-base md:text-lg font-semibold text-center">Select a conversation or search for a user to start chatting</div>
            </div>
          )}
        </main>
        {/* Right Sidebar: Chat Info & Shared Files - hidden on mobile */}
        {selectedChat && chatUser && showInfoSidebar && (
          <aside className="hidden lg:flex w-80 bg-white dark:bg-[#232323] rounded-2xl shadow-xl flex-col py-6 px-4 relative z-10 border border-gray-200 dark:border-none">
            {/* Chat Info */}
            <div className="flex flex-col items-center mb-8">
              {chatUser.profile_picture_url || chatUser.profile_image ? (
                <img src={chatUser.profile_picture_url || chatUser.profile_image} alt={`${chatUser.first_name} ${chatUser.last_name}`} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <FaUser size={40} />
              )}
              <div className="font-semibold text-trkblack dark:text-white text-lg">{chatUser.first_name} {chatUser.last_name}</div>
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
          <form className="bg-white dark:bg-[#232323] rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full mx-4 relative" onSubmit={handleAddCategory}>
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
};

export default Messages; 