const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Notification = require('../models/Notification');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

/**
 * Xác định thuê theo ngày hay theo tháng.
 * - Nếu booking có billingCycle rõ ràng thì dùng.
 * - Thời lượng < 7 ngày → luôn coi là thuê theo ngày (tránh nhầm thuê 1 ngày thành tháng).
 * - Thời lượng >= 28 ngày → thuê theo tháng.
 * - Còn lại → thuê theo ngày.
 */
function inferBillingCycle(booking) {
  if (booking.billingCycle === 'daily' || booking.billingCycle === 'monthly') return booking.billingCycle;
  const ms = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
  const days = ms / ONE_DAY_MS;
  if (days < 7) return 'daily';
  if (days >= 28) return 'monthly';
  return 'daily';
}

async function emitToUser(io, notifDoc) {
  io.to(`user_${notifDoc.user}`).emit('notification', {
    id: notifDoc._id,
    type: notifDoc.type,
    title: notifDoc.title,
    body: notifDoc.body,
    data: notifDoc.data,
    createdAt: notifDoc.createdAt,
    readAt: notifDoc.readAt,
  });
}

async function createNotification(io, userId, room, booking, cycle, triggerType, title, body) {
  const end = new Date(booking.endDate);
  try {
    const notif = await Notification.create({
      user: userId,
      type: 'rent_due',
      title,
      body,
      data: {
        bookingId: String(booking._id),
        roomId: String(booking.room),
        billingCycle: cycle,
        endDate: end.toISOString(),
        triggerType,
      },
    });
    await emitToUser(io, notif);
  } catch (err) {
    if (err && (err.code === 11000 || err.codeName === 'DuplicateKey')) return;
    console.error('rentDueReminder error:', err);
  }
}

async function runRentDueReminder(io) {
  const now = new Date();
  const in7d = new Date(now.getTime() + SEVEN_DAYS_MS);

  const bookings = await Booking.find({
    status: 'confirmed',
    endDate: { $gt: now, $lte: in7d },
  })
    .select('_id user room startDate endDate billingCycle')
    .lean();

  for (const b of bookings) {
    const cycle = inferBillingCycle(b);
    const end = new Date(b.endDate);
    const diffMs = end.getTime() - now.getTime();
    const room = await Room.findById(b.room).select('address').lean();
    const addressSuffix = room?.address ? ` tại ${room.address}` : '';

    if (cycle === 'monthly') {
      // Thuê tháng: thông báo trước 7 ngày (còn khoảng 1 tuần) + thông báo trước 24h (còn 24 giờ)
      if (diffMs <= SEVEN_DAYS_MS && diffMs > ONE_DAY_MS) {
        await createNotification(
          io,
          b.user,
          room,
          b,
          cycle,
          '7d',
          'Sắp đến hạn trọ',
          `Còn khoảng 1 tuần nữa là hết hạn phòng${addressSuffix}. Vui lòng gia hạn/thanh toán.`
        );
      }
      if (diffMs <= ONE_DAY_MS) {
        await createNotification(
          io,
          b.user,
          room,
          b,
          cycle,
          '24h',
          'Sắp đến hạn trọ',
          `Còn khoảng 24 giờ nữa là hết hạn phòng${addressSuffix}. Vui lòng gia hạn/thanh toán.`
        );
      }
    } else {
      // Thuê theo ngày: chỉ thông báo trước 24h, nội dung "còn khoảng 1 ngày"
      if (diffMs <= ONE_DAY_MS) {
        await createNotification(
          io,
          b.user,
          room,
          b,
          cycle,
          '24h',
          'Sắp đến hạn trọ',
          `Còn khoảng 1 ngày nữa là hết hạn phòng${addressSuffix}. Vui lòng gia hạn/thanh toán.`
        );
      }
    }
  }
}

/**
 * Chạy job nhắc hạn trọ theo chu kỳ.
 * Để thay đổi tần suất, sửa intervalMs trong server.js khi gọi startRentDueReminder:
 * - 60 * 1000         = 1 phút (test nhanh, tải cao)
 * - 15 * 60 * 1000    = 15 phút (cân bằng)
 * - 60 * 60 * 1000    = 1 giờ (mặc định, giảm tải server)
 */
function startRentDueReminder(io, opts = {}) {
  const intervalMs = opts.intervalMs ?? 60 * 60 * 1000;
  const bootDelay = 10 * 1000;
  setTimeout(() => {
    runRentDueReminder(io).catch((e) => console.error(e));
    setInterval(() => runRentDueReminder(io).catch((e) => console.error(e)), intervalMs);
  }, bootDelay);
}

module.exports = { startRentDueReminder, runRentDueReminder };
