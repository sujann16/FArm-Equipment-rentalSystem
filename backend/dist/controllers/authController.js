"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.logout = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const geocoder_1 = require("../utils/geocoder");
const signup = async (req, res, next) => {
    const { firstName, lastName, email, password, role, pinCode, phoneNumber } = req.body;
    try {
        // Check if user already exists
        const userExists = await User_1.default.findOne({ $or: [{ email }, { phoneNumber }] });
        if (userExists) {
            res.status(400).json({ success: false, message: 'User with this email or phone number already exists' });
            return;
        }
        // Resolve pinCode to coordinates
        const coordinates = await (0, geocoder_1.getCoordinatesForPincode)(pinCode);
        // Create user
        const user = await User_1.default.create({
            firstName,
            lastName,
            email,
            password,
            role,
            pinCode,
            phoneNumber,
            // Store mock profile avatar
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${firstName}`
        });
        (0, jwt_1.sendTokenResponse)(user, 201, res);
    }
    catch (error) {
        next(error);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        // Find user
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        (0, jwt_1.sendTokenResponse)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
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
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET || 'agrishare-jwt-refresh-secret-67890');
        const user = await User_1.default.findById(decoded.id);
        if (!user || user.refreshToken !== token) {
            res.status(401).json({ success: false, message: 'Invalid or revoked refresh token' });
            return;
        }
        (0, jwt_1.sendTokenResponse)(user, 200, res);
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
    }
};
exports.refreshToken = refreshToken;
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found with this email' });
            return;
        }
        // Generate short-lived reset token (10 mins) containing user ID
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id, type: 'reset' }, process.env.JWT_SECRET || 'agrishare-jwt-secret-key-12345', { expiresIn: '10m' });
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password?token=${resetToken}`;
        console.log(`[PASSWORD RESET MOCK EMAIL] to ${email}: Link -> ${resetUrl}`);
        res.status(200).json({
            success: true,
            message: 'Reset link simulated in terminal logs.',
            // Return link directly in development for easy user access
            resetUrl
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    const { token, password } = req.body;
    if (!token || !password) {
        res.status(400).json({ success: false, message: 'Token and new password are required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'agrishare-jwt-secret-key-12345');
        if (decoded.type !== 'reset') {
            res.status(400).json({ success: false, message: 'Invalid reset token type' });
            return;
        }
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Set new password (pre-save hook will hash it)
        user.password = password;
        // Revoke current refresh token to force re-auth
        user.refreshToken = '';
        await user.save();
        res.status(200).json({ success: true, message: 'Password reset successful' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Password reset token is invalid or expired' });
    }
};
exports.resetPassword = resetPassword;
const getProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User not found in request context' });
            return;
        }
        res.status(200).json({ success: true, user: req.user });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    const { firstName, lastName, pinCode, phoneNumber, avatar } = req.body;
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phoneNumber)
            user.phoneNumber = phoneNumber;
        if (avatar)
            user.avatar = avatar;
        if (pinCode && pinCode !== user.pinCode) {
            user.pinCode = pinCode;
            // Re-geocode coordinates
            const coordinates = await (0, geocoder_1.getCoordinatesForPincode)(pinCode);
            // We will need to update location index if we store it. Since location coordinate is calculated, 
            // let's verify if we need to store location coordinates in User model. It's stored in User model or Equipment model?
            // Equipment model has coordinates. We will fetch equipment using GeoJSON nearby query using the coordinates we resolve here!
        }
        await user.save();
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
