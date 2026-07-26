const express = require('express');
const router = express.Router();
// const vnpayService = require('../services/vnpay');
// const userMiddleware = require('../middleware/middlewareControllers');
const paymentController = require('../controllers/paymentController');
const { verifyToken, verifyAdmin } = require('../middleware/middlewareControllers');


// Đã bỏ toàn bộ route VNPAY theo yêu cầu

// User creates a payment request (can be anonymous amount)
router.post('/request', verifyToken, paymentController.createPaymentRequest);

// User gets own history
router.get('/history/mine', verifyToken, paymentController.getMyHistory);
// Owner gets payment transfer history from renters for own rooms
router.get('/history/owner-rentals', verifyToken, paymentController.getOwnerRentalPaymentHistory);

// Admin: list pending approvals
router.get('/approvals/pending', verifyAdmin, paymentController.listPendingApprovals);

// User: request admin approval for a transfer (create ApprovePaying)
router.post('/approvals', verifyToken, paymentController.createApproveRequest);

// User: request gia hạn thuê phòng (admin approve sẽ cập nhật Booking.endDate)
router.post('/extend/request', verifyToken, paymentController.createExtendPaymentRequest);

// Owner: duyệt/ từ chối gia hạn thuê
router.get('/extend/owner/pending', verifyToken, paymentController.getPendingExtendRequestsForOwner);
router.put('/extend/owner/:historyId/approve', verifyToken, paymentController.ownerApproveExtendRequest);
router.put('/extend/owner/:historyId/reject', verifyToken, paymentController.ownerRejectExtendRequest);

// User xác nhận đã thanh toán gia hạn
router.post('/extend/user/paid', verifyToken, paymentController.userConfirmExtendPaid);
// Hỗ trợ thêm trường hợp frontend (phiên bản cũ) vô tình truyền historyId trên URL:
// POST /api/payments/extend/user/paid/:historyId
router.post('/extend/user/paid/:historyId', verifyToken, paymentController.userConfirmExtendPaid);

// Deposit routes
router.post('/deposit', verifyToken, paymentController.createDepositRequest);
router.get('/deposits/mine', verifyToken, paymentController.getMyDeposits);
router.get('/deposits/admin', verifyAdmin, paymentController.getAllDepositsAdmin);
router.put('/deposits/:depositId/approve', verifyAdmin, paymentController.approveDeposit);
router.put('/deposits/:depositId/reject', verifyAdmin, paymentController.rejectDeposit);

// Get current user's wallet
router.get('/wallet', verifyToken, paymentController.getWallet);

// Get whether the user currently has an active paid package (IsLandor)
router.get('/islandor', verifyToken, paymentController.getIsLandorStatus);

// Purchase a package using wallet balance
router.post('/purchase', verifyToken, paymentController.purchasePackage);

// Admin: approve a pending approve record
router.put('/approvals/:id/approve', verifyAdmin, paymentController.approvePayment);

module.exports = router;
