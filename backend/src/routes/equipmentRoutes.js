const express = require('express');
const { body } = require('express-validator');
const { createEquipment, getEquipments, getEquipmentDetails, updateEquipment, deleteEquipment, discoverNearby } = require('../controllers/equipmentController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/discover/nearby', discoverNearby);

router.post(
  '/',
  protect,
  authorizeRoles('Owner', 'Admin'),
  [
    body('name').notEmpty().withMessage('Equipment name is required'),
    body('category').isIn(['Tractor', 'Harvester', 'Seeder', 'Rotavator', 'Sprayer', 'Thresher', 'Cultivator', 'Plough']).withMessage('Invalid equipment category'),
    body('description').notEmpty().withMessage('Description is required'),
    body('hourlyPrice').isNumeric().withMessage('Hourly price must be a number'),
    body('dailyPrice').isNumeric().withMessage('Daily price must be a number'),
    body('address').notEmpty().withMessage('Address is required'),
    body('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits'),
    body('specifications.manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('specifications.model').notEmpty().withMessage('Model is required'),
    body('specifications.year').isNumeric().withMessage('Manufacturing year is required'),
    body('specifications.horsepower').isNumeric().withMessage('Horsepower is required'),
    body('specifications.condition').isIn(['New', 'Excellent', 'Good', 'Fair']).withMessage('Invalid equipment condition')
  ],
  validateRequest,
  createEquipment
);

router.get('/', getEquipments);
router.get('/:id', getEquipmentDetails);

router.put('/:id', protect, updateEquipment);
router.delete('/:id', protect, deleteEquipment);

module.exports = router;
