const express = require('express');
const router = express.Router();
const { createAppointment, getMyAppointments, getAllAppointments, updateStatus, updateStatusByBookingId, deleteAppointment } = require('../controllers/appointmentController');
const { protect, moderator } = require('../middleware/auth');

router.post('/',              protect, createAppointment);
router.get('/mine',           protect, getMyAppointments);
router.get('/',               protect, moderator, getAllAppointments);
router.patch('/:id/status',         protect, moderator, updateStatus);
router.patch('/by-booking-id/:bookingId/status', protect, moderator, updateStatusByBookingId);
router.delete('/:id',                protect, moderator, deleteAppointment);

module.exports = router;
