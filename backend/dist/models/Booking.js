"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    equipment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
    renter: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '18:00' },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Pending',
        required: true
    },
    totalCost: { type: Number, required: true, min: 0 }
}, { timestamps: true });
exports.Booking = (0, mongoose_1.model)('Booking', bookingSchema);
exports.default = exports.Booking;
