const express = require('express');
const router = express.Router();
const earlyCheckoutController = require('../controllers/earlyCheckoutController');
const userMiddleware = require('../middleware/middlewareControllers');

// User routes
router.post('/', userMiddleware.verifyToken, earlyCheckoutController.createEarlyCheckoutRequest);
router.get('/my', userMiddleware.verifyToken, earlyCheckoutController.getMyEarlyCheckoutRequests);

// Admin routes
router.get('/admin/all', userMiddleware.verifyAdmin, earlyCheckoutController.getAllEarlyCheckoutRequests);
router.put('/admin/:requestId/approve', userMiddleware.verifyAdmin, earlyCheckoutController.approveEarlyCheckoutRequest);
router.put('/admin/:requestId/reject', userMiddleware.verifyAdmin, earlyCheckoutController.rejectEarlyCheckoutRequest);

module.exports = router;
