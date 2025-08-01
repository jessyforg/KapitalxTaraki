import React from 'react';
import { FaHandshake, FaEye, FaClipboardCheck, FaCalendarAlt, FaEnvelope, FaUserPlus, FaBell, FaTimes, FaFileAlt, FaUserCheck, FaBuilding } from 'react-icons/fa';

const NotificationDropdown = ({ 
  notifications, 
  onNotificationClick, 
  onViewAll, 
  formatTime,
  isMobile = window.innerWidth < 768
}) => {
  // Function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match_received':
      case 'investor_match':
      case 'startup_match':
        return <FaHandshake className="text-green-500" />;
      case 'profile_view':
        return <FaEye className="text-blue-500" />;
      case 'startup_status':
      case 'program_status':
        return <FaClipboardCheck className="text-purple-500" />;
      case 'event_reminder':
        return <FaCalendarAlt className="text-orange-500" />;
      case 'message':
        return <FaEnvelope className="text-blue-500" />;
      case 'connection_request':
        return <FaUserPlus className="text-green-500" />;
      case 'document_verification':
        return <FaFileAlt className="text-purple-500" />;
      case 'new_registration':
        return <FaUserCheck className="text-indigo-500" />;
      case 'startup_application':
        return <FaBuilding className="text-yellow-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const containerClasses = `
    bg-white dark:bg-[#232526] 
    border border-gray-200 dark:border-gray-700 
    rounded-xl shadow-2xl
    ${isMobile ? 'w-[95%] max-w-md mx-auto' : 'w-full'}
    transition-all duration-300 ease-in-out
    ${isMobile ? 'animate-slideInFromBottom' : 'animate-fadeIn'}
  `;

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaBell className="text-orange-500" />
          <span className="text-gray-900 dark:text-white">Notifications</span>
        </div>
        {isMobile && (
          <button
            onClick={onViewAll}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close notifications"
          >
            <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <FaBell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-center">No notifications yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">
              We'll notify you when something important happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map(notification => (
              <button
                key={notification.id}
                className={`
                  flex items-center gap-3 w-full px-4 py-3
                  hover:bg-orange-50 dark:hover:bg-orange-900/30 
                  transition-colors duration-200
                  ${!notification.is_read ? 'bg-orange-50/50 dark:bg-orange-900/20' : ''}
                `}
                onClick={() => onNotificationClick(notification)}
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                    {notification.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {notification.content}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatTime(notification.created_at)}
                  </div>
                </div>
                {!notification.is_read && (
                  <span className="flex-shrink-0 ml-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                      New
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isMobile && notifications.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <button
            onClick={onViewAll}
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 