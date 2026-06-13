"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const Equipment_1 = __importDefault(require("./Equipment"));
const reviewSchema = new mongoose_1.Schema({
    equipment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
    reviewer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true }
}, { timestamps: true });
// Prevent a user from leaving multiple reviews on the same equipment (optional, but clean)
reviewSchema.index({ equipment: 1, reviewer: 1 }, { unique: true });
// Static method to calculate average rating of an equipment
reviewSchema.statics.calculateAverageRating = async function (equipmentId) {
    const stats = await this.aggregate([
        { $match: { equipment: equipmentId } },
        {
            $group: {
                _id: '$equipment',
                nRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    if (stats.length > 0) {
        await Equipment_1.default.findByIdAndUpdate(equipmentId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10
        });
    }
    else {
        await Equipment_1.default.findByIdAndUpdate(equipmentId, {
            averageRating: 0
        });
    }
};
// Call calculateAverageRating after save
reviewSchema.post('save', async function () {
    // @ts-ignore
    await this.constructor.calculateAverageRating(this.equipment);
});
exports.Review = (0, mongoose_1.model)('Review', reviewSchema);
exports.default = exports.Review;
