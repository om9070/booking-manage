const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { authenticate, authorize } = require('../middleware/auth');
const schemas = require('../config/validationSchema');
const { validate } = require('../middleware/validation');

router.post('/create-availability', 
  authenticate, 
  authorize('provider'), 
  validate(schemas.setAvailability),
  providerController.createAvailability
);


router.get('/', 
  authenticate,
  authorize('provider'), 
  providerController.listProviders
);

module.exports = router;