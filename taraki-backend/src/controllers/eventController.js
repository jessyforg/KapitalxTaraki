const Event = require('../models/Event');

const eventController = {
  async createEvent(req, res) {
    try {
      const { title, description, event_date, location } = req.body;
      const organizer_id = req.user.id;

      const eventId = await Event.create({
        title,
        description,
        event_date,
        location,
        organizer_id
      });

      res.status(201).json({ message: 'Event created successfully', eventId });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getEvents(req, res) {
    try {
      const events = await Event.findAll();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getEventById(req, res) {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateEvent(req, res) {
    try {
      const { title, description, event_date, location, status, rsvp_link, tags } = req.body;
      const eventId = req.params.id;

      const updated = await Event.update(eventId, {
        title,
        description,
        event_date,
        location,
        status,
        rsvp_link,
        tags
      });

      if (!updated) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const updatedEvent = await Event.findById(eventId);
      res.json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async deleteEvent(req, res) {
    try {
      const eventId = req.params.id;
      const deleted = await Event.delete(eventId);

      if (!deleted) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = eventController; 