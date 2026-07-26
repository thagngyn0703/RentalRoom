// Các hằng số và tùy chọn bộ lọc
export const MAX_FAVORITES = 20;

export const CATEGORY_OPTIONS = [
    'Phòng trọ',
    'Nhà riêng',
    'Ở ghép',
    'Mặt bằng',
    'Căn hộ chung cư',
    'Căn hộ mini',
    'Căn hộ dịch vụ'
];

export const ROOM_TYPES = [
    'Phòng trọ',
    'Căn hộ mini',
    'Nhà riêng',
    'Studio',
    'Chung cư',
];

export const PRICE_PRESETS = [
    { key: 'all', label: 'Tất cả', range: [0, 10] },
    { key: 'lt1', label: 'Dưới 1 triệu', range: [0, 1] },
    { key: '1-2', label: '1 - 2 triệu', range: [1, 2] },
    { key: '2-3', label: '2 - 3 triệu', range: [2, 3] },
    { key: '3-5', label: '3 - 5 triệu', range: [3, 5] },
    { key: '5-7', label: '5 - 7 triệu', range: [5, 7] },
    { key: '7-10', label: '7 - 10 triệu', range: [7, 10] },
    { key: '10-15', label: '10 - 15 triệu', range: [10, 15] },
    { key: 'gt15', label: 'Trên 15 triệu', range: [15, 50] }
];

export const FEATURE_OPTIONS = [
    'Đầy đủ nội thất',
    'Gác xếp',
    'Kệ bếp',
    'Máy lạnh',
    'Máy giặt',
    'Tủ lạnh',
    'Thang máy',
    'Không chung chủ',
    'Giờ giấc tự do',
    'Bảo vệ 24/24',
    'Hầm để xe'
];

export const DEFAULT_FILTERS = {
    price: [0, 20], // đơn vị: triệu VND/tháng
    area: [0, 150], // m2
    types: [],
    utilities: [], // danh sách tiện ích/nội thất
    trusts: { vip: false, verified: false, normal: true }
};

// Số phòng mỗi trang (phân trang: 10 phòng/trang, phòng mới ở trên)
export const DEFAULT_PAGE_SIZE = 10;
