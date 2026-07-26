const express = require('express');
const router = express.Router();
const checkoutRequestController = require('../controllers/checkoutRequestController');
const userMiddleware = require('../middleware/middlewareControllers');

// User: tạo yêu cầu trả phòng
router.post('/', userMiddleware.verifyToken, checkoutRequestController.createCheckoutRequest);
// User: danh sách yêu cầu của mình
router.get('/my', userMiddleware.verifyToken, checkoutRequestController.getMyCheckoutRequests);

// Owner (chủ trọ): xem và xác nhận yêu cầu trước
router.get('/owner/all', userMiddleware.verifyToken, checkoutRequestController.getOwnerCheckoutRequests);
router.put('/owner/:requestId/approve', userMiddleware.verifyToken, checkoutRequestController.ownerApproveCheckoutRequest);
router.put('/owner/:requestId/reject', userMiddleware.verifyToken, checkoutRequestController.ownerRejectCheckoutRequest);

// Admin: danh sách tất cả, xác nhận trả phòng
router.get('/admin/all', userMiddleware.verifyAdmin, checkoutRequestController.getAllCheckoutRequests);
router.put('/admin/:requestId/confirm', userMiddleware.verifyAdmin, checkoutRequestController.confirmCheckoutRequest);

module.exports = router;
