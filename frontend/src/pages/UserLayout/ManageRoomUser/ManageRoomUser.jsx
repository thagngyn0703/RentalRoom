import React, { useEffect, useState } from 'react';
import axiosJWT from '../../../config/axiosJWT';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../../Components/ConfirmProvider';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormGroup, FormControlLabel, Checkbox, Tabs, Tab, Chip } from '@mui/material';
import RoomDetailModal from './RoomDetailModal';
import RoomEditModal from './RoomEditModal';

const statusMap = {
  available: 'Còn trống',
  rented: 'Đã cho thuê',
  pending: 'Chờ duyệt',
  // Thêm trạng thái khác nếu có
};

const ROOM_TAB = {
  all: 'all',
  available: 'available',
  rented: 'rented',
};

export default function ManageRoomUser() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState({ province: '', district: '', roomType: '' });
  const [tab, setTab] = useState(ROOM_TAB.all);
  // State cho dialog tạo phòng
  const [openCreate, setOpenCreate] = useState(false);
  // State cho modal xem chi tiết phòng
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null); // { _id, status, ... }
  // State cho modal cập nhật phòng
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEditRoomId, setSelectedEditRoomId] = useState(null);
  const [newRoom, setNewRoom] = useState({
    roomType: '', price: '', area: '', beds: 0, baths: 0,
    province: '', district: '', ward: '', address: '',
    utilities: [], additionalCosts: '', images: '', videos: '', notes: ''
  });
  const utilityOptions = [
    'Wifi', 'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Nóng lạnh', 'Thang máy', 'Bãi gửi xe', 'Ban công', 'Bếp riêng', 'Giường', 'Tủ đồ', 'Camera an ninh'
  ];
  const handleOpenCreate = () => navigate('/user/post-room');
  const handleCloseCreate = () => setOpenCreate(false);
  const handleOpenDetail = (room) => {
    setSelectedRoom(room);
    setOpenDetail(true);
  };
  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedRoom(null);
  };
  const handleOpenEdit = (roomId) => {
    setSelectedEditRoomId(roomId);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedEditRoomId(null);
  };
  const handleUpdateSuccess = () => {
    fetchRooms();
  };
  const handleChangeNewRoom = (e) => {
    setNewRoom({ ...newRoom, [e.target.name]: e.target.value });
  };
  const handleUtilityChange = (utility) => {
    setNewRoom((prev) => {
      const exists = prev.utilities.includes(utility);
      return {
        ...prev,
        utilities: exists
          ? prev.utilities.filter(u => u !== utility)
          : [...prev.utilities, utility]
      };
    });
  };
  const handleCreateRoom = async () => {
    try {
      const payload = {
        ...newRoom,
        utilities: newRoom.utilities,
      };
      await axiosJWT.post('/api/rooms', payload);
      handleCloseCreate();
      setNewRoom({ roomType: '', price: '', area: '', beds: 0, baths: 0, province: '', district: '', ward: '', address: '', utilities: [], additionalCosts: '', images: '', videos: '', notes: '' });
      fetchRooms();
    } catch (err) {
      alert('Lỗi khi tạo phòng mới');
    }
  };

  const fetchRooms = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = { page, limit, ...filter, ...params };
      if (tab !== ROOM_TAB.all) queryParams.status = tab;
      const query = new URLSearchParams(queryParams).toString();
      const res = await axiosJWT.get(`/api/rooms?${query}`);
      if (Array.isArray(res.data)) {
        setRooms(res.data);
        setTotal(res.data.length);
        setTotalPages(1);
      } else if (Array.isArray(res.data.rooms)) {
        setRooms(res.data.rooms);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setRooms([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      alert('Lỗi khi tải danh sách phòng');
      setRooms([]);
      setTotal(0);
      setTotalPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line
  }, [page, limit, filter, tab]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
    setPage(1);
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleDelete = async (roomId) => {
    const ok = await confirm('Bạn chắc chắn muốn xóa phòng này?');
    if (!ok) return;
    try {
      await axiosJWT.delete(`/api/rooms/${roomId}`);
      fetchRooms();
    } catch (err) {
      alert('Lỗi khi xóa phòng');
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>
        {tab === ROOM_TAB.all ? 'Quản lý phòng của bạn' : tab === ROOM_TAB.available ? 'Phòng còn trống' : 'Phòng đã cho thuê'}
      </Typography>
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setPage(1); }}
        sx={{ mb: 2 }}
      >
        <Tab label="Tất cả" value={ROOM_TAB.all} />
        <Tab label="Còn trống" value={ROOM_TAB.available} />
        <Tab label="Phòng đã cho thuê" value={ROOM_TAB.rented} />
      </Tabs>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpenCreate}>Tạo phòng mới</Button>
      <Dialog open={openCreate} onClose={handleCloseCreate}>
        <DialogTitle>Tạo phòng mới</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>Thông tin bắt buộc</Typography>
          <TextField label="Loại phòng *" name="roomType" value={newRoom.roomType} onChange={handleChangeNewRoom} fullWidth select sx={{ my: 1 }} required>
            <MenuItem value="Phòng trọ">Phòng trọ</MenuItem>
            <MenuItem value="Căn hộ">Căn hộ</MenuItem>
            <MenuItem value="Ký túc xá">Ký túc xá</MenuItem>
          </TextField>
          <TextField label="Giá *" name="price" value={newRoom.price} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} type="number" required InputProps={{ endAdornment: <span>VND</span> }} />
          <TextField label="Diện tích (m²) *" name="area" value={newRoom.area} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} type="number" required />
          <TextField label="Tỉnh/Thành *" name="province" value={newRoom.province} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} required />
          <TextField label="Quận/Huyện *" name="district" value={newRoom.district} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} required />
          <TextField label="Địa chỉ chi tiết *" name="address" value={newRoom.address} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} required />
          <TextField label="Phường/Xã" name="ward" value={newRoom.ward} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>Thông tin bổ sung (không bắt buộc)</Typography>
          <TextField label="Số phòng ngủ" name="beds" value={newRoom.beds} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} type="number" />
          <TextField label="Số phòng WC" name="baths" value={newRoom.baths} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} type="number" />
          <Box sx={{ my: 1 }}>
            <Typography fontSize={14} sx={{ mb: 0.5 }}>Tiện ích</Typography>
            <FormGroup row>
              {utilityOptions.map(option => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={newRoom.utilities.includes(option)}
                      onChange={() => handleUtilityChange(option)}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
          </Box>
          <TextField label="Chi phí phát sinh (JSON)" name="additionalCosts" value={newRoom.additionalCosts} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} helperText='[{"type":"Gửi xe","frequency":"tháng"}]' />
          <TextField label="Ghi chú" name="notes" value={newRoom.notes} onChange={handleChangeNewRoom} fullWidth sx={{ my: 1 }} multiline minRows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Hủy</Button>
          <Button onClick={handleCreateRoom} variant="contained">Tạo</Button>
        </DialogActions>
      </Dialog>
      {/* Filter UI */}
      <Box mb={2} display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <TextField label="Tỉnh/Thành" name="province" value={filter.province} onChange={handleFilterChange} size="small" />
        <TextField label="Quận/Huyện" name="district" value={filter.district} onChange={handleFilterChange} size="small" />
        <TextField label="Loại phòng" name="roomType" value={filter.roomType} onChange={handleFilterChange} size="small" select>
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="Phòng trọ">Phòng trọ</MenuItem>
          <MenuItem value="Căn hộ">Căn hộ</MenuItem>
          <MenuItem value="Ký túc xá">Ký túc xá</MenuItem>
        </TextField>
        <TextField label="Số dòng/trang" name="limit" value={limit} onChange={handleLimitChange} size="small" select>
          {[5, 10, 20, 50].map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
        </TextField>
      </Box>
      <TableContainer component={Paper}>
              {/* Pagination (đưa ra ngoài Table) */}
              <Box display="flex" justifyContent="center" alignItems="center" my={2} gap={2}>
                <Button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>Trước</Button>
                <Typography>Trang {page} / {totalPages}</Typography>
                <Button disabled={page === totalPages || totalPages === 0} onClick={() => handlePageChange(page + 1)}>Sau</Button>
                <Typography>Tổng: {total} phòng</Typography>
              </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tên phòng</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5}>Đang tải...</TableCell></TableRow>
            ) : rooms.length === 0 ? (
              <TableRow><TableCell colSpan={5}>Không có phòng nào</TableCell></TableRow>
            ) : rooms.map(room => (
              <TableRow key={room._id}>
                <TableCell>
                  {(
                    (room.images && room.images[0]) ||
                    (room.post && room.post.images && room.post.images[0])
                  ) ? (
                    <img
                      src={room.images && room.images[0] ? room.images[0] : room.post.images[0]}
                      alt={room.roomType}
                      style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }}
                      onError={(e) => { e.target.src = ''; }}
                    />
                  ) : null}
                </TableCell>
                <TableCell>{room.roomType}</TableCell>
                <TableCell>{room.address}</TableCell>
                <TableCell>{room.price?.toLocaleString()} {room.unit || 'VND'}</TableCell>
                <TableCell>
                  {(() => {
                    const label = statusMap[room.status] || room.status || 'Chưa rõ';
                    const color = room.status === 'rented' ? 'error' : room.status === 'available' ? 'success' : 'default';
                    return <Chip label={label} color={color} size="small" variant="outlined" />;
                  })()}
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" color="info" onClick={() => handleOpenDetail(room)}>Chi tiết</Button>
                  <Button size="small" variant="outlined" color="success" sx={{ mx: 1 }} onClick={() => handleOpenEdit(room._id)}>Cập nhật</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(room._id)}>Xóa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RoomDetailModal open={openDetail} onClose={handleCloseDetail} roomId={selectedRoom?._id} roomStatus={selectedRoom?.status} />
      <RoomEditModal open={openEdit} onClose={handleCloseEdit} roomId={selectedEditRoomId} onUpdateSuccess={handleUpdateSuccess} />
    </Box>
  );
}
