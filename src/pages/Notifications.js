import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaFilter, FaTrash, FaCheck } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { getNotifications, markAllNotificationsAsRead, deleteNotification } from '../api/notifications';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar hideNavLinks />
      <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-28 pb-4 sm:pt-24 sm:pb-8">
        <div className="bg-white rounded-xl shadow-lg p-2 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors w-full sm:w-auto"
              >
                <FaCheck />
                <span>Mark all as read</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <FaBell className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-4">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 sm:p-4 rounded-lg border w-full ${
                    notification.is_read ? 'bg-white' : 'bg-orange-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex-1 w-full">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{notification.title}</h3>
                      <p className="text-gray-600 mt-1 text-sm sm:text-base">{notification.content}</p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-2">{formatTime(notification.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      {!notification.is_read && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                          New
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications; 