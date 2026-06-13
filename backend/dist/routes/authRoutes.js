"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = (0, express_1.Router)();
router.post('/signup', [
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('pinCode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be exactly 6 digits'),
    (0, express_validator_1.body)('phoneNumber').notEmpty().withMessage('Phone number is required')
], validationMiddleware_1.validateRequest, authController_1.signup);
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password').exists().withMessage('Password is required')
], validationMiddleware_1.validateRequest, authController_1.login);
router.post('/logout', authController_1.logout);
router.post('/refresh-token', authController_1.refreshToken);
router.post('/forgot-password', [(0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email')], validationMiddleware_1.validateRequest, authController_1.forgotPassword);
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Token is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], validationMiddleware_1.validateRequest, authController_1.resetPassword);
router.get('/profile', authMiddleware_1.protect, authController_1.getProfile);
router.put('/profile', authMiddleware_1.protect, authController_1.updateProfile);
exports.default = router;
