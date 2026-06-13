const express = require('express');
const { body } = require('express-validator');
const { createBooking, getBookingHistory, updateBookingStatus, cancelBooking, getReservedDates } = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  authorizeRoles('Farmer', 'Admin'),
  [
    body('equipmentId').notEmpty().withMessage('Equipment ID is required'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('endDate').notEmpty().withMessage('End date is required')
  ],
  validateRequest,
  createBooking
);

router.get('/history', protect, getBookingHistory);
router.get('/:id/invalid-dates', getReservedDates);

router.patch('/:id/status', protect, authorizeRoles('Owner', 'Admin'), updateBookingStatus);
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;
