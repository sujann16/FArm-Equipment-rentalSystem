const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/jwt');
const { getCoordinatesForPincode } = require('../utils/geocoder');

const signup = async (req, res, next) => {
  const { firstName, lastName, email, password, role, pinCode, phoneNumber } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User with this email or phone number already exists' });
      return;
    }

    const coordinates = await getCoordinatesForPincode(pinCode);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      pinCode,
      phoneNumber,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${firstName}`
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.cookie('accessToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  let token = req.cookies.refreshToken;

  if (!token && req.body.refreshToken) {
    token = req.body.refreshToken;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Refresh token is missing' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'agrishare-jwt-refresh-secret-67890'
    );

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      res.status(401).json({ success: false, message: 'Invalid or revoked refresh token' });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found with this email' });
      return;
    }

    const resetToken = jwt.sign(
      { id: user._id, type: 'reset' },
      process.env.JWT_SECRET || 'agrishare-jwt-secret-key-12345',
      { expiresIn: '10m' }
    );

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password?token=${resetToken}`;
    console.log(`[PASSWORD RESET MOCK EMAIL] to ${email}: Link -> ${resetUrl}`);

    res.status(200).json({
      success: true,
      message: 'Reset link simulated in terminal logs.',
      resetUrl
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400).json({ success: false, message: 'Token and new password are required' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'agrishare-jwt-secret-key-12345'
    );

    if (decoded.type !== 'reset') {
      res.status(400).json({ success: false, message: 'Invalid reset token type' });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.password = password;
    user.refreshToken = '';
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Password reset token is invalid or expired' });
  }
};

const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not found in request context' });
      return;
    }
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const { firstName, lastName, pinCode, phoneNumber, avatar } = req.body;

  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (avatar) user.avatar = avatar;

    if (pinCode && pinCode !== user.pinCode) {
      user.pinCode = pinCode;
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
};
