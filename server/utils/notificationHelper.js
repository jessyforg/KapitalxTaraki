const createNotification = async (pool, {
  user_id,
  sender_id = null,
  type,
  message,
  priority = 'medium',
  url = null,
  metadata = null,
  expires_at = null
}) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, sender_id, type, message, priority, url, metadata, expires_at, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unread', NOW())`,
      [user_id, sender_id, type, message, priority, url, JSON.stringify(metadata), expires_at]
    );
    
    // console.log(`✅ Notification created: ${type} for user ${user_id} with ID ${result.insertId}`);
    return result.insertId;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

const createMessageNotification = async (pool, {
  receiver_id,
  sender_id,
  sender_name,
  message_preview
}) => {
  const truncatedPreview = message_preview.length > 50 
    ? message_preview.substring(0, 50) + '...' 
    : message_preview;
    
  return await createNotification(pool, {
    user_id: receiver_id,
    sender_id: sender_id,
    type: 'message',
    message: `New message from ${sender_name}: "${truncatedPreview}"`,
    priority: 'high',
    url: `/messages?chat_with=${sender_id}`,
    metadata: { sender_id, message_preview }
  });
};

const createProfileViewNotification = async (pool, {
  profile_owner_id,
  viewer_id,
  viewer_name,
  viewer_role,
  context = 'profile' // can be 'profile', 'startup', 'investor_dashboard', etc.
}) => {
  // Create context-aware message for all user types
  let message;
  if (viewer_role === 'investor' && context === 'startup') {
    message = `${viewer_name} (investor) viewed your startup profile`;
  } else if (viewer_role === 'entrepreneur' && context === 'investor') {
    message = `${viewer_name} (entrepreneur) viewed your investor profile`;
  } else if (viewer_role === 'admin' && context === 'admin_view') {
    message = `${viewer_name} (admin) viewed your profile`;
  } else if (context === 'admin_profile') {
    message = `${viewer_name} (${viewer_role}) viewed the admin profile`;
  } else if (viewer_role === 'entrepreneur' && context === 'profile') {
    message = `${viewer_name} (entrepreneur) viewed your profile`;
  } else if (viewer_role === 'investor' && context === 'profile') {
    message = `${viewer_name} (investor) viewed your profile`;
  } else {
    message = `${viewer_name} (${viewer_role}) viewed your profile`;
  }
  
  return await createNotification(pool, {
    user_id: profile_owner_id,
    sender_id: viewer_id,
    type: 'profile_view',
    message: message,
    priority: 'low',
    url: `/profile/${viewer_id}`,
    metadata: { viewer_id, viewer_role, context }
  });
};

const createEventReminderNotification = async (pool, {
  user_id,
  event_id,
  event_title,
  event_date,
  reminder_type = '1_day' // '1_hour', '1_day', '1_week'
}) => {
  const reminderMessages = {
    '1_hour': `Reminder: "${event_title}" starts in 1 hour`,
    '1_day': `Reminder: "${event_title}" is tomorrow`,
    '1_week': `Reminder: "${event_title}" is in 1 week`
  };
  
  return await createNotification(pool, {
    user_id: user_id,
    sender_id: null,
    type: 'event_reminder',
    message: reminderMessages[reminder_type] || `Reminder: "${event_title}" is coming up`,
    priority: 'medium',
    url: `/events/${event_id}`,
    metadata: { event_id, reminder_type, event_date }
  });
};

const createDocumentVerificationNotification = async (pool, {
  user_id,
  document_type,
  verification_status,
  rejection_reason = null
}) => {
  let message;
  let priority = 'medium';
  
  switch (verification_status) {
    case 'approved':
      message = `Your ${document_type} has been approved`;
      priority = 'high';
      break;
    case 'rejected':
      message = `Your ${document_type} was rejected${rejection_reason ? `: ${rejection_reason}` : ''}`;
      priority = 'high';
      break;
    case 'pending':
      message = `Your ${document_type} is under review`;
      break;
    default:
      message = `Document verification status updated: ${verification_status}`;
  }
  
  return await createNotification(pool, {
    user_id: user_id,
    sender_id: null,
    type: 'document_verification',
    message: message,
    priority: priority,
    url: '/profile/documents',
    metadata: { document_type, verification_status, rejection_reason }
  });
};

const createConnectionRequestNotification = async (pool, {
  target_user_id,
  requester_id,
  requester_name,
  requester_role
}) => {
  return await createNotification(pool, {
    user_id: target_user_id,
    sender_id: requester_id,
    type: 'connection_request',
    message: `${requester_name} (${requester_role}) wants to connect with you`,
    priority: 'medium',
    url: '/connections',
    metadata: { requester_id, requester_role }
  });
};

const createWelcomeNotification = async (pool, {
  user_id,
  user_name,
  user_role
}) => {
  const roleMessages = {
    entrepreneur: "Welcome to TARAKI! Start by creating your startup profile and connecting with investors.",
    investor: "Welcome to TARAKI! Explore promising startups and discover investment opportunities.",
    admin: "Welcome to TARAKI Admin Panel! You have full access to manage the platform."
  };
  
  return await createNotification(pool, {
    user_id: user_id,
    sender_id: null,
    type: 'new_registration',
    message: `Welcome ${user_name}! ${roleMessages[user_role] || 'Welcome to TARAKI!'}`,
    priority: 'high',
    url: user_role === 'entrepreneur' ? '/create-startup' : '/dashboard',
    metadata: { user_role, registration_date: new Date().toISOString() }
  });
};

const createStartupApplicationNotification = async (pool, {
  entrepreneur_id,
  startup_name,
  application_status
}) => {
  let message;
  let priority = 'high';
  
  switch (application_status) {
    case 'approved':
      message = `Congratulations! Your startup "${startup_name}" has been approved`;
      break;
    case 'rejected':
      message = `Your startup application "${startup_name}" needs revision`;
      break;
    case 'under_review':
      message = `Your startup "${startup_name}" is under review`;
      priority = 'medium';
      break;
    default:
      message = `Update on your startup "${startup_name}": ${application_status}`;
  }
  
  return await createNotification(pool, {
    user_id: entrepreneur_id,
    sender_id: null,
    type: 'startup_application',
    message: message,
    priority: priority,
    url: '/dashboard',
    metadata: { startup_name, application_status }
  });
};

module.exports = {
  createNotification,
  createMessageNotification,
  createProfileViewNotification,
  createEventReminderNotification,
  createDocumentVerificationNotification,
  createConnectionRequestNotification,
  createWelcomeNotification,
  createStartupApplicationNotification
}; 