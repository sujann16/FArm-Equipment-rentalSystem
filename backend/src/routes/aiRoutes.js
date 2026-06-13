const express = require('express');
const { body } = require('express-validator');
const { recommendEquipment, estimateCost, getWeatherSuggestions, getHeatmap, getAdminAnalytics, submitReview, submitDispute } = require('../controllers/aiController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post(
  '/recommend',
  [
    body('cropType').notEmpty().withMessage('Crop type is required'),
    body('landArea').isNumeric().withMessage('Land area must be a number'),
    body('farmingActivity').notEmpty().withMessage('Farming activity is required')
  ],
  validateRequest,
  recommendEquipment
);

router.post(
  '/estimate-cost',
  [
    body('equipmentType').isIn(['Tractor', 'Harvester', 'Seeder', 'Rotavator', 'Sprayer', 'Thresher', 'Cultivator', 'Plough']).withMessage('Invalid equipment type'),
    body('durationDays').isNumeric().withMessage('Duration in days must be a number'),
    body('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits')
  ],
  validateRequest,
  estimateCost
);

router.get('/weather-suggestions', getWeatherSuggestions);
router.get('/heatmap', getHeatmap);
router.get('/admin/analytics', protect, authorizeRoles('Admin'), getAdminAnalytics);

router.post(
  '/reviews',
  protect,
  [
    body('equipmentId').notEmpty().withMessage('Equipment ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  validateRequest,
  submitReview
);

router.post(
  '/disputes',
  protect,
  [
    body('type').isIn(['Dispute', 'Report']).withMessage('Type must be Dispute or Report'),
    body('reason').notEmpty().withMessage('Reason is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  validateRequest,
  submitDispute
);

module.exports = router;
