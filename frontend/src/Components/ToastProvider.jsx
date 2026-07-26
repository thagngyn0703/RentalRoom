import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ToastContext = createContext({ showToast: () => {} });

 const useToast = () => useContext(ToastContext);

 function ToastProvider({ children }) {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [severity, setSeverity] = useState('info');
	const theme = useTheme();
	const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

	const showToast = useCallback((msg, level = 'info') => {
		setMessage(msg);
		setSeverity(level);
		setOpen(true);
	}, []);

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') return;
		setOpen(false);
	};

	useEffect(() => {
		const onGlobalAlert = (event) => {
			const msg = event?.detail;
			if (msg == null) return;
			showToast(String(msg), 'info');
		};
		window.addEventListener('app:alert', onGlobalAlert);
		return () => window.removeEventListener('app:alert', onGlobalAlert);
	}, [showToast]);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<Snackbar
				open={open}
				autoHideDuration={3500}
				onClose={handleClose}
				anchorOrigin={isSmall ? { vertical: 'top', horizontal: 'center' } : { vertical: 'top', horizontal: 'right' }}
				sx={{ mt: 8 }}
			>
				<Alert onClose={handleClose} severity={severity} elevation={6} variant="filled" sx={{ minWidth: 200, bgcolor: severity === 'success' ? '#2e7d32' : undefined }}>
					{message}
				</Alert>
			</Snackbar>
		</ToastContext.Provider>
		
	);
}
export { ToastProvider, useToast };
