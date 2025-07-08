const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

console.log('Messages routes loaded'); // DEBUG LOG

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/');
  },
  filename: function (req, file, cb) {
    cb(null, 'file_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = (pool) => {
  const router = express.Router();

  // Get latest message for each conversation (sent or received) for the logged-in user
  router.get('/preview', auth, async (req, res) => {
    console.log('--- /preview route hit ---'); // DEBUG LOG
    try {
      const userId = req.user.id;
      console.log('Preview endpoint called for user:', userId); // DEBUG LOG
      // Get the latest message for each conversation (between user and each other user)
      const query = `
        SELECT m.message_id, m.sender_id, m.receiver_id, m.content, m.sent_at, m.status,
               CONCAT(u1.first_name, ' ', u1.last_name) AS sender_name, u1.profile_picture_url AS sender_avatar,
               CONCAT(u2.first_name, ' ', u2.last_name) AS receiver_name, u2.profile_picture_url AS receiver_avatar,
               CASE WHEN m.sender_id = ? THEN 'sent' ELSE 'received' END AS direction,
               (SELECT COUNT(*) FROM messages 
                WHERE ((sender_id = u1.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u1.id))
                AND status = 'unread' AND receiver_id = ?) as unread_count
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        INNER JOIN (
          SELECT
            CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_user_id,
            MAX(sent_at) AS last_message_time
          FROM messages
          WHERE sender_id = ? OR receiver_id = ?
          GROUP BY other_user_id
        ) lm ON (
          ((m.sender_id = ? AND m.receiver_id = lm.other_user_id) OR (m.sender_id = lm.other_user_id AND m.receiver_id = ?))
          AND m.sent_at = lm.last_message_time
        )
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.sent_at DESC
        LIMIT 5`;
      const [messages] = await pool.query(query, [
        userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId
      ]);
      console.log('Preview messages:', messages); // DEBUG LOG
      res.json(messages);
    } catch (error) {
      console.error('Error fetching message preview:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all conversations for the logged-in user
  router.get('/conversations', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const showArchived = req.query.archived === '1';
      console.log('Conversations endpoint called for user:', userId, 'showArchived:', showArchived);
      let query, params;
      if (showArchived) {
        query = `
          SELECT DISTINCT
            u.id,
            u.first_name,
            u.last_name,
            u.role,
            u.profile_picture_url,
            m2.content AS last_message,
            m2.sender_id AS last_sender_id,
            m2.receiver_id AS last_receiver_id,
            m2.request_status AS last_request_status,
            m2.sent_at AS last_message_time,
            COALESCE(uc.archived, 0) AS archived
          FROM user_conversations uc
          JOIN users u ON u.id = uc.other_user_id
          LEFT JOIN messages m2 ON (
            ((m2.sender_id = ? AND m2.receiver_id = u.id) OR (m2.sender_id = u.id AND m2.receiver_id = ?))
            AND m2.sent_at = (
              SELECT MAX(sent_at)
              FROM messages
              WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?)
            )
          )
          WHERE uc.user_id = ? AND uc.archived = 1
          ORDER BY m2.sent_at DESC`;
        params = [userId, userId, userId, userId, userId];
      } else {
        query = `
          SELECT DISTINCT
            u.id,
            u.first_name,
            u.last_name,
            u.role,
            u.profile_picture_url,
            m2.content AS last_message,
            m2.sender_id AS last_sender_id,
            m2.receiver_id AS last_receiver_id,
            m2.request_status AS last_request_status,
            m2.sent_at AS last_message_time,
            COALESCE(uc.archived, 0) AS archived
          FROM (
            SELECT
              CASE
                WHEN m.sender_id = ? THEN m.receiver_id
                ELSE m.sender_id
              END AS other_user_id,
              MAX(m.sent_at) AS last_message_time
            FROM messages m
            WHERE m.sender_id = ? OR m.receiver_id = ?
            GROUP BY other_user_id
          ) lm
          JOIN users u ON u.id = lm.other_user_id
          JOIN messages m2 ON (
            ((m2.sender_id = ? AND m2.receiver_id = u.id) OR (m2.sender_id = u.id AND m2.receiver_id = ?))
            AND m2.sent_at = lm.last_message_time
          )
          LEFT JOIN user_conversations uc ON uc.user_id = ? AND uc.other_user_id = u.id
          WHERE (uc.archived IS NULL OR uc.archived = 0)
          ORDER BY lm.last_message_time DESC`;
        params = [userId, userId, userId, userId, userId, userId];
      }
      console.log('Executing query:', query);
      console.log('With params:', params);
      const [conversations] = await pool.query(query, params);
      console.log('Fetched conversations:', conversations);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.error('Error details:', error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

  // Get pending message requests
  router.get('/requests', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const query = `
        SELECT cr.*, u.first_name, u.last_name, u.role, u.profile_picture_url,
               m.content as intro_message, m.sent_at
        FROM conversation_requests cr
        JOIN users u ON cr.sender_id = u.id
        JOIN messages m ON cr.sender_id = m.sender_id 
            AND cr.receiver_id = m.receiver_id 
            AND m.is_intro_message = TRUE
        WHERE cr.receiver_id = ? 
        AND cr.status = 'pending'
        ORDER BY cr.created_at DESC`;
      const [requests] = await pool.query(query, [userId]);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Approve a message request
  router.post('/requests/:senderId/approve', auth, async (req, res) => {
    try {
      const { senderId } = req.params;
      const userId = req.user.id;
      await pool.query('START TRANSACTION');
      await pool.query(
        'UPDATE conversation_requests SET status = ? WHERE sender_id = ? AND receiver_id = ?',
        ['approved', senderId, userId]
      );
      await pool.query(
        'UPDATE messages SET request_status = ? WHERE sender_id = ? AND receiver_id = ? AND is_intro_message = TRUE',
        ['approved', senderId, userId]
      );
      await pool.query('COMMIT');
      res.json({ message: 'Request approved successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error approving request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Reject a message request
  router.post('/requests/:senderId/reject', auth, async (req, res) => {
    try {
      const { senderId } = req.params;
      const userId = req.user.id;
      await pool.query('START TRANSACTION');
      await pool.query(
        'UPDATE conversation_requests SET status = ? WHERE sender_id = ? AND receiver_id = ?',
        ['rejected', senderId, userId]
      );
      await pool.query(
        'UPDATE messages SET request_status = ? WHERE sender_id = ? AND receiver_id = ? AND is_intro_message = TRUE',
        ['rejected', senderId, userId]
      );
      await pool.query('COMMIT');
      res.json({ message: 'Request rejected successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error rejecting request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get messages with a specific user
  router.get('/:userId', auth, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      const query = `
        SELECT m.*, 
               mf.id as file_id,
               mf.file_name, 
               mf.file_path,
               mf.file_size,
               mf.mime_type
        FROM messages m
        LEFT JOIN message_files mf ON m.message_id = mf.message_id
        WHERE (m.sender_id = ? AND m.receiver_id = ?)
        OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.sent_at ASC`;
      const [rows] = await pool.query(query, [
        currentUserId, userId, userId, currentUserId
      ]);
      
      // Group messages with their files
      const messagesMap = new Map();
      
      rows.forEach(row => {
        const messageId = row.message_id;
        
        if (!messagesMap.has(messageId)) {
          messagesMap.set(messageId, {
            message_id: row.message_id,
            sender_id: row.sender_id,
            receiver_id: row.receiver_id,
            content: row.content,
            sent_at: row.sent_at,
            created_at: row.sent_at, // Alias for consistency
            status: row.status,
            request_status: row.request_status,
            is_intro_message: row.is_intro_message,
            files: []
          });
        }
        
        // Add file if it exists
        if (row.file_id) {
          const message = messagesMap.get(messageId);
          const fileUrl = `/uploads/messages/${path.basename(row.file_path)}`;
          
          message.files.push({
            id: row.file_id,
            file_id: row.file_id,
            name: row.file_name,
            filename: row.file_name,
            path: row.file_path,
            url: fileUrl,
            size: row.file_size || 0,
            type: row.mime_type || 'application/octet-stream',
            mimetype: row.mime_type || 'application/octet-stream'
          });
        }
      });
      
      const messages = Array.from(messagesMap.values());
      
      // Mark messages as read
      await pool.query(
        'UPDATE messages SET status = "read" WHERE receiver_id = ? AND sender_id = ? AND status = "unread"',
        [currentUserId, userId]
      );
      
      console.log('Fetched messages with files:', JSON.stringify(messages, null, 2));
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send a message
  router.post('/:userId', auth, upload.single('file'), async (req, res) => {
    try {
      const senderId = req.user.id;
      const receiverId = req.params.userId;
      const content = req.body.content;
      const file = req.file;
      
      // Debug log
      console.log('Send message debug:', {
        body: req.body,
        file: req.file,
        senderId,
        receiverId
      });
      
      // Allow messages with either content or file
      if ((!content || !content.trim()) && !file) {
        return res.status(400).json({ error: 'Message content or file is required' });
      }
      
      await pool.query('START TRANSACTION');
      
      const [existingMessages] = await pool.query(
        `SELECT COUNT(*) as count FROM messages 
         WHERE ((sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)) 
         AND request_status = 'approved'`,
        [senderId, receiverId, receiverId, senderId]
      );
      
      if (existingMessages[0].count > 0) {
        const [result] = await pool.query(
          'INSERT INTO messages (sender_id, receiver_id, content, request_status) VALUES (?, ?, ?, ?)',
          [senderId, receiverId, content || '[File attachment]', 'approved']
        );
        
        if (file) {
          await pool.query(
            'INSERT INTO message_files (message_id, file_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?)',
            [result.insertId, file.originalname, file.path, file.size, file.mimetype]
          );
        }
        
        await pool.query('COMMIT');
        res.json({ message: 'Message sent successfully' });
      } else {
        const [existingRequests] = await pool.query(
          'SELECT * FROM conversation_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
          [senderId, receiverId, receiverId, senderId]
        );
        
        if (existingRequests.length > 0) {
          const request = existingRequests[0];
          if (request.status === 'pending') {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'A message request is already pending' });
          }
          await pool.query('DELETE FROM conversation_requests WHERE request_id = ?', [request.request_id]);
        }
        
        const [requestResult] = await pool.query(
          'INSERT INTO conversation_requests (sender_id, receiver_id) VALUES (?, ?)',
          [senderId, receiverId]
        );
        
        const [messageResult] = await pool.query(
          'INSERT INTO messages (sender_id, receiver_id, content, is_intro_message, request_status) VALUES (?, ?, ?, TRUE, ?)',
          [senderId, receiverId, content || '[File attachment]', 'pending']
        );
        
        if (file) {
          await pool.query(
            'INSERT INTO message_files (message_id, file_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?)',
            [messageResult.insertId, file.originalname, file.path, file.size, file.mimetype]
          );
        }
        
        await pool.query('COMMIT');
        res.json({ message: 'Message request sent successfully' });
      }
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Toggle mute conversation
  router.post('/:userId/mute', auth, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      const { mute } = req.body;
      console.log('Mute endpoint:', { currentUserId, userId, mute });
      const query = `INSERT INTO user_conversations (user_id, other_user_id, muted)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE muted = ?`;
      console.log('Executing query:', query, [currentUserId, userId, mute, mute]);
      await pool.query(query, [currentUserId, userId, mute, mute]);
      res.json({ success: true, muted: mute });
    } catch (error) {
      console.error('Error toggling mute:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Toggle archive conversation
  router.post('/:userId/archive', auth, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      const { archive } = req.body;
      // Coerce archive to 1 or 0
      const archiveValue = (archive === true || archive === 1 || archive === '1') ? 1 : 0;
      console.log('Archive endpoint:', { currentUserId, userId, archive, archiveType: typeof archive, archiveValue });
      const query = `INSERT INTO user_conversations (user_id, other_user_id, archived)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE archived = ?`;
      console.log('Executing query:', query, [currentUserId, userId, archiveValue, archiveValue]);
      const [result] = await pool.query(query, [currentUserId, userId, archiveValue, archiveValue]);
      console.log('Query result:', result);
      res.json({ success: true, archived: archiveValue });
    } catch (error) {
      console.error('Error toggling archive:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Toggle block conversation
  router.post('/:userId/block', auth, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      const { block } = req.body;
      console.log('Block endpoint:', { currentUserId, userId, block });
      const query = `INSERT INTO user_conversations (user_id, other_user_id, blocked)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE blocked = ?`;
      console.log('Executing query:', query, [currentUserId, userId, block, block]);
      await pool.query(query, [currentUserId, userId, block, block]);
      res.json({ success: true, blocked: block });
    } catch (error) {
      console.error('Error toggling block:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Search users endpoint
  router.get('/search/users', auth, async (req, res) => {
    try {
      const { q } = req.query;
      const userId = req.user.id;
      
      if (!q) {
        return res.json([]);
      }

      const query = `
        SELECT id, first_name, last_name, email, role, profile_picture_url
        FROM users
        WHERE (CONCAT(first_name, ' ', last_name) LIKE ? OR email LIKE ?)
        AND id != ?
        AND show_in_messages = 1
        AND id NOT IN (
          SELECT other_user_id 
          FROM user_conversations 
          WHERE user_id = ? AND status = 'blocked'
        )
        LIMIT 10`;
      
      const searchTerm = `%${q}%`;
      const [users] = await pool.query(query, [searchTerm, searchTerm, userId, userId]);
      console.log('Search users debug:', { q, userId, searchTerm, users });
      res.json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all chat categories for the logged-in user
  router.get('/categories', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const [categories] = await pool.query(
        'SELECT * FROM chat_categories WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a new chat category
  router.post('/categories', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, icon } = req.body;
      const [result] = await pool.query(
        'INSERT INTO chat_categories (user_id, name, icon) VALUES (?, ?, ?)',
        [userId, name, icon || null]
      );
      res.json({ id: result.insertId, name, icon });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Assign a chat (conversation) to a category
  router.post('/categories/:categoryId/assign', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { categoryId } = req.params;
      const { otherUserId } = req.body;
      await pool.query(
        `INSERT INTO chat_category_assignments (user_id, other_user_id, category_id)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)`,
        [userId, otherUserId, categoryId]
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Error assigning chat to category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all chats in a category for the logged-in user
  router.get('/categories/:categoryId/chats', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { categoryId } = req.params;
      const [chats] = await pool.query(
        `SELECT other_user_id FROM chat_category_assignments WHERE user_id = ? AND category_id = ?`,
        [userId, categoryId]
      );
      res.json(chats);
    } catch (error) {
      console.error('Error fetching chats by category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update user status
  router.post('/users/status', auth, async (req, res) => {
    const userId = req.user.id;
    const { status } = req.body;
    if (!['online', 'invisible', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    res.json({ success: true, status });
  });

  // Get user info by ID (for new conversations)
  router.get('/users/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
      const [users] = await pool.query('SELECT id, first_name, last_name, profile_picture_url, role FROM users WHERE id = ?', [id]);
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(users[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}; 