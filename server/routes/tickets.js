const express = require('express');
module.exports = (pool) => {
  const router = express.Router();

  // GET /api/tickets - fetch all tickets
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM tickets');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  });

  // POST /api/tickets - submit a new ticket
  router.post('/', async (req, res) => {
    try {
      const { title, description, type } = req.body;
      const user_id = req.user?.id || 1; // Replace with real user ID from auth middleware
      if (!title || !description || !type) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      const now = new Date();
      await pool.query(
        'INSERT INTO tickets (user_id, title, description, type, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, title, description, type, 'open', now]
      );
      res.status(201).json({ message: 'Ticket submitted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit ticket' });
    }
  });

  // PATCH /api/tickets/:id - update admin_response or admin_notes
  router.patch('/:id', async (req, res) => {
    try {
      const { admin_response, admin_notes } = req.body;
      if (!admin_response && !admin_notes) {
        return res.status(400).json({ error: 'No update data provided' });
      }
      const fields = [];
      const values = [];
      if (admin_response !== undefined) {
        fields.push('admin_response = ?');
        values.push(admin_response);
      }
      if (admin_notes !== undefined) {
        fields.push('admin_notes = ?');
        values.push(admin_notes);
      }
      values.push(req.params.id);
      await pool.query(
        `UPDATE tickets SET ${fields.join(', ')} WHERE ticket_id = ?`,
        values
      );
      res.json({ message: 'Ticket updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  });

  return router;
}; 