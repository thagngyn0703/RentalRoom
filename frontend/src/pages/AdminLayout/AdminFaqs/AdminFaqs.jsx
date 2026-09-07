import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  createFaq,
  deleteFaq,
  getAdminFaqs,
  updateFaq,
  updateFaqStatus,
} from '../../../services/api/faqChatbotApi';

const emptyForm = {
  question: '', answer: '', keywords: '', category: 'general', priority: 0, isActive: true,
};

const categories = [
  ['general', 'Chung'],
  ['booking', 'Đặt phòng'],
  ['payment', 'Thanh toán'],
  ['account', 'Tài khoản'],
  ['listing', 'Đăng tin'],
  ['checkout', 'Trả phòng'],
];

const AdminFaqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadFaqs = useCallback(async () => {
    try {
      setError('');
      const result = await getAdminFaqs({ page: page + 1, limit: 20, search, status });
      setFaqs(result?.data || []);
      setTotal(result?.pagination?.total || 0);
    } catch (_error) {
      setError('Không thể tải danh sách FAQ.');
    }
  }, [page, search, status]);

  useEffect(() => { loadFaqs(); }, [loadFaqs]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (faq) => {
    setEditing(faq);
    setForm({
      question: faq.question || '',
      answer: faq.answer || '',
      keywords: (faq.keywords || []).join(', '),
      category: faq.category || 'general',
      priority: faq.priority || 0,
      isActive: faq.isActive !== false,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Câu hỏi và câu trả lời là bắt buộc.');
      return;
    }
    const payload = {
      ...form,
      question: form.question.trim(),
      answer: form.answer.trim(),
      keywords: form.keywords.split(',').map((item) => item.trim()).filter(Boolean),
      priority: Number(form.priority) || 0,
    };
    try {
      setSaving(true);
      setError('');
      if (editing) await updateFaq(editing._id, payload);
      else await createFaq(payload);
      setDialogOpen(false);
      await loadFaqs();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Không thể lưu FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (faq) => {
    try {
      await updateFaqStatus(faq._id, !faq.isActive);
      setFaqs((items) => items.map((item) => (
        item._id === faq._id ? { ...item, isActive: !item.isActive } : item
      )));
    } catch (_error) {
      setError('Không thể cập nhật trạng thái FAQ.');
    }
  };

  const remove = async (faq) => {
    if (!window.confirm(`Xóa FAQ “${faq.question}”?`)) return;
    try {
      await deleteFaq(faq._id);
      await loadFaqs();
    } catch (_error) {
      setError('Không thể xóa FAQ.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography component="h1" variant="h4" fontWeight={700}>Quản lý FAQ</Typography>
          <Typography color="text.secondary">Nội dung đã duyệt dùng để trợ lý trả lời người dùng.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Thêm FAQ</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField size="small" label="Tìm kiếm" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} fullWidth />
          <TextField select size="small" label="Trạng thái" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} sx={{ minWidth: 180 }}>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="active">Đang hiển thị</MenuItem>
            <MenuItem value="inactive">Đang ẩn</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Câu hỏi</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell align="center">Ưu tiên</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faqs.map((faq) => (
              <TableRow key={faq._id} hover>
                <TableCell sx={{ maxWidth: 520 }}>
                  <Typography variant="body2" fontWeight={600}>{faq.question}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>{faq.answer}</Typography>
                </TableCell>
                <TableCell><Chip size="small" label={categories.find(([key]) => key === faq.category)?.[1] || faq.category} /></TableCell>
                <TableCell align="center">{faq.priority || 0}</TableCell>
                <TableCell align="center">
                  <Switch checked={faq.isActive !== false} onChange={() => toggleStatus(faq)} inputProps={{ 'aria-label': `Trạng thái ${faq.question}` }} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Sửa"><IconButton aria-label={`Sửa ${faq.question}`} onClick={() => openEdit(faq)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Xóa"><IconButton color="error" aria-label={`Xóa ${faq.question}`} onClick={() => remove(faq)}><DeleteOutlineIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!faqs.length && <TableRow><TableCell colSpan={5} align="center">Chưa có FAQ.</TableCell></TableRow>}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
          onPageChange={(_event, value) => setPage(value)}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Sửa FAQ' : 'Thêm FAQ'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Câu hỏi" required value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} inputProps={{ maxLength: 300 }} />
            <TextField label="Câu trả lời" required multiline minRows={4} value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} inputProps={{ maxLength: 5000 }} />
            <TextField label="Từ khóa (phân cách bằng dấu phẩy)" value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Danh mục" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} fullWidth>
                {categories.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </TextField>
              <TextField label="Độ ưu tiên" type="number" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} inputProps={{ min: 0, max: 100 }} fullWidth />
            </Stack>
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />} label="Hiển thị trong chatbot" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu FAQ'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminFaqs;
