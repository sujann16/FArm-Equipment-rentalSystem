const express = require('express');
const { body } = require('express-validator');
const { signup, login, logout, refreshToken, forgotPassword, resetPassword, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post(
  '/signup',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('pinCode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be exactly 6 digits'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required')
  ],
  validateRequest,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  validateRequest,
  login
);

router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please enter a valid email')],
  validateRequest,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  validateRequest,
  resetPassword
);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
