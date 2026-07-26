import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';

const ConfirmContext = createContext({
  confirm: async () => false,
});

export const useConfirm = () => useContext(ConfirmContext);

export default function ConfirmProvider({ children }) {
  const resolverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Xác nhận');
  const [message, setMessage] = useState('');
  const [confirmText, setConfirmText] = useState('Đồng ý');
  const [cancelText, setCancelText] = useState('Hủy');

  const closeWith = (result) => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  const confirm = useCallback((options) => {
    const opts = typeof options === 'string' ? { message: options } : (options || {});
    setTitle(opts.title || 'Xác nhận');
    setMessage(opts.message || 'Bạn có chắc chắn muốn tiếp tục?');
    setConfirmText(opts.confirmText || 'Đồng ý');
    setCancelText(opts.cancelText || 'Hủy');
    setOpen(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog open={open} onClose={() => closeWith(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeWith(false)}>{cancelText}</Button>
          <Button onClick={() => closeWith(true)} variant="contained" color="primary">
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
