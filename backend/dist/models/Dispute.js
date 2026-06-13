"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispute = void 0;
const mongoose_1 = require("mongoose");
const disputeSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['Dispute', 'Report'], required: true },
    booking: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Booking', index: true },
    equipment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Equipment', index: true },
    reporter: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open', required: true }
}, { timestamps: true });
exports.Dispute = (0, mongoose_1.model)('Dispute', disputeSchema);
exports.default = exports.Dispute;
