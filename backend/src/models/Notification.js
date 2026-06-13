const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking_created', 'booking_confirmed', 'booking_cancelled', 'reminder', 'system'],
      default: 'system',
      required: true
    },
    isRead: { type: Boolean, default: false, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
