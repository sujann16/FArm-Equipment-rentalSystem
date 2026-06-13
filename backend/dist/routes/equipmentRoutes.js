"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const equipmentController_1 = require("../controllers/equipmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = (0, express_1.Router)();
router.get('/discover/nearby', equipmentController_1.discoverNearby);
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('Owner', 'Admin'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Equipment name is required'),
    (0, express_validator_1.body)('category').isIn(['Tractor', 'Harvester', 'Seeder', 'Rotavator', 'Sprayer', 'Thresher', 'Cultivator', 'Plough']).withMessage('Invalid equipment category'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('hourlyPrice').isNumeric().withMessage('Hourly price must be a number'),
    (0, express_validator_1.body)('dailyPrice').isNumeric().withMessage('Daily price must be a number'),
    (0, express_validator_1.body)('address').notEmpty().withMessage('Address is required'),
    (0, express_validator_1.body)('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits'),
    (0, express_validator_1.body)('specifications.manufacturer').notEmpty().withMessage('Manufacturer is required'),
    (0, express_validator_1.body)('specifications.model').notEmpty().withMessage('Model is required'),
    (0, express_validator_1.body)('specifications.year').isNumeric().withMessage('Manufacturing year is required'),
    (0, express_validator_1.body)('specifications.horsepower').isNumeric().withMessage('Horsepower is required'),
    (0, express_validator_1.body)('specifications.condition').isIn(['New', 'Excellent', 'Good', 'Fair']).withMessage('Invalid equipment condition')
], validationMiddleware_1.validateRequest, equipmentController_1.createEquipment);
router.get('/', equipmentController_1.getEquipments);
router.get('/:id', equipmentController_1.getEquipmentDetails);
router.put('/:id', authMiddleware_1.protect, equipmentController_1.updateEquipment);
router.delete('/:id', authMiddleware_1.protect, equipmentController_1.deleteEquipment);
exports.default = router;
