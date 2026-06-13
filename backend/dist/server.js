"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
// Route files
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
// Load env variables
dotenv_1.default.config();
// Connect to database
(0, db_1.connectDB)();
const app = (0, express_1.default)();
// Security Headers
app.use((0, helmet_1.default)());
// CORS configuration (allow requests from frontend Vite dev server)
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
// Body parser
app.use(express_1.default.json());
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Rate limiting (prevent brute force on auth routes)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // max 100 requests per window
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.'
    }
});
// Mount Routes
app.use('/api/auth', authLimiter, authRoutes_1.default);
app.use('/api/equipment', equipmentRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'AgriShare AI API' });
});
// Global Error Handler Middleware
app.use(errorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
exports.default = app;
