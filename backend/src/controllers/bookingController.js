const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Notification = require('../models/Notification');
const { sendWhatsAppMessage } = require('../utils/whatsapp');

const createBooking = async (req, res, next) => {
  const { equipmentId, startDate, endDate, startTime, endTime } = req.body;

  try {
    const renterId = req.user?._id;
    if (!renterId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const equipment = await Equipment.findById(equipmentId).populate('owner');
    if (!equipment) {
      res.status(404).json({ success: false, message: 'Equipment not found' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date(new Date().setHours(0, 0, 0, 0))) {
      res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
      return;
    }

    if (start > end) {
      res.status(400).json({ success: false, message: 'Start date must be before or equal to end date' });
      return;
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      equipment: equipmentId,
      status: { $nin: ['Cancelled'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingBooking) {
      res.status(400).json({
        success: false,
        message: 'Equipment is already reserved during the selected dates'
      });
      return;
    }

    // Calculate total cost
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const totalCost = diffDays * equipment.dailyPrice;

    const booking = await Booking.create({
      equipment: equipmentId,
      renter: renterId,
      startDate: start,
      endDate: end,
      startTime: startTime || '09:00',
      endTime: endTime || '18:00',
      status: 'Pending',
      totalCost
    });

    const owner = equipment.owner;
    await Notification.create({
      user: owner._id,
      message: `New booking request for your ${equipment.name} from ${req.user.firstName} ${req.user.lastName} (${diffDays} days).`,
      type: 'booking_created'
    });

    await Notification.create({
      user: renterId,
      message: `Your booking request for ${equipment.name} has been submitted. Status: Pending.`,
      type: 'booking_created'
    });

    const dateRangeStr = `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
    const ownerMsg = `Hello ${owner.firstName},\n\nYou have received a new booking request for your ${equipment.name} from ${req.user.firstName} for the period ${dateRangeStr}.\n\nPlease log in to AgriShare AI to accept or decline the request.\n\nHappy Renting,\nTeam AgriShare AI`;
    await sendWhatsAppMessage(owner.phoneNumber, ownerMsg);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

const getBookingHistory = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role;

    let bookings;

    if (role === 'Farmer') {
      bookings = await Booking.find({ renter: userId })
        .populate({
          path: 'equipment',
          populate: { path: 'owner', select: 'firstName lastName phoneNumber avatar' }
        })
        .populate('renter', 'firstName lastName phoneNumber')
        .sort({ createdAt: -1 });
    } else if (role === 'Owner') {
      const ownerEquipments = await Equipment.find({ owner: userId });
      const equipIds = ownerEquipments.map((e) => e._id);

      bookings = await Booking.find({ equipment: { $in: equipIds } })
        .populate('equipment')
        .populate('renter', 'firstName lastName phoneNumber avatar pinCode')
        .sort({ createdAt: -1 });
    } else {
      // Admin
      bookings = await Booking.find()
        .populate('equipment')
        .populate('renter', 'firstName lastName phoneNumber')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Confirmed', 'Completed', 'Cancelled'].includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status update request' });
    return;
  }

  try {
    const booking = await Booking.findById(id).populate('renter').populate({
      path: 'equipment',
      populate: { path: 'owner' }
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    const equipment = booking.equipment;
    const ownerId = equipment.owner._id;

    if (ownerId.toString() !== req.user?._id.toString() && req.user?.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
      return;
    }

    booking.status = status;
    await booking.save();

    const renter = booking.renter;
    let notificationMsg = '';
    let whatsappMsg = '';

    if (status === 'Confirmed') {
      notificationMsg = `Your booking for ${equipment.name} has been CONFIRMED by the owner.`;
      whatsappMsg = `Hello ${renter.firstName},\n\nGood news! Your booking request for ${equipment.name} from ${booking.startDate.toLocaleDateString()} to ${booking.endDate.toLocaleDateString()} has been CONFIRMED.\n\nTotal Cost: Rs. ${booking.totalCost}.\n\nSafe farming,\nTeam AgriShare AI`;
    } else if (status === 'Completed') {
      notificationMsg = `Your booking for ${equipment.name} is now complete. Please leave a review!`;
      whatsappMsg = `Hello ${renter.firstName},\n\nYour rental of ${equipment.name} is complete. We hope it helped you! Please take a moment to rate the equipment and owner on the app.\n\nThank you,\nTeam AgriShare AI`;
    } else if (status === 'Cancelled') {
      notificationMsg = `Your booking for ${equipment.name} was cancelled.`;
      whatsappMsg = `Hello ${renter.firstName},\n\nYour booking request for ${equipment.name} has been CANCELLED.\n\nFor queries, reply to this message.\n\nTeam AgriShare AI`;
    }

    await Notification.create({
      user: renter._id,
      message: notificationMsg,
      type: status === 'Cancelled' ? 'booking_cancelled' : 'booking_confirmed'
    });

    await sendWhatsAppMessage(renter.phoneNumber, whatsappMsg);

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id).populate('renter').populate({
      path: 'equipment',
      populate: { path: 'owner' }
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    const equipment = booking.equipment;
    const owner = equipment.owner;
    const renter = booking.renter;

    if (
      booking.renter._id.toString() !== req.user?._id.toString() &&
      owner._id.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'Admin'
    ) {
      res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
      return;
    }

    if (booking.status === 'Completed') {
      res.status(400).json({ success: false, message: 'Cannot cancel a completed booking' });
      return;
    }

    booking.status = 'Cancelled';
    await booking.save();

    const cancellationNotifyMsg = `Booking for ${equipment.name} from ${booking.startDate.toLocaleDateString()} to ${booking.endDate.toLocaleDateString()} has been cancelled.`;

    await Notification.create({
      user: renter._id,
      message: cancellationNotifyMsg,
      type: 'booking_cancelled'
    });

    await Notification.create({
      user: owner._id,
      message: cancellationNotifyMsg,
      type: 'booking_cancelled'
    });

    const farmerWhatsApp = `Hello ${renter.firstName},\n\nYour booking of ${equipment.name} has been successfully cancelled.\n\nTeam AgriShare AI`;
    const ownerWhatsApp = `Hello ${owner.firstName},\n\nThe booking of ${equipment.name} by ${renter.firstName} for ${booking.startDate.toLocaleDateString()} has been cancelled.\n\nTeam AgriShare AI`;

    await sendWhatsAppMessage(renter.phoneNumber, farmerWhatsApp);
    await sendWhatsAppMessage(owner.phoneNumber, ownerWhatsApp);

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};

const getReservedDates = async (req, res, next) => {
  const { id } = req.params;

  try {
    const bookings = await Booking.find({
      equipment: id,
      status: { $nin: ['Cancelled'] }
    }).select('startDate endDate');

    const reservedDates = [];

    bookings.forEach((booking) => {
      let current = new Date(booking.startDate);
      const end = new Date(booking.endDate);

      while (current <= end) {
        reservedDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    res.status(200).json({ success: true, reservedDates });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookingHistory,
  updateBookingStatus,
  cancelBooking,
  getReservedDates
};
