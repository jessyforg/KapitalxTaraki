const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Helper to get user ID (fallback to 1 for localhost/dev)
  function getUserId(req) {
    if (req.user && req.user.id) return req.user.id;
    if (req.query.user_id) return parseInt(req.query.user_id, 10);
    return 1;
  }

  // Get all notifications for the user
  router.get('/', async (req, res) => {
    try {
      const userId = getUserId(req);
      console.log('[DEBUG] /api/notifications userId:', userId);
      const [rows] = await pool.execute(
        `SELECT notification_id AS id, sender_id, type, message AS content, status, url, created_at, priority, is_deleted
         FROM notifications
         WHERE user_id = ? AND (is_deleted IS NULL OR is_deleted = 0)
         ORDER BY created_at DESC
         LIMIT 100`,
        [userId]
      );
      console.log('[DEBUG] /api/notifications rows:', rows);
      const unread_count = rows.filter(n => n.status === 'unread').length;
      res.json({ notifications: rows, unread_count });
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Get unread notification count
  router.get('/unread-count', async (req, res) => {
    try {
      const userId = getUserId(req);
      const [rows] = await pool.execute(
        `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND status = 'unread' AND (is_deleted IS NULL OR is_deleted = 0)`,
        [userId]
      );
      res.json({ count: rows[0].count });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  });

  // Mark a notification as read
  router.post('/:id/read', async (req, res) => {
    try {
      const userId = getUserId(req);
      const notificationId = req.params.id;
      await pool.execute(
        `UPDATE notifications SET status = 'read' WHERE notification_id = ? AND user_id = ?`,
        [notificationId, userId]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to mark as read' });
    }
  });

  // Mark all notifications as read
  router.post('/read-all', async (req, res) => {
    try {
      const userId = getUserId(req);
      await pool.execute(
        `UPDATE notifications SET status = 'read' WHERE user_id = ? AND status = 'unread'`,
        [userId]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to mark all as read' });
    }
  });

  // Delete a notification (soft delete)
  router.delete('/:id', async (req, res) => {
    try {
      const userId = getUserId(req);
      const notificationId = req.params.id;
      await pool.execute(
        `UPDATE notifications SET is_deleted = 1, deleted_at = NOW() WHERE notification_id = ? AND user_id = ?`,
        [notificationId, userId]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  return router;
}; 