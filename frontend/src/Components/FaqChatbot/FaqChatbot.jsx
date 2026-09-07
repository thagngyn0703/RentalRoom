import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { askChatbot, getPublicFaqs } from '../../services/api/faqChatbotApi';

const greeting = {
  id: 'greeting',
  role: 'assistant',
  text: 'Xin chào! Tôi có thể giúp bạn về đặt phòng, thanh toán, đăng tin và các vấn đề thường gặp.',
};

const FaqChatbot = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [messages, setMessages] = useState([greeting]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state?.auth?.login?.currentUser);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const endRef = useRef(null);

  useEffect(() => {
    if (!open || suggestions.length || loadError) return;
    let active = true;
    getPublicFaqs()
      .then((result) => {
        if (active) setSuggestions((result?.data || []).slice(0, 6));
      })
      .catch(() => {
        if (active) setLoadError('Không thể tải câu hỏi gợi ý. Bạn vẫn có thể nhập câu hỏi.');
      });
    return () => { active = false; };
  }, [open, suggestions.length, loadError]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const sendQuestion = async (value = question) => {
    const cleaned = value.trim();
    if (!cleaned || cleaned.length > 500 || loading) return;
    setMessages((items) => [...items, { id: `user-${Date.now()}`, role: 'user', text: cleaned }]);
    setQuestion('');
    setLoading(true);
    try {
      const result = await askChatbot(cleaned);
      setMessages((items) => [...items, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: result?.answer || 'Tôi chưa thể trả lời câu hỏi này.',
        source: result?.source,
        canCreateTicket: Boolean(result?.canCreateTicket),
        matchedFaqs: result?.matchedFaqs || [],
      }]);
    } catch (error) {
      const message = error?.response?.status === 429
        ? 'Bạn gửi câu hỏi quá nhanh. Vui lòng thử lại sau.'
        : 'Trợ lý đang tạm thời gián đoạn. Vui lòng thử lại.';
      setMessages((items) => [...items, { id: `error-${Date.now()}`, role: 'assistant', text: message }]);
    } finally {
      setLoading(false);
    }
  };

  const openSupport = () => {
    if (currentUser) navigate('/user/support');
    else navigate('/login', { state: { from: '/user/support' } });
  };

  return (
    <>
      {!open && (
        <Fab
          color="primary"
          aria-label="Mở trợ lý hỗ trợ"
          onClick={() => setOpen(true)}
          sx={{ position: 'fixed', right: { xs: 16, sm: 24 }, bottom: { xs: 80, sm: 88 }, zIndex: 1100 }}
        >
          <SmartToyOutlinedIcon />
        </Fab>
      )}

      {open && (
        <Paper
          role="dialog"
          aria-label="Trợ lý hỗ trợ"
          elevation={12}
          sx={mobile ? {
            position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', flexDirection: 'column', borderRadius: 0,
          } : {
            position: 'fixed', right: 24, bottom: 88, width: 400, height: 580, maxHeight: 'calc(100vh - 112px)',
            zIndex: 1400, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 3,
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center' }}>
            <SmartToyOutlinedIcon sx={{ mr: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>Trợ lý phòng trọ</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Trả lời từ nội dung FAQ đã duyệt</Typography>
            </Box>
            <IconButton color="inherit" aria-label="Đóng trợ lý" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f6f8fb' }} aria-live="polite">
            <Stack spacing={1.5}>
              {messages.map((message) => (
                <Box key={message.id} sx={{ alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.25, bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper', color: message.role === 'user' ? 'primary.contrastText' : 'text.primary', overflowWrap: 'anywhere' }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message.text}</Typography>
                  </Paper>
                  {message.matchedFaqs?.length > 0 && message.source === 'unanswered' && (
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      {message.matchedFaqs.map((faq) => (
                        <Button key={faq._id || faq.question} size="small" variant="text" onClick={() => sendQuestion(faq.question)} sx={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                          {faq.question}
                        </Button>
                      ))}
                    </Stack>
                  )}
                  {message.canCreateTicket && (
                    <Button size="small" startIcon={<SupportAgentIcon />} onClick={openSupport} sx={{ mt: 0.75 }}>
                      Gửi yêu cầu hỗ trợ
                    </Button>
                  )}
                </Box>
              ))}
              {loading && <CircularProgress size={22} aria-label="Đang trả lời" />}
              <div ref={endRef} />
            </Stack>
          </Box>

          {messages.length === 1 && suggestions.length > 0 && (
            <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider', maxHeight: 130, overflowY: 'auto' }}>
              <Typography variant="caption" color="text.secondary">Câu hỏi phổ biến</Typography>
              <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 0.5 }}>
                {suggestions.map((faq) => (
                  <Button key={faq._id || faq.question} size="small" variant="outlined" onClick={() => sendQuestion(faq.question)}>
                    {faq.question}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}
          {loadError && <Typography variant="caption" color="error" sx={{ px: 2, pt: 1 }}>{loadError}</Typography>}

          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              size="small"
              label="Câu hỏi"
              value={question}
              inputProps={{ maxLength: 500 }}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendQuestion();
                }
              }}
            />
            <IconButton color="primary" aria-label="Gửi câu hỏi" disabled={!question.trim() || loading} onClick={() => sendQuestion()}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default FaqChatbot;
