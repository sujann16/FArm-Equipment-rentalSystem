"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['booking_created', 'booking_confirmed', 'booking_cancelled', 'reminder', 'system'],
        default: 'system',
        required: true
    },
    isRead: { type: Boolean, default: false, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
exports.default = exports.Notification;
