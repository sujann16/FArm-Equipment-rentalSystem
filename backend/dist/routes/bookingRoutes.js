"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bookingController_1 = require("../controllers/bookingController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('Farmer', 'Admin'), [
    (0, express_validator_1.body)('equipmentId').notEmpty().withMessage('Equipment ID is required'),
    (0, express_validator_1.body)('startDate').notEmpty().withMessage('Start date is required'),
    (0, express_validator_1.body)('endDate').notEmpty().withMessage('End date is required')
], validationMiddleware_1.validateRequest, bookingController_1.createBooking);
router.get('/history', authMiddleware_1.protect, bookingController_1.getBookingHistory);
router.get('/:id/invalid-dates', bookingController_1.getReservedDates);
router.patch('/:id/status', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('Owner', 'Admin'), bookingController_1.updateBookingStatus);
router.post('/:id/cancel', authMiddleware_1.protect, bookingController_1.cancelBooking);
exports.default = router;
