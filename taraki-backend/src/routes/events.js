const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

module.exports = router; 