"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitDispute = exports.submitReview = exports.getAdminAnalytics = exports.getHeatmap = exports.getWeatherSuggestions = exports.estimateCost = exports.recommendEquipment = void 0;
const generative_ai_1 = require("@google/generative-ai");
const Booking_1 = __importDefault(require("../models/Booking"));
const Review_1 = __importDefault(require("../models/Review"));
const Dispute_1 = __importDefault(require("../models/Dispute"));
const weather_1 = require("../utils/weather");
const geocoder_1 = require("../utils/geocoder");
// Recommendations fallbacks
const getFarmingRecommendationRules = (crop, area, activity) => {
    const cropLower = crop.toLowerCase();
    const activityLower = activity.toLowerCase();
    const recommendations = [];
    // Base duration: roughly 4 hours per acre for primary tillage, 2 hours/acre for seeding/spraying, 5 hours/acre for harvesting.
    let durationMultiplier = 1;
    if (activityLower.includes('tillage') || activityLower.includes('preparation') || activityLower.includes('plough')) {
        durationMultiplier = 4;
    }
    else if (activityLower.includes('sowing') || activityLower.includes('seed') || activityLower.includes('plant')) {
        durationMultiplier = 2;
    }
    else if (activityLower.includes('spray') || activityLower.includes('fertilize')) {
        durationMultiplier = 1.5;
    }
    else if (activityLower.includes('harvest') || activityLower.includes('thresh')) {
        durationMultiplier = 5;
    }
    const totalHours = Math.ceil(area * durationMultiplier);
    const totalDays = Math.ceil(totalHours / 8); // 8-hour work days
    if (cropLower.includes('paddy') || cropLower.includes('rice')) {
        if (activityLower.includes('preparation') || activityLower.includes('tillage')) {
            recommendations.push({
                equipmentType: 'Tractor',
                dailyEstimate: 4500,
                durationDays: totalDays,
                reason: 'Heavy-duty 4WD tractor is essential for initial soil preparation and wet-puddling in clayey rice fields.'
            });
            recommendations.push({
                equipmentType: 'Rotavator',
                dailyEstimate: 2000,
                durationDays: Math.ceil(totalDays * 0.7),
                reason: 'A rotavator prepares a perfectly puddled mud bed, pulverizing soil clods and incorporating weeds.'
            });
        }
        else if (activityLower.includes('sowing') || activityLower.includes('plant') || activityLower.includes('seed')) {
            recommendations.push({
                equipmentType: 'Seeder',
                dailyEstimate: 1800,
                durationDays: totalDays,
                reason: 'Paddy seed drills or drum seeders ensure uniform row spacing and seed depth, saving 50% on labor.'
            });
        }
        else if (activityLower.includes('harvest')) {
            recommendations.push({
                equipmentType: 'Harvester',
                dailyEstimate: 8500,
                durationDays: Math.ceil(totalDays * 0.8),
                reason: 'A tracked combine harvester is highly recommended to cut, thresh, and clean paddy grains quickly before rains.'
            });
        }
    }
    else if (cropLower.includes('wheat') || cropLower.includes('barley')) {
        if (activityLower.includes('preparation') || activityLower.includes('tillage')) {
            recommendations.push({
                equipmentType: 'Tractor',
                dailyEstimate: 4000,
                durationDays: totalDays,
                reason: 'Standard 45-55 HP tractor provides ample draft power for wheat field preparation.'
            });
            recommendations.push({
                equipmentType: 'Cultivator',
                dailyEstimate: 1500,
                durationDays: Math.ceil(totalDays * 0.8),
                reason: 'Stirring the soil with a cultivator creates a fine tilth suitable for delicate wheat germination.'
            });
        }
        else if (activityLower.includes('sowing') || activityLower.includes('seed')) {
            recommendations.push({
                equipmentType: 'Seeder',
                dailyEstimate: 2200,
                durationDays: totalDays,
                reason: 'A seed-cum-fertilizer drill places seeds and DAP fertilizer in parallel rows, optimizing root uptake.'
            });
        }
        else if (activityLower.includes('harvest') || activityLower.includes('thresh')) {
            recommendations.push({
                equipmentType: 'Harvester',
                dailyEstimate: 8000,
                durationDays: Math.ceil(totalDays * 0.8),
                reason: 'Multi-crop wheel combine harvester harvests wheat stalks cleanly, minimizing grain losses.'
            });
            recommendations.push({
                equipmentType: 'Thresher',
                dailyEstimate: 2500,
                durationDays: totalDays,
                reason: 'If harvested manually, a tractor-operated thresher separates wheat grain from the straw efficiently.'
            });
        }
    }
    else {
        // Default Crop / Maize / Cotton / Veggies
        recommendations.push({
            equipmentType: 'Tractor',
            dailyEstimate: 4000,
            durationDays: totalDays,
            reason: 'General-purpose tractor serves as the primary traction unit for this farming task.'
        });
        if (activityLower.includes('preparation')) {
            recommendations.push({
                equipmentType: 'Plough',
                dailyEstimate: 1200,
                durationDays: Math.ceil(totalDays * 0.6),
                reason: 'A disc or mouldboard plough turns the topsoil, burying pests and crop residue.'
            });
        }
        else if (activityLower.includes('sowing')) {
            recommendations.push({
                equipmentType: 'Seeder',
                dailyEstimate: 1800,
                durationDays: totalDays,
                reason: 'Standard seed drill creates consistent furrows, drops seeds, and covers them.'
            });
        }
    }
    // Calculate totals
    let totalCostMin = 0;
    let totalCostMax = 0;
    recommendations.forEach((rec) => {
        totalCostMin += rec.dailyEstimate * rec.durationDays * 0.9; // 10% lower limit
        totalCostMax += rec.dailyEstimate * rec.durationDays * 1.1; // 10% upper limit
    });
    return {
        recommendations,
        totalEstimatedCostRange: `Rs. ${Math.round(totalCostMin).toLocaleString()} - Rs. ${Math.round(totalCostMax).toLocaleString()}`,
        generalAdvice: `Based on your crop (${crop}) and acreage (${area} acres) for ${activity}, we recommend using mechanized assets to complete the job in approximately ${totalDays} days. Ensure soil has proper moisture levels before operating tillage equipment.`
    };
};
const recommendEquipment = async (req, res, next) => {
    const { cropType, landArea, farmingActivity } = req.body;
    if (!cropType || !landArea || !farmingActivity) {
        res.status(400).json({
            success: false,
            message: 'Crop Type, Land Area (in acres), and Farming Activity are required.'
        });
        return;
    }
    const area = Number(landArea);
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            // Initialize Gemini API client
            const genAI = new generative_ai_1.GoogleGenAI({ apiKey });
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `You are an expert AI Agricultural Advisor. Provide equipment recommendations for:
- Crop Type: ${cropType}
- Land Area: ${area} acres
- Farming Activity: ${farmingActivity}

Return ONLY a valid JSON object. Do not include markdown wraps or anything except the JSON. The JSON structure must match:
{
  "recommendations": [
    {
      "equipmentType": "Tractor" | "Harvester" | "Seeder" | "Rotavator" | "Sprayer" | "Thresher" | "Cultivator" | "Plough",
      "dailyEstimate": number (estimate daily rental in INR),
      "durationDays": number (estimate days needed),
      "reason": "short explanation of why this equipment is needed"
    }
  ],
  "totalEstimatedCostRange": "Rs. X,XXX - Y,YYY",
  "generalAdvice": "short advice on soil condition, timing, etc."
}`;
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            // Attempt to clean markdown if Gemini wrapped it in ```json ... ```
            const cleanJsonStr = text.replace(/^```json/, '').replace(/```$/, '').trim();
            const aiResponse = JSON.parse(cleanJsonStr);
            res.status(200).json({ success: true, ...aiResponse });
            return;
        }
        catch (error) {
            console.warn('Gemini recommendation failed, falling back to rule-engine:', error.message);
        }
    }
    // Fallback to agricultural expert rules
    const responseData = getFarmingRecommendationRules(cropType, area, farmingActivity);
    res.status(200).json({ success: true, ...responseData });
};
exports.recommendEquipment = recommendEquipment;
const estimateCost = async (req, res, next) => {
    const { equipmentType, durationDays, pincode } = req.body;
    if (!equipmentType || !durationDays || !pincode) {
        res.status(400).json({
            success: false,
            message: 'Equipment type, duration (days), and location pincode are required.'
        });
        return;
    }
    try {
        const days = Number(durationDays);
        // Average daily prices by category
        const categoryBaseRates = {
            Tractor: 4000,
            Harvester: 8000,
            Seeder: 1800,
            Rotavator: 2200,
            Sprayer: 1200,
            Thresher: 2500,
            Cultivator: 1400,
            Plough: 1100
        };
        const baseRate = categoryBaseRates[equipmentType] || 2000;
        const baseCost = baseRate * days;
        // Check historical booking density in this pincode to calculate demand surcharge
        const coordinates = await (0, geocoder_1.getCoordinatesForPincode)(pincode);
        const nearbyBookings = await Booking_1.default.find({
            status: { $nin: ['Cancelled'] }
        }).populate({
            path: 'equipment',
            match: { category: equipmentType, 'location.pincode': pincode }
        });
        // Count how many match the filter (since populate returns null for non-matching subdocs)
        // @ts-ignore
        const bookingDensity = nearbyBookings.filter(b => b.equipment !== null).length;
        // Demand multiplier range [1.0 - 1.3]
        const demandMultiplier = 1 + Math.min(bookingDensity * 0.05, 0.3);
        const locationSurcharge = Math.round(baseCost * (demandMultiplier - 1));
        // Volume discount: 5% for >3 days, 10% for >7 days
        let volumeDiscount = 0;
        if (days > 7) {
            volumeDiscount = Math.round(baseCost * 0.1);
        }
        else if (days > 3) {
            volumeDiscount = Math.round(baseCost * 0.05);
        }
        const estimatedTotal = baseCost + locationSurcharge - volumeDiscount;
        res.status(200).json({
            success: true,
            estimate: {
                equipmentType,
                durationDays: days,
                baseRate,
                baseCost,
                demandMultiplier: Math.round(demandMultiplier * 100) / 100,
                locationSurcharge,
                volumeDiscount,
                estimatedTotal,
                confidenceScore: 0.92,
                explanation: `Calculated from base rate of Rs. ${baseRate}/day. Includes a demand multiplier of x${demandMultiplier.toFixed(2)} based on recent bookings in pincode ${pincode}, minus a volume discount of Rs. ${volumeDiscount} for renting for ${days} days.`
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.estimateCost = estimateCost;
const getWeatherSuggestions = async (req, res, next) => {
    const { pincode } = req.query;
    if (!pincode) {
        res.status(400).json({ success: false, message: 'Pincode is required' });
        return;
    }
    try {
        const coords = await (0, geocoder_1.getCoordinatesForPincode)(pincode);
        const forecast = await (0, weather_1.getWeatherForecast)(coords[1], coords[0]);
        // Check if rain probability is high in any of the next 3 days
        const rainWarningDays = forecast.slice(0, 3).filter((day) => day.rainProbability > 65);
        const hasWarning = rainWarningDays.length > 0;
        let warningAlert = null;
        if (hasWarning) {
            const dates = rainWarningDays.map((d) => new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })).join(', ');
            warningAlert = {
                title: 'Weather Warning: Rain Forecasted',
                severity: 'Warning',
                message: `High chance of heavy rain (>65%) forecasted on ${dates}. We suggest delaying soil ploughing, rotavating, or harvesting operations. Saturated soil will experience severe compaction, and damp grain yields will degrade.`
            };
        }
        res.status(200).json({
            success: true,
            pincode,
            coordinates: coords,
            forecast,
            warningAlert
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getWeatherSuggestions = getWeatherSuggestions;
const getHeatmap = async (req, res, next) => {
    try {
        // Group bookings by pincode
        const bookings = await Booking_1.default.find({ status: { $ne: 'Cancelled' } }).populate('equipment');
        // Aggregate in memory
        const counts = {};
        for (const b of bookings) {
            // @ts-ignore
            const equip = b.equipment;
            if (!equip)
                continue;
            const pincode = equip.location.pincode;
            const category = equip.category;
            if (!counts[pincode]) {
                counts[pincode] = {
                    count: 0,
                    revenue: 0,
                    lat: equip.location.coordinates[1],
                    lng: equip.location.coordinates[0],
                    categories: {}
                };
            }
            counts[pincode].count += 1;
            counts[pincode].revenue += b.totalCost;
            counts[pincode].categories[category] = (counts[pincode].categories[category] || 0) + 1;
        }
        // Convert to array and normalize intensities [0 to 1]
        const list = Object.entries(counts).map(([pincode, data]) => {
            const topCategory = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0][0];
            return {
                pincode,
                latitude: data.lat,
                longitude: data.lng,
                bookingCount: data.count,
                totalRevenue: data.revenue,
                topEquipmentCategory: topCategory,
                intensity: 0.1 // Temp, will normalize next
            };
        });
        const maxCount = Math.max(...list.map((item) => item.bookingCount), 1);
        list.forEach((item) => {
            item.intensity = Math.round((item.bookingCount / maxCount) * 100) / 100;
        });
        res.status(200).json({ success: true, heatmap: list });
    }
    catch (error) {
        next(error);
    }
};
exports.getHeatmap = getHeatmap;
const getAdminAnalytics = async (req, res, next) => {
    try {
        const totalRentals = await Booking_1.default.countDocuments({ status: { $ne: 'Cancelled' } });
        const completedRentals = await Booking_1.default.countDocuments({ status: 'Completed' });
        // Sum revenue
        const revenueStats = await Booking_1.default.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalCost' } } }
        ]);
        const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;
        // Rented by equipment category
        const categoryStats = await Booking_1.default.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $lookup: {
                    from: 'equipments',
                    localField: 'equipment',
                    foreignField: '_id',
                    as: 'equip'
                }
            },
            { $unwind: '$equip' },
            {
                $group: {
                    _id: '$equip.category',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalCost' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        const rentalsByCategory = categoryStats.map((item) => ({
            category: item._id,
            count: item.count,
            revenue: item.revenue
        }));
        // Monthly seasons
        const seasonStats = await Booking_1.default.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $month: '$startDate' },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalCost' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const rentalsBySeason = seasonStats.map((item) => ({
            month: monthNames[item._id - 1],
            count: item.count,
            revenue: item.revenue
        }));
        res.status(200).json({
            success: true,
            analytics: {
                totalRentals,
                completedRentals,
                totalRevenue,
                rentalsByCategory,
                rentalsBySeason
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdminAnalytics = getAdminAnalytics;
const submitReview = async (req, res, next) => {
    const { equipmentId, rating, comment } = req.body;
    try {
        const reviewerId = req.user?._id;
        if (!reviewerId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const review = await Review_1.default.create({
            equipment: equipmentId,
            reviewer: reviewerId,
            rating,
            comment
        });
        res.status(201).json({ success: true, review });
    }
    catch (error) {
        next(error);
    }
};
exports.submitReview = submitReview;
const submitDispute = async (req, res, next) => {
    const { type, bookingId, equipmentId, reason, description } = req.body;
    try {
        const reporterId = req.user?._id;
        if (!reporterId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const dispute = await Dispute_1.default.create({
            type,
            booking: bookingId || undefined,
            equipment: equipmentId || undefined,
            reporter: reporterId,
            reason,
            description
        });
        res.status(201).json({ success: true, dispute });
    }
    catch (error) {
        next(error);
    }
};
exports.submitDispute = submitDispute;
