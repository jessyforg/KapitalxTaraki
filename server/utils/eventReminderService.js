const { createEventReminderNotification } = require('./notificationHelper');

class EventReminderService {
  constructor(pool) {
    this.pool = pool;
    this.reminderIntervals = new Map(); // Store interval IDs
  }

  // Start the event reminder service
  start() {
    console.log('🕐 Event Reminder Service started');
    
    // Check for events every 15 minutes
    this.checkInterval = setInterval(() => {
      this.checkUpcomingEvents();
    }, 15 * 60 * 1000);

    // Initial check
    this.checkUpcomingEvents();
  }

  // Stop the service
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      console.log('🕐 Event Reminder Service stopped');
    }
    
    // Clear all individual reminder intervals
    this.reminderIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.reminderIntervals.clear();
  }

  // Check for upcoming events and schedule reminders
  async checkUpcomingEvents() {
    try {
      console.log('🔍 Checking for upcoming events...');
      
      // Get events that are upcoming (within the next week)
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      
      const [events] = await this.pool.query(
        `SELECT id as event_id, title, description, event_date, start_time, end_time, status
         FROM events 
         WHERE event_date BETWEEN NOW() AND ? 
         AND status IN ('upcoming', 'ongoing')
         ORDER BY event_date ASC`,
        [oneWeekFromNow]
      );

      console.log(`📅 Found ${events.length} upcoming events`);

      for (const event of events) {
        await this.scheduleEventReminders(event);
      }
    } catch (error) {
      console.error('❌ Error checking upcoming events:', error);
    }
  }

  // Schedule reminders for a specific event
  async scheduleEventReminders(event) {
    try {
      const eventDate = new Date(event.event_date);
      const now = new Date();
      
      // Get all registered participants for this event
      const [participants] = await this.pool.query(
        `SELECT user_id FROM event_registrations 
         WHERE event_id = ? AND status = 'registered'`,
        [event.event_id]
      );

      if (participants.length === 0) {
        console.log(`📅 No participants for event: ${event.title}`);
        return;
      }

      console.log(`📅 Scheduling reminders for ${participants.length} participants of "${event.title}"`);

      // Calculate reminder times
      const oneWeekBefore = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
      const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);

      // Schedule 1 week reminder
      if (now < oneWeekBefore) {
        this.scheduleReminder(event, participants, oneWeekBefore, '1_week');
      }

      // Schedule 1 day reminder
      if (now < oneDayBefore) {
        this.scheduleReminder(event, participants, oneDayBefore, '1_day');
      }

      // Schedule 1 hour reminder
      if (now < oneHourBefore) {
        this.scheduleReminder(event, participants, oneHourBefore, '1_hour');
      }

    } catch (error) {
      console.error(`❌ Error scheduling reminders for event ${event.event_id}:`, error);
    }
  }

  // Schedule a specific reminder
  scheduleReminder(event, participants, reminderTime, reminderType) {
    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Time has passed, send reminder immediately
      this.sendEventReminders(event, participants, reminderType);
      return;
    }

    // Create unique key for this reminder
    const reminderKey = `${event.event_id}_${reminderType}`;
    
    // Clear existing reminder if any
    if (this.reminderIntervals.has(reminderKey)) {
      clearTimeout(this.reminderIntervals.get(reminderKey));
    }

    // Schedule the reminder
    const timeoutId = setTimeout(() => {
      this.sendEventReminders(event, participants, reminderType);
      this.reminderIntervals.delete(reminderKey);
    }, delay);

    this.reminderIntervals.set(reminderKey, timeoutId);

    console.log(`⏰ Scheduled ${reminderType} reminder for "${event.title}" at ${reminderTime.toLocaleString()}`);
  }

  // Send event reminders to participants
  async sendEventReminders(event, participants, reminderType) {
    try {
      console.log(`📢 Sending ${reminderType} reminders for "${event.title}" to ${participants.length} participants`);

      for (const participant of participants) {
        try {
          await createEventReminderNotification(this.pool, {
            user_id: participant.user_id,
            event_id: event.event_id,
            event_title: event.title,
            event_date: event.event_date,
            reminder_type: reminderType
          });
        } catch (error) {
          console.error(`❌ Error sending reminder to user ${participant.user_id}:`, error);
        }
      }

      console.log(`✅ ${reminderType} reminders sent for "${event.title}"`);
    } catch (error) {
      console.error(`❌ Error sending event reminders:`, error);
    }
  }

  // Send immediate reminder for an event (useful for manual triggers)
  async sendImmediateReminder(eventId, reminderType = '1_day') {
    try {
      const [events] = await this.pool.query(
        'SELECT * FROM events WHERE event_id = ?',
        [eventId]
      );

      if (events.length === 0) {
        throw new Error('Event not found');
      }

      const [participants] = await this.pool.query(
        `SELECT user_id FROM event_registrations 
         WHERE event_id = ? AND status = 'registered'`,
        [eventId]
      );

      await this.sendEventReminders(events[0], participants, reminderType);
      return true;
    } catch (error) {
      console.error('❌ Error sending immediate reminder:', error);
      return false;
    }
  }
}

module.exports = EventReminderService; 