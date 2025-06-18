const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // GET /api/search?q=searchterm
  router.get('/', async (req, res) => {
    const q = req.query.q ? req.query.q.trim() : '';
    if (!q) return res.json([]);
    try {
      // Search users
      const [users] = await pool.execute(
        `SELECT id, CONCAT(first_name, ' ', last_name) AS name, role, profile_image
         FROM users
         WHERE (first_name LIKE ? OR last_name LIKE ? OR full_name LIKE ?)
         LIMIT 10`,
        [`%${q}%`, `%${q}%`, `%${q}%`]
      );
      // Search startups
      const [startups] = await pool.execute(
        `SELECT startup_id AS id, name, industry, logo_url AS logo
         FROM startups
         WHERE name LIKE ? OR industry LIKE ?
         LIMIT 10`,
        [`%${q}%`, `%${q}%`]
      );
      // Format results
      const userResults = users.map(u => ({
        id: u.id,
        name: u.name,
        type: 'user',
        role: u.role,
        profile_image: u.profile_image
      }));
      const startupResults = startups.map(s => ({
        id: s.id,
        name: s.name,
        type: 'startup',
        industry: s.industry,
        logo: s.logo
      }));
      res.json([...userResults, ...startupResults]);
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Search failed' });
    }
  });
  return router;
}; 