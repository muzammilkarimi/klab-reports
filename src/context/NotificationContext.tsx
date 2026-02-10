import { createContext, useContext, useState, type ReactNode } from 'react';
import { 
    Snackbar, Alert, type AlertColor, Dialog, DialogTitle, 
    DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';

interface NotificationContextType {
    showToast: (message: string, severity?: AlertColor) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    // Toast State
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: AlertColor }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Dialog State
    const [confirm, setConfirm] = useState<{ 
        open: boolean; 
        title: string; 
        message: string; 
        onConfirm: () => void 
    }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const showToast = (message: string, severity: AlertColor = 'success') => {
        setToast({ open: true, message, severity });
    };

    const handleToastClose = () => {
        setToast(prev => ({ ...prev, open: false }));
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirm({ open: true, title, message, onConfirm });
    };

    const handleConfirmClose = () => {
        setConfirm(prev => ({ ...prev, open: false }));
    };

    const handleConfirmProceed = () => {
        confirm.onConfirm();
        handleConfirmClose();
    };

    return (
        <NotificationContext.Provider value={{ showToast, showConfirm }}>
            {children}
            
            {/* Global Toast */}
            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={handleToastClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleToastClose} 
                    severity={toast.severity} 
                    variant="filled"
                    sx={{ 
                        width: '100%', 
                        borderRadius: 3, 
                        fontWeight: 700,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>

            {/* Global Confirmation Dialog */}
            <Dialog 
                open={confirm.open} 
                onClose={handleConfirmClose}
                PaperProps={{
                    sx: {
                        borderRadius: 6,
                        p: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>
                    {confirm.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        {confirm.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleConfirmClose} sx={{ fontWeight: 700, borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmProceed} 
                        variant="contained" 
                        color={confirm.title.toLowerCase().includes('delete') || confirm.title.toLowerCase().includes('purge') ? 'error' : 'primary'}
                        sx={{ 
                            fontWeight: 800, 
                            borderRadius: 2.5,
                            px: 3,
                            boxShadow: 'none',
                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
