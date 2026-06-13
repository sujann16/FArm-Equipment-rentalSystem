const mongoose = require('mongoose');
const Equipment = require('./Equipment');

const reviewSchema = new mongoose.Schema(
  {
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true }
  },
  { timestamps: true }
);

reviewSchema.index({ equipment: 1, reviewer: 1 }, { unique: true });

// Calculate average rating
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
    await Equipment.findByIdAndUpdate(equipmentId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10
    });
  } else {
    await Equipment.findByIdAndUpdate(equipmentId, {
      averageRating: 0
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.equipment);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
