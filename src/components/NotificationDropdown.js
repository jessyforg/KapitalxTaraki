import React from 'react';
import { FaHandshake, FaEye, FaClipboardCheck, FaCalendarAlt, FaEnvelope, FaUserPlus, FaBell } from 'react-icons/fa';

const NotificationDropdown = ({ 
  notifications, 
  onNotificationClick, 
  onViewAll, 
  formatTime 
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
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[90vw] rounded-xl shadow-2xl z-50 bg-white border border-gray-200">
      <div className="p-4 border-b border-gray-200 font-semibold">Notifications</div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map(notification => (
            <button
              key={notification.id}
              className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors ${
                !notification.is_read ? 'bg-orange-50/50 dark:bg-orange-900/20' : ''
              }`}
              onClick={() => onNotificationClick(notification)}
            >
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm truncate">{notification.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {notification.content.slice(0, 50)}{notification.content.length > 50 ? '…' : ''}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {formatTime(notification.created_at)}
                </div>
                {!notification.is_read && (
                  <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                    New
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
      <div className="border-t border-gray-200 p-2 text-center">
        <button
          className="text-orange-600 hover:underline text-sm font-medium"
          onClick={onViewAll}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown; 