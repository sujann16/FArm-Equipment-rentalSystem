const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Dispute', 'Report'], required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', index: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open', required: true }
  },
  { timestamps: true }
);

const Dispute = mongoose.model('Dispute', disputeSchema);
module.exports = Dispute;
