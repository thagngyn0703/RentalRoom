// VNPAY payment service for booking
const crypto = require('crypto');
const querystring = require('qs');

// Cấu hình VNPAY (bạn cần thay bằng thông tin thật)
const vnp_TmnCode = process.env.VNP_TMNCODE || 'YOUR_TMNCODE';
const vnp_HashSecret = process.env.VNP_HASHSECRET || 'YOUR_SECRET';
const vnp_Url = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = process.env.VNP_RETURNURL || 'http://localhost:3000/vnpay_return';

function createPaymentUrl({ amount, orderId, orderDesc, ipAddr, bankCode, locale = 'vn', userId }) {
  const date = new Date();
  const createDate = date
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderDesc,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100, // VNPAY nhận đơn vị là đồng x 100
    vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_BankCode: bankCode || ''
  };
  if (userId) vnp_Params.vnp_User = userId;
  // Bỏ bankCode nếu không chọn
  if (!bankCode) delete vnp_Params.vnp_BankCode;

  vnp_Params = sortObject(vnp_Params);
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params.vnp_SecureHash = signed;
  const paymentUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: true });
  return paymentUrl;
}

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

function verifyVnpayReturn(query) {
  const vnp_Params = { ...query };
  const secureHash = vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;
  const signData = querystring.stringify(sortObject(vnp_Params), { encode: false });
  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  return secureHash === signed;
}

module.exports = { createPaymentUrl, verifyVnpayReturn };
