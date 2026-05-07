const express = require('express');
const router = express.Router();
const { createEvent, getAllEvents, getEventById, deleteEvent, registerForEvent, updateEvent, verifyRegistration, getRegistrationById } = require('../controllers/event');
const { verifyUser, checkUser } = require('../middleware/user');

router.post('/', createEvent);
router.get('/', getAllEvents);
router.get('/:id', checkUser, getEventById);
router.delete('/:id', deleteEvent);
router.patch('/:id', updateEvent);
router.post('/:id/register', verifyUser, registerForEvent);
router.post('/:id/verify-registration', verifyUser, verifyRegistration);
router.get("/registrations/:id", verifyUser, getRegistrationById);

module.exports = router;