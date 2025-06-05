const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

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

  // Get all conversations for the logged-in user
  router.get('/conversations', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const showArchived = req.query.archived === '1';
      const query = `
        SELECT DISTINCT u.id, u.full_name, u.role, u.profile_picture_url,
               (SELECT MAX(sent_at) FROM messages 
                WHERE (sender_id = u.id AND receiver_id = ?) 
                OR (sender_id = ? AND receiver_id = u.id)) as last_message_time
        FROM messages m
        JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id)
        LEFT JOIN user_conversations uc ON uc.user_id = ? AND uc.other_user_id = u.id
        WHERE (m.sender_id = ? OR m.receiver_id = ?) 
        AND u.id != ?
        AND (uc.archived IS NULL OR uc.archived = ?)
        ORDER BY last_message_time DESC`;
      const [conversations] = await pool.query(query, [
        userId, userId, userId, userId, userId, userId, showArchived ? 1 : 0
      ]);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get pending message requests
  router.get('/requests', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const query = `
        SELECT cr.*, u.full_name, u.role, u.profile_picture_url,
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
        SELECT m.*, mf.file_name, mf.file_path
        FROM messages m
        LEFT JOIN message_files mf ON m.message_id = mf.message_id
        WHERE (m.sender_id = ? AND m.receiver_id = ?)
        OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.sent_at ASC`;
      const [messages] = await pool.query(query, [
        currentUserId, userId, userId, currentUserId
      ]);
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
          [senderId, receiverId, content, 'approved']
        );
        if (file) {
          await pool.query(
            'INSERT INTO message_files (message_id, file_name, file_path) VALUES (?, ?, ?)',
            [result.insertId, file.originalname, file.path]
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
          [senderId, receiverId, content, 'pending']
        );
        if (file) {
          await pool.query(
            'INSERT INTO message_files (message_id, file_name, file_path) VALUES (?, ?, ?)',
            [messageResult.insertId, file.originalname, file.path]
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
      await pool.query(
        `INSERT INTO user_conversations (user_id, other_user_id, muted) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE muted = ?`,
        [currentUserId, userId, mute, mute]
      );
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
      await pool.query(
        `INSERT INTO user_conversations (user_id, other_user_id, archived) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE archived = ?`,
        [currentUserId, userId, archive, archive]
      );
      res.json({ success: true, archived: archive });
    } catch (error) {
      console.error('Error toggling archive:', error);
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
        SELECT id, full_name, email, role, profile_picture_url
        FROM users
        WHERE (full_name LIKE ? OR email LIKE ?)
        AND id != ?
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

  // Get latest 5 messages (sent or received) for the logged-in user
  router.get('/preview', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const query = `
        SELECT m.message_id, m.sender_id, m.receiver_id, m.content, m.sent_at, m.status,
               u1.full_name AS sender_name, u1.profile_picture_url AS sender_avatar,
               u2.full_name AS receiver_name, u2.profile_picture_url AS receiver_avatar
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.sent_at DESC
        LIMIT 5`;
      const [messages] = await pool.query(query, [userId, userId]);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching message preview:', error);
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

  return router;
}; 