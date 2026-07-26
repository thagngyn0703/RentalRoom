const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const userMiddleware = require('../middleware/middlewareControllers');

// Route admin: chỉ admin mới xem được danh sách booking
router.get('/admin/all', userMiddleware.verifyAdmin, bookingController.getAllBookingsAdmin);

// Route admin: xác nhận thanh toán booking
router.put('/admin/:bookingId/confirm', userMiddleware.verifyAdmin, bookingController.confirmBooking);
// Route admin: từ chối duyệt thuê phòng → booking cancelled, phòng hiển thị lại
router.put('/admin/:bookingId/reject', userMiddleware.verifyAdmin, bookingController.rejectBooking);

// Route user: xem booking của mình
router.get('/my', userMiddleware.verifyToken, bookingController.getMyBookings);
router.get('/my/:bookingId', userMiddleware.verifyToken, bookingController.getMyBookingById);

// Route kiểm tra phòng trống
router.get('/availability', userMiddleware.verifyToken, bookingController.checkAvailability);

module.exports = router;
