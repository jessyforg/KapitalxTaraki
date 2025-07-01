const pool = require('../config/database');

class Event {
  static async create(eventData) {
    const { title, description, event_date, location, organizer_id } = eventData;
    const [result] = await pool.execute(
      'INSERT INTO events (title, description, event_date, location, organizer_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, event_date, location, organizer_id]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT e.*, u.full_name as organizer_name 
      FROM events e 
      JOIN users u ON e.organizer_id = u.id 
      ORDER BY e.event_date DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, eventData) {
    const { title, description, event_date, location, status, rsvp_link, tags } = eventData;
    const [result] = await pool.execute(
      'UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, status = ?, rsvp_link = ?, tags = ? WHERE id = ?',
      [title, description, event_date, location, status, rsvp_link, tags, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM events WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Event; 