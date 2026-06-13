"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverNearby = exports.deleteEquipment = exports.updateEquipment = exports.getEquipmentDetails = exports.getEquipments = exports.createEquipment = void 0;
const Equipment_1 = __importDefault(require("../models/Equipment"));
const Booking_1 = __importDefault(require("../models/Booking"));
const Review_1 = __importDefault(require("../models/Review"));
const geocoder_1 = require("../utils/geocoder");
const createEquipment = async (req, res, next) => {
    const { name, category, images, description, hourlyPrice, dailyPrice, address, pincode, specifications } = req.body;
    try {
        const ownerId = req.user?._id;
        if (!ownerId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        // Geocode address/pincode to coordinates
        const coordinates = await (0, geocoder_1.getCoordinatesForPincode)(pincode);
        const equipment = await Equipment_1.default.create({
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
            availability: [] // Initially available unless booked
        });
        res.status(201).json({ success: true, equipment });
    }
    catch (error) {
        next(error);
    }
};
exports.createEquipment = createEquipment;
const getEquipments = async (req, res, next) => {
    const { category, pincode, minPrice, maxPrice, startDate, endDate, search } = req.query;
    try {
        const query = {};
        // Filters
        if (category) {
            query.category = category;
        }
        if (pincode) {
            query['location.pincode'] = pincode;
        }
        if (minPrice || maxPrice) {
            query.dailyPrice = {};
            if (minPrice)
                query.dailyPrice.$gte = Number(minPrice);
            if (maxPrice)
                query.dailyPrice.$lte = Number(maxPrice);
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
            // Find bookings that overlap with requested dates
            const overlappingBookings = await Booking_1.default.find({
                status: { $nin: ['Cancelled'] },
                $or: [
                    { startDate: { $lte: end }, endDate: { $gte: start } }
                ]
            }).select('equipment');
            const bookedEquipmentIds = overlappingBookings.map((b) => b.equipment);
            query._id = { $nin: bookedEquipmentIds };
        }
        const equipments = await Equipment_1.default.find(query)
            .populate('owner', 'firstName lastName avatar phoneNumber')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: equipments.length, equipments });
    }
    catch (error) {
        next(error);
    }
};
exports.getEquipments = getEquipments;
const getEquipmentDetails = async (req, res, next) => {
    const { id } = req.params;
    try {
        const equipment = await Equipment_1.default.findById(id).populate('owner', 'firstName lastName avatar phoneNumber pinCode');
        if (!equipment) {
            res.status(404).json({ success: false, message: 'Equipment listing not found' });
            return;
        }
        // Fetch reviews for this equipment
        const reviews = await Review_1.default.find({ equipment: id }).populate('reviewer', 'firstName lastName avatar');
        // Fetch similar equipment (excluding current, same category)
        const similarEquipment = await Equipment_1.default.find({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getEquipmentDetails = getEquipmentDetails;
const updateEquipment = async (req, res, next) => {
    const { id } = req.params;
    try {
        let equipment = await Equipment_1.default.findById(id);
        if (!equipment) {
            res.status(404).json({ success: false, message: 'Equipment listing not found' });
            return;
        }
        // Verify ownership or admin
        if (equipment.owner.toString() !== req.user?._id.toString() && req.user?.role !== 'Admin') {
            res.status(403).json({ success: false, message: 'Not authorized to edit this listing' });
            return;
        }
        const { pincode } = req.body;
        if (pincode && pincode !== equipment.location.pincode) {
            const coordinates = await (0, geocoder_1.getCoordinatesForPincode)(pincode);
            req.body.location = {
                ...equipment.location,
                pincode,
                coordinates
            };
        }
        equipment = await Equipment_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, equipment });
    }
    catch (error) {
        next(error);
    }
};
exports.updateEquipment = updateEquipment;
const deleteEquipment = async (req, res, next) => {
    const { id } = req.params;
    try {
        const equipment = await Equipment_1.default.findById(id);
        if (!equipment) {
            res.status(404).json({ success: false, message: 'Equipment listing not found' });
            return;
        }
        // Verify ownership or admin
        if (equipment.owner.toString() !== req.user?._id.toString() && req.user?.role !== 'Admin') {
            res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
            return;
        }
        await equipment.deleteOne();
        res.status(200).json({ success: true, message: 'Listing deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteEquipment = deleteEquipment;
const discoverNearby = async (req, res, next) => {
    const { lat, lon, maxDistance = 50, category } = req.query; // maxDistance in km, default 50km
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
                        coordinates: [longitude, latitude] // GeoJSON format: Lng, Lat
                    },
                    $maxDistance: distanceInMeters
                }
            }
        };
        if (category) {
            query.category = category;
        }
        const equipments = await Equipment_1.default.find(query).populate('owner', 'firstName lastName avatar phoneNumber');
        res.status(200).json({
            success: true,
            count: equipments.length,
            equipments
        });
    }
    catch (error) {
        next(error);
    }
};
exports.discoverNearby = discoverNearby;
