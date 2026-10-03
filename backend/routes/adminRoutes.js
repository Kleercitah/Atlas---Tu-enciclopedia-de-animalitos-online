const express = require('express');
const adminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.get('/users', verifyToken, requireRole('admin'), adminController.listUsers);
router.get('/metrics', verifyToken, requireRole('admin'), adminController.getMetrics);

module.exports = router;