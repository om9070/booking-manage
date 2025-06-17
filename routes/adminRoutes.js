const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/get-booking-slot', 
  authenticate,
  authorize('admin'),
  adminController.getAllSlots
);

module.exports = router;