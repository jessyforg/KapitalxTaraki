const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/tickets - fetch all tickets
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

module.exports = router; 