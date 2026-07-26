const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const userMiddleware = require("../middleware/middlewareControllers");

// Tạo phòng mới (KHÔNG tạo post)
router.post("/", userMiddleware.verifyToken, roomController.createRoom);
// Lấy danh sách phòng (chỉ user lấy được phòng của mình, có filter & phân trang)
router.get("/", userMiddleware.verifyToken, roomController.getRooms);
// Lấy người thuê hiện tại (chủ phòng/admin)
router.get("/:id/tenant", userMiddleware.verifyToken, roomController.getRoomCurrentTenant);
// Lấy chi tiết phòng
router.get("/:id", userMiddleware.verifyToken, roomController.getRoomDetail);
// Cập nhật thông tin phòng
router.patch("/:id", userMiddleware.verifyToken, roomController.updateRoom);
// Cập nhật trạng thái phòng
router.patch("/:id/status", userMiddleware.verifyToken, roomController.updateRoomStatus);
// Xóa phòng
router.delete("/:id", userMiddleware.verifyToken, roomController.deleteRoom);

module.exports = router;
