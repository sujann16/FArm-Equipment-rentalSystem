"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTokenResponse = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokens = (userId, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId, role }, process.env.JWT_SECRET || 'agrishare-jwt-secret-key-12345', { expiresIn: process.env.JWT_EXPIRE || '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET || 'agrishare-jwt-refresh-secret-67890', { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const sendTokenResponse = (user, statusCode, res) => {
    const { accessToken, refreshToken } = (0, exports.generateTokens)(user._id.toString(), user.role);
    // Save refresh token to user document
    user.refreshToken = refreshToken;
    user.save().then(() => {
        // Cookie options
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // HTTPS in production
            sameSite: (isProduction ? 'none' : 'lax'),
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matching refresh token expiration)
        };
        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000 // 15 mins
        });
        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.status(statusCode).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                pinCode: user.pinCode,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar
            },
            accessToken // Optional: return accessToken for front-end fallback storage
        });
    });
};
exports.sendTokenResponse = sendTokenResponse;
