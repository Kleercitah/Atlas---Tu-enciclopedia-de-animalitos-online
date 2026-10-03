const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discoveryController');
const verifyToken = require('../middlewares/authMiddleware');
const {
	validateDiscoveryCreate,
	validateDiscoveryUpdate,
	validateTaxonView,
	validateDiscoveryId,
} = require('../middlewares/requestValidators');

router.use(verifyToken);

router.get('/', discoveryController.getDiscoveries);
router.post('/views', validateTaxonView, discoveryController.recordTaxonView);
router.post('/', validateDiscoveryCreate, discoveryController.createDiscovery);
router.put('/:id', validateDiscoveryId, validateDiscoveryUpdate, discoveryController.updateDiscovery);
router.delete('/:id', validateDiscoveryId, discoveryController.deleteDiscovery);
module.exports = router;