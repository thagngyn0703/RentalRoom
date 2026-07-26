            const Room = require("../models/Room");
const Post = require("../models/Post");
const User = require("../models/Users");
const Booking = require("../models/Booking");


// Tạo phòng mới (KHÔNG tạo post)
exports.createRoom = async (req, res) => {
    try {
        console.log('[CREATE ROOM] userId:', req.user && (req.user._id || req.user.id));
        const data = req.body;
        const room = new Room({
            ...data,
            user: req.user._id || req.user.id
        });
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy danh sách phòng (chỉ trả về phòng của user đang đăng nhập, có filter & phân trang)
// Trạng thái 'available'/'rented' được tính từ Booking, không lấy theo status lưu trong Room DB.
exports.getRooms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const userId = req.user && (req.user._id || req.user.id);
        const filter = { user: userId };

        if (req.query.hasTenant === 'true') {
            const now = new Date();
            const userRoomIds = await Room.find({ user: userId }).distinct('_id');
            const roomIdsWithTenant = await Booking.find({
                room: { $in: userRoomIds },
                status: 'confirmed',
                startDate: { $lte: now },
                endDate: { $gte: now }
            }).distinct('room');
            filter._id = { $in: roomIdsWithTenant };
        }
        if (req.query.province) filter.province = req.query.province;
        if (req.query.district) filter.district = req.query.district;

        // Lấy rooms trước, sau đó tính status dựa theo booking (tự động)
        const roomsRaw = await Room.find(filter)
            .populate('post')
            .populate('user')
            .sort({ createdAt: -1 });

        const now = new Date();
        const roomIds = roomsRaw.map((r) => r._id);
        // Đã thuê: booking confirmed và đang active theo thời điểm hiện tại
        const activeTenantRoomIds = await Booking.find({
            room: { $in: roomIds },
            status: 'confirmed',
            startDate: { $lte: now },
            endDate: { $gte: now },
        }).distinct('room');
        const activeSet = new Set(activeTenantRoomIds.map(String));

        // Override status theo active booking để tránh sai lệch do status lưu DB
        const roomsWithStatus = roomsRaw.map((r) => {
            const obj = r.toObject();
            obj.status = activeSet.has(String(r._id)) ? 'rented' : 'available';
            obj.hasTenant = obj.status === 'rented';
            return obj;
        });

        // Filter theo tab status dựa trên computed status
        let filtered = roomsWithStatus;
        if (req.query.status) filtered = filtered.filter((x) => x.status === req.query.status);

        const total = filtered.length;
        const paginated = filtered.slice(skip, skip + limit);

        res.json({
            rooms: paginated,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy chi tiết phòng (xem đầy đủ thông tin)
exports.getRoomDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user && (req.user._id || req.user.id);
        
        console.log('[GET ROOM DETAIL] roomId:', id, 'userId:', userId);
        
        const room = await Room.findById(id)
            .populate('post')
            .populate('user');
        
        if (!room) return res.status(404).json({ error: "Room not found" });
        
        // Cho phép admin xem mọi phòng, user thường chỉ xem phòng của mình
        try {
            const roomUserId = room.user && room.user._id ? room.user._id.toString() : (room.user ? room.user.toString() : null);
            const currentUserId = userId.toString();
            const userRole = req.user && req.user.role;
            console.log('[GET ROOM DETAIL] roomUserId:', roomUserId, 'currentUserId:', currentUserId, 'role:', userRole);
            if (userRole !== 'admin' && (!roomUserId || roomUserId !== currentUserId)) {
                console.log('[GET ROOM DETAIL] Permission denied');
                return res.status(403).json({ error: "You don't have permission to view this room" });
            }
        } catch (permError) {
            console.error('[GET ROOM DETAIL PERM ERROR]', permError);
            return res.status(403).json({ error: "Permission check failed" });
        }
        
        res.json(room);
    } catch (err) {
        console.error('[GET ROOM DETAIL ERROR]', err);
        res.status(500).json({ error: err.message });
    }
};

// Lấy thông tin người thuê hiện tại của 1 phòng (chỉ chủ phòng hoặc admin)
// Trả về booking đang active (confirmed, startDate <= now <= endDate) + user thuê
exports.getRoomCurrentTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user && (req.user._id || req.user.id);

        const room = await Room.findById(id).populate('user');
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        // Permission: admin hoặc chủ phòng
        const roomUserId = room.user && room.user._id ? room.user._id.toString() : (room.user ? room.user.toString() : null);
        const currentUserId = userId.toString();
        const userRole = req.user && req.user.role;
        if (userRole !== 'admin' && (!roomUserId || roomUserId !== currentUserId)) {
            return res.status(403).json({ success: false, message: "You don't have permission" });
        }

        const now = new Date();
        const booking = await Booking.findOne({
            room: room._id,
            status: 'confirmed',
            startDate: { $lte: now },
            endDate: { $gte: now },
        })
            .populate('user', 'username email')
            .sort({ startDate: -1 });

        return res.json({
            success: true,
            roomId: String(room._id),
            hasTenant: !!booking,
            booking: booking || null,
        });
    } catch (err) {
        console.error('[GET ROOM CURRENT TENANT ERROR]', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Cập nhật trạng thái phòng (ví dụ: đã thuê)
exports.updateRoomStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const room = await Room.findByIdAndUpdate(id, { status }, { new: true });
        if (!room) return res.status(404).json({ error: "Room not found" });
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật thông tin phòng (đầy đủ)
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user && (req.user._id || req.user.id);
        const data = req.body;
        
        console.log('[UPDATE ROOM] roomId:', id, 'userId:', userId);
        
        // Tìm phòng trước
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ error: "Room not found" });
        
        // Kiểm tra quyền
        const roomUserId = room.user._id ? room.user._id.toString() : room.user.toString();
        if (roomUserId !== userId.toString()) {
            return res.status(403).json({ error: "You don't have permission to update this room" });
        }
        
        // Cập nhật (không cho phép thay đổi user)
        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            { ...data, user: room.user },
            { new: true }
        ).populate('post').populate('user');
        
        console.log('[UPDATE ROOM SUCCESS] roomId:', id);
        res.json(updatedRoom);
    } catch (err) {
        console.error('[UPDATE ROOM ERROR]', err);
        res.status(500).json({ error: err.message });
    }
};

// Xóa phòng
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByIdAndDelete(id);
        if (!room) return res.status(404).json({ error: "Room not found" });
        // Xóa luôn bài đăng liên kết
        await Post.findByIdAndDelete(room.post);
        res.json({ message: "Room and post deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
