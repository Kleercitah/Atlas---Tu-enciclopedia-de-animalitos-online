const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const { validateRegistration, validateLogin } = require('../middlewares/requestValidators');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { error: 'Demasiados intentos, por favor intenta más tarde.' }
});

router.post('/registro', authLimiter, validateRegistration, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);

module.exports = router;