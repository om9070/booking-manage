const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const schemas = require('../config/validationSchema');
const { validate } = require('../middleware/validation');


router.post('/register',validate(schemas.register), authController.register);
router.post('/login',validate(schemas.login), authController.login);

module.exports = router;