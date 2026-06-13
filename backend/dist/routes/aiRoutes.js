"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const aiController_1 = require("../controllers/aiController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = (0, express_1.Router)();
router.post('/recommend', [
    (0, express_validator_1.body)('cropType').notEmpty().withMessage('Crop type is required'),
    (0, express_validator_1.body)('landArea').isNumeric().withMessage('Land area must be a number'),
    (0, express_validator_1.body)('farmingActivity').notEmpty().withMessage('Farming activity is required')
], validationMiddleware_1.validateRequest, aiController_1.recommendEquipment);
router.post('/estimate-cost', [
    (0, express_validator_1.body)('equipmentType').isIn(['Tractor', 'Harvester', 'Seeder', 'Rotavator', 'Sprayer', 'Thresher', 'Cultivator', 'Plough']).withMessage('Invalid equipment type'),
    (0, express_validator_1.body)('durationDays').isNumeric().withMessage('Duration in days must be a number'),
    (0, express_validator_1.body)('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits')
], validationMiddleware_1.validateRequest, aiController_1.estimateCost);
router.get('/weather-suggestions', aiController_1.getWeatherSuggestions);
router.get('/heatmap', aiController_1.getHeatmap);
router.get('/admin/analytics', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('Admin'), aiController_1.getAdminAnalytics);
router.post('/reviews', authMiddleware_1.protect, [
    (0, express_validator_1.body)('equipmentId').notEmpty().withMessage('Equipment ID is required'),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], validationMiddleware_1.validateRequest, aiController_1.submitReview);
router.post('/disputes', authMiddleware_1.protect, [
    (0, express_validator_1.body)('type').isIn(['Dispute', 'Report']).withMessage('Type must be Dispute or Report'),
    (0, express_validator_1.body)('reason').notEmpty().withMessage('Reason is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required')
], validationMiddleware_1.validateRequest, aiController_1.submitDispute);
exports.default = router;
