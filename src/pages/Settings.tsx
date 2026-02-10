import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Divider, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl, Chip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Settings = () => {
    const { user: currentUser, isPro } = useAuth();
    const { showToast, showConfirm } = useNotification();
    const [settings, setSettings] = useState({
        lab_name: 'kLab Reports',
        address_line1: '123 Health Street',
        address_line2: 'Medical District',
        phone: '(555) 123-4567',
        email: 'reports@klab.com',
        website: 'www.klab.com'
    });
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userData, setUserData] = useState({ 
        username: '', 
        password: '', 
        full_name: '', 
        role: 'TECHNICIAN' 
    });

    useEffect(() => {
        loadSettings();
        if (currentUser?.role === 'ADMIN') {
            loadUsers();
        }
    }, [currentUser]);

    const loadSettings = async () => {
        try {
            const data = await api.getSettings();
            if (Object.keys(data).length > 0) {
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (e) { console.error('Failed to load settings', e); }
    };

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (e) { console.error('Failed to load users', e); }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.saveSettings(settings);
            showToast('Settings saved successfully!');
        } catch (e) {
            showToast('Failed to save settings.', 'error');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async () => {
        try {
            if (editingUser) {
                await api.updateUser(editingUser.id, userData);
            } else {
                await api.createUser(userData);
            }
            setUserDialogOpen(false);
            setEditingUser(null);
            setUserData({ username: '', password: '', full_name: '', role: 'TECHNICIAN' });
            loadUsers();
            showToast(editingUser ? 'User updated' : 'User created');
        } catch (e: any) {
            showToast(e.message, 'error');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (id === currentUser?.id) {
            showToast("You cannot delete your own account.", "warning");
            return;
        }
        showConfirm(
            'Delete Staff Account',
            'Are you sure you want to delete this staff member?',
            async () => {
                try {
                    await api.deleteUser(id);
                    showToast('User removed successfully');
                    loadUsers();
                } catch (e) { showToast('Failed to delete user', 'error'); }
            }
        );
    };

    const openEditUser = (u: any) => {
        setEditingUser(u);
        setUserData({ 
            username: u.username, 
            password: '', 
            full_name: u.full_name, 
            role: u.role 
        });
        setUserDialogOpen(true);
    };

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [field]: e.target.value });
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 1 }}>
            <Box sx={{ mb: 6, mt: 2 }}>
                <Typography variant="h3" fontWeight="800" className="gradient-text" sx={{ mb: 1, letterSpacing: -1 }}>
                    App Settings
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight="500">
                    Update your lab info and manage staff accounts.
                </Typography>
            </Box>

            <Box className="glass-card" sx={{ p: 4, mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
                    <Box sx={{ 
                        width: 80, height: 80, borderRadius: '50%', 
                        background: 'var(--primary-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)'
                    }}>
                        <BusinessIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight="800">Lab Details</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            This info will show up on all saved reports.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                    <TextField 
                        fullWidth label="Lab Name" 
                        variant="outlined"
                        value={settings.lab_name} 
                        onChange={handleChange('lab_name')} 
                        sx={{ gridColumn: { md: 'span 2' } }}
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                    <TextField 
                        fullWidth label="Address Line 1" 
                        value={settings.address_line1} 
                        onChange={handleChange('address_line1')} 
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                    <TextField 
                        fullWidth label="Address Line 2" 
                        value={settings.address_line2} 
                        onChange={handleChange('address_line2')} 
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                    <TextField 
                        fullWidth label="Phone Number" 
                        value={settings.phone} 
                        onChange={handleChange('phone')} 
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                    <TextField 
                        fullWidth label="Email Address" 
                        value={settings.email} 
                        onChange={handleChange('email')} 
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                    <TextField 
                        fullWidth label="Website" 
                        value={settings.website} 
                        onChange={handleChange('website')} 
                        sx={{ gridColumn: { md: 'span 2' } }}
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                </Box>

                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        variant="contained" 
                        size="large" 
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                        className="premium-button"
                        sx={{ px: 5, py: 1.5, borderRadius: 3, fontWeight: 800 }}
                    >
                        Save Details
                    </Button>
                </Box>
            </Box>

            {currentUser?.role === 'ADMIN' && (
                <Box sx={{ mt: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="800">Manage Staff</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="500">Add or remove staff accounts.</Typography>
                        </Box>
                        <Button 
                            variant="outlined" 
                            startIcon={<PersonAddIcon />}
                            onClick={() => {
                                setEditingUser(null);
                                setUserData({ username: '', password: '', full_name: '', role: 'TECHNICIAN' });
                                setUserDialogOpen(true);
                            }}
                            sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
                        >
                            Add Staff
                        </Button>
                    </Box>
                    <Box className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
                        <List disablePadding>
                            {users.map((u, index) => (
                                <Box key={u.id}>
                                    <ListItem 
                                        sx={{ py: 3, px: 4 }}
                                        secondaryAction={
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton onClick={() => openEditUser(u)} sx={{ color: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.05)', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton onClick={() => handleDeleteUser(u.id)} color="error" disabled={u.id === currentUser?.id} sx={{ bgcolor: 'rgba(244, 63, 94, 0.05)', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        }
                                    >
                                        <ListItemText 
                                            primary={<Typography variant="subtitle1" fontWeight="800" color="text.primary">{u.full_name}</Typography>}
                                            secondary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <Typography variant="caption" fontWeight="700" color="text.secondary">{u.username}</Typography>
                                                    <Typography variant="caption" color="text.disabled">•</Typography>
                                                    <Chip 
                                                        label={u.role} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 18, fontSize: '0.6rem', fontWeight: 900,
                                                            bgcolor: u.role === 'ADMIN' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(0,0,0,0.05)',
                                                            color: u.role === 'ADMIN' ? 'primary.main' : 'text.secondary',
                                                            borderRadius: 1
                                                        }} 
                                                    />
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < users.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                                </Box>
                            ))}
                        </List>
                    </Box>
                </Box>
            )}

            {/* User Dialog */}
            <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField 
                            label="Full Name" 
                            fullWidth 
                            value={userData.full_name}
                            onChange={(e) => setUserData({ ...userData, full_name: e.target.value })}
                        />
                        <TextField 
                            label="Username" 
                            fullWidth 
                            value={userData.username}
                            onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                        />
                        <TextField 
                            label={editingUser ? "New Password (leave blank to keep)" : "Password"}
                            type="password" 
                            fullWidth 
                            value={userData.password}
                            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={userData.role}
                                label="Role"
                                onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                            >
                                <MenuItem value="TECHNICIAN">Technician</MenuItem>
                                <MenuItem value="ADMIN">Administrator</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUserAction}>
                        {editingUser ? 'Update User' : 'Create User'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Backup & Recovery (Pro Only) */}
            {currentUser?.role === 'ADMIN' && (
                <Box sx={{ mt: 8, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="800">Backups</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="500">Save your data to a file for safety.</Typography>
                        </Box>
                        {!isPro && <Chip icon={<LockIcon sx={{ fontSize: '1rem !important' }} />} label="PRO FEATURE" color="primary" sx={{ fontWeight: 800, borderRadius: 2 }} />}
                    </Box>
                    
                    <Box className="glass-card" sx={{ p: 4, display: 'flex', gap: 4, bgcolor: !isPro ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.4)', opacity: !isPro ? 0.6 : 1, pointerEvents: !isPro ? 'none' : 'auto' }}>
                        <Button variant="outlined" startIcon={<CloudDownloadIcon />} sx={{ borderRadius: 3, fontWeight: 700 }}>Save Data to File</Button>
                        <Button variant="outlined" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 3, fontWeight: 700 }}>Upload Data from File</Button>
                    </Box>
                </Box>
            )}

            {currentUser?.role === 'ADMIN' && (
                <Box sx={{ mt: 8, mb: 10 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                        <Typography variant="h5" fontWeight="800" sx={{ color: 'error.main' }}>Delete All Data</Typography>
                        {!isPro && <Chip icon={<LockIcon sx={{ fontSize: '1rem !important' }} />} label="PRO FEATURE" color="error" variant="outlined" sx={{ fontWeight: 800, borderRadius: 2 }} />}
                    </Box>
                    <Box sx={{ 
                        p: 4, borderRadius: 6, border: '1px dashed', borderColor: 'error.light', 
                        bgcolor: 'rgba(244, 63, 94, 0.03)', display: 'flex', justifyContent: 'space-between', 
                        alignItems: 'center', flexWrap: 'wrap', gap: 3,
                        opacity: !isPro ? 0.6 : 1, pointerEvents: !isPro ? 'none' : 'auto'
                    }}>
                        <Box>
                            <Typography variant="h6" fontWeight="800">Clear All Information</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="500">
                                This will permanently delete everything: patients, reports, and tests.
                            </Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            color="error" 
                            startIcon={<DeleteIcon />}
                            onClick={async () => {
                                showConfirm(
                                    'PURGE DATABASE',
                                    'CRITICAL WARNING: This action is permanent and IRREVERSIBLE. Are you absolutely certain?',
                                    async () => {
                                        try {
                                            await api.resetDatabase();
                                            showToast('System database has been purged.');
                                            setTimeout(() => window.location.reload(), 2000);
                                        } catch (e: any) {
                                            showToast('Purge failed: ' + e.message, 'error');
                                        }
                                    }
                                );
                            }}
                            sx={{ borderRadius: 3, fontWeight: 800, px: 4 }}
                        >
                            Delete Everything
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Settings;
