const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const validationSchema = require('../config/validationSchema');

router.post('/book-slot', 
  authenticate,
  authorize('client'),
  validate(validationSchema.bookAppointment),
  clientController.bookSlot
);

router.get('/available-slot', 
  authenticate,
  authorize('client'),
  clientController.getAvailableSlot
);


module.exports = router;