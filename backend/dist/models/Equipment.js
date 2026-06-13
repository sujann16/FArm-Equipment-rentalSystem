"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equipment = void 0;
const mongoose_1 = require("mongoose");
const equipmentSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    category: {
        type: String,
        enum: ['Tractor', 'Harvester', 'Seeder', 'Rotavator', 'Sprayer', 'Thresher', 'Cultivator', 'Plough'],
        required: true
    },
    images: [{ type: String, required: true }],
    description: { type: String, required: true },
    hourlyPrice: { type: Number, required: true, min: 0 },
    dailyPrice: { type: Number, required: true, min: 0 },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    availability: [
        {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true }
        }
    ],
    location: {
        type: { type: String, enum: ['Point'], default: 'Point', required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: { type: String, required: true },
        pincode: { type: String, required: true, trim: true, index: true }
    },
    specifications: {
        manufacturer: { type: String, required: true, trim: true },
        model: { type: String, required: true, trim: true },
        year: { type: Number, required: true },
        horsepower: { type: Number, required: true },
        condition: {
            type: String,
            enum: ['New', 'Excellent', 'Good', 'Fair'],
            required: true
        },
        width: { type: String },
        weight: { type: String }
    },
    averageRating: { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true });
// 2dsphere index for location proximity queries
equipmentSchema.index({ location: '2dsphere' });
exports.Equipment = (0, mongoose_1.model)('Equipment', equipmentSchema);
exports.default = exports.Equipment;
