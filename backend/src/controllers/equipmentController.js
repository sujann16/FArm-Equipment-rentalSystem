const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { getCoordinatesForPincode } = require('../utils/geocoder');

const createEquipment = async (req, res, next) => {
  const {
    name,
    category,
    images,
    description,
    hourlyPrice,
    dailyPrice,
    address,
    pincode,
    specifications
  } = req.body;

  try {
    const ownerId = req.user?._id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const coordinates = await getCoordinatesForPincode(pincode);

    const equipment = await Equipment.create({
      name,
      category,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600'],
      description,
      hourlyPrice,
      dailyPrice,
      owner: ownerId,
      location: {
        type: 'Point',
        coordinates,
        address,
        pincode
      },
      specifications,
      availability: []
    });

    res.status(201).json({ success: true, equipment });
  } catch (error) {
    next(error);
  }
};

const getEquipments = async (req, res, next) => {
  const { category, pincode, minPrice, maxPrice, startDate, endDate, search } = req.query;

  try {
    const query = {};

    if (category) {
      query.category = category;
    }

    if (pincode) {
      query['location.pincode'] = pincode;
    }

    if (minPrice || maxPrice) {
      query.dailyPrice = {};
      if (minPrice) query.dailyPrice.$gte = Number(minPrice);
      if (maxPrice) query.dailyPrice.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'specifications.manufacturer': { $regex: search, $options: 'i' } },
        { 'specifications.model': { $regex: search, $options: 'i' } }
      ];
    }

    // Date Availability Filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const overlappingBookings = await Booking.find({
        status: { $nin: ['Cancelled'] },
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } }
        ]
      }).select('equipment');

      const bookedEquipmentIds = overlappingBookings.map((b) => b.equipment);
      query._id = { $nin: bookedEquipmentIds };
    }

    const equipments = await Equipment.find(query)
      .populate('owner', 'firstName lastName avatar phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: equipments.length, equipments });
  } catch (error) {
    next(error);
  }
};

const getEquipmentDetails = async (req, res, next) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findById(id).populate('owner', 'firstName lastName avatar phoneNumber pinCode');
    if (!equipment) {
      res.status(404).json({ success: false, message: 'Equipment listing not found' });
      return;
    }

    const reviews = await Review.find({ equipment: id }).populate('reviewer', 'firstName lastName avatar');

    const similarEquipment = await Equipment.find({
      category: equipment.category,
      _id: { $ne: id }
    })
      .populate('owner', 'firstName lastName avatar')
      .limit(4);

    res.status(200).json({
      success: true,
      equipment,
      reviews,
      similarEquipment
    });
  } catch (error) {
    next(error);
  }
};

const updateEquipment = async (req, res, next) => {
  const { id } = req.params;

  try {
    let equipment = await Equipment.findById(id);
    if (!equipment) {
      res.status(404).json({ success: false, message: 'Equipment listing not found' });
      return;
    }

    if (equipment.owner.toString() !== req.user?._id.toString() && req.user?.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Not authorized to edit this listing' });
      return;
    }

    const { pincode } = req.body;
    if (pincode && pincode !== equipment.location.pincode) {
      const coordinates = await getCoordinatesForPincode(pincode);
      req.body.location = {
        ...equipment.location,
        pincode,
        coordinates
      };
    }

    equipment = await Equipment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, equipment });
  } catch (error) {
    next(error);
  }
};

const deleteEquipment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      res.status(404).json({ success: false, message: 'Equipment listing not found' });
      return;
    }

    if (equipment.owner.toString() !== req.user?._id.toString() && req.user?.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
      return;
    }

    await equipment.deleteOne();

    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const discoverNearby = async (req, res, next) => {
  const { lat, lon, maxDistance = 50, category } = req.query;

  if (!lat || !lon) {
    res.status(400).json({ success: false, message: 'Latitude and Longitude are required for discovery' });
    return;
  }

  try {
    const latitude = Number(lat);
    const longitude = Number(lon);
    const distanceInMeters = Number(maxDistance) * 1000;

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: distanceInMeters
        }
      }
    };

    if (category) {
      query.category = category;
    }

    const equipments = await Equipment.find(query).populate('owner', 'firstName lastName avatar phoneNumber');

    res.status(200).json({
      success: true,
      count: equipments.length,
      equipments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEquipment,
  getEquipments,
  getEquipmentDetails,
  updateEquipment,
  deleteEquipment,
  discoverNearby
};
