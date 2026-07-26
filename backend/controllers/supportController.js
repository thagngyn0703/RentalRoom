const Support = require('../models/Support');
const Notification = require('../models/Notification');
const User = require('../models/Users');
const crypto = require('crypto');

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || (process.env.JWT_SECRET || 'default_secret');

function generateCaptchaCode(length = 4) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

function signCaptcha(code, expiresAtMs) {
    const data = `${code}:${expiresAtMs}`;
    const sig = crypto.createHmac('sha256', CAPTCHA_SECRET).update(data).digest('hex');
    return `${expiresAtMs}.${sig}`; // token
}

function verifyCaptcha(enteredCode, token) {
    if (!enteredCode || !token) return false;
    const [expiresAtStr, sig] = String(token).split('.');
    const expiresAtMs = Number(expiresAtStr);
    if (!expiresAtMs || !sig) return false;
    if (Date.now() > expiresAtMs) return false; // expired
    const normalizedCode = String(enteredCode).trim().toUpperCase();
    const expectedSig = crypto
        .createHmac('sha256', CAPTCHA_SECRET)
        .update(`${normalizedCode}:${expiresAtMs}`)
        .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
}

const supportController = {
    create: async (req, res) => {
        try {
            const userId = req.user?.id || req.user?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để gửi liên hệ.' });
            }

            const body = req.body || {};
            const name = typeof body.name === 'string' ? body.name.trim() : '';
            const bodyEmail = typeof body.email === 'string' ? body.email.trim() : null;
            const phone = typeof body.phone === 'string' ? body.phone.trim() : null;
            const message = typeof body.message === 'string' ? body.message.trim() : '';
            const captcha = body.captcha || {};

            if (!name) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập tên của bạn.' });
            }
            if (!message) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung liên hệ.' });
            }
            const captchaCode = typeof captcha.code === 'string' ? captcha.code.trim() : '';
            const captchaToken = typeof captcha.token === 'string' ? captcha.token : null;
            if (!captchaCode || !captchaToken) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập mã xác nhận (và đợi mã tải xong nếu cần).' });
            }

            const isCaptchaOk = verifyCaptcha(captchaCode, captchaToken);
            if (!isCaptchaOk) {
                return res.status(400).json({ success: false, message: 'Mã xác nhận không đúng. Vui lòng nhập lại hoặc bấm Đổi để lấy mã mới.' });
            }

            // Email: lấy từ tài khoản đã đăng nhập nếu không gửi lên
            let email = bodyEmail || null;
            if (!email) {
                const user = await User.findById(userId).select('email').lean();
                if (!user?.email) {
                    return res.status(400).json({ success: false, message: 'Tài khoản chưa có email' });
                }
                email = user.email;
            }

            const doc = await Support.create({
                userId,
                name,
                email,
                phone: phone || undefined,
                message,
            });
            return res.status(201).json({ success: true, data: doc });
        } catch (err) {
            console.error('Create support error:', err);
            return res.status(500).json({ success: false, message: err.message || 'Lỗi máy chủ. Vui lòng thử lại.' });
        }
    },

    listMine: async (req, res) => {
        try {
            const userId = req.user?.id || req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const items = await Support.find({ userId }).sort({ createdAt: -1 });
            return res.json({ success: true, data: items });
        } catch (err) {
            console.error('List support error:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    captcha: async (_req, res) => {
        // Generate a short code and signed token, expire in 3 minutes
        const code = generateCaptchaCode(4);
        const expiresAtMs = Date.now() + 3 * 60 * 1000;
        const token = signCaptcha(code, expiresAtMs);
        // For simplicity we return the code as display text
        return res.json({ success: true, display: code, token, expiresAt: expiresAtMs });
    },

    // Admin functions
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const skip = (page - 1) * limit;

            let filter = {};
            if (status && status !== 'all') {
                filter.status = status;
            }

            const items = await Support.find(filter)
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Support.countDocuments(filter);

            return res.json({
                success: true,
                data: items,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    count: items.length,
                    totalItems: total
                }
            });
        } catch (err) {
            console.error('Get all support error:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['open', 'in_progress', 'closed'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const item = await Support.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            ).populate('userId', 'username email');

            if (!item) {
                return res.status(404).json({ success: false, message: 'Support not found' });
            }

            return res.json({ success: true, data: item });
        } catch (err) {
            console.error('Update support status error:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    reply: async (req, res) => {
        try {
            const { id } = req.params;
            const { reply } = req.body;
            const adminId = req.user?.id;

            if (!reply || !reply.trim()) {
                return res.status(400).json({ success: false, message: 'Nội dung phản hồi không được để trống' });
            }

            const item = await Support.findByIdAndUpdate(
                id,
                {
                    adminReply: reply.trim(),
                    repliedAt: new Date(),
                    repliedBy: adminId,
                    status: 'closed'
                },
                { new: true }
            ).populate('userId', 'username email');

            if (!item) {
                return res.status(404).json({ success: false, message: 'Support not found' });
            }

            const userId = item.userId?._id || item.userId;
            const targetUserId = String(userId);

            const bodyPreview = reply.trim().length > 100 ? reply.trim().slice(0, 100) + '...' : reply.trim();
            const notif = await Notification.create({
                user: targetUserId,
                type: 'support_reply',
                title: 'Phản hồi hỗ trợ',
                body: bodyPreview,
                data: { supportId: String(item._id) }
            });

            const io = req.app.get('io');
            if (io) {
                io.to(`user_${targetUserId}`).emit('notification', {
                    id: notif._id,
                    type: notif.type,
                    title: notif.title,
                    body: notif.body,
                    data: notif.data,
                    createdAt: notif.createdAt,
                    readAt: notif.readAt
                });
            }

            return res.json({ success: true, data: item });
        } catch (err) {
            console.error('Support reply error:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

module.exports = supportController;


