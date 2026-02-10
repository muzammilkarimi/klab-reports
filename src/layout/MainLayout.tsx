import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, useTheme, Avatar, Chip, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DraftsIcon from '@mui/icons-material/Drafts';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BiotechIcon from '@mui/icons-material/Biotech';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ScienceIcon from '@mui/icons-material/Science';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const menuItems = [
    { text: 'New Report', icon: <NoteAddIcon />, path: '/new-report' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', pro: true },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/history' },
    { text: 'Drafts', icon: <DraftsIcon />, path: '/drafts', pro: true },
    { text: 'Tests', icon: <ScienceIcon />, path: '/tests' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const MainLayout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isPro, monthlyUsage, usageLimit } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
            {/* Logo Area */}
            <Box sx={{ p: 4, pt: 5, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                    width: 44, height: 44, 
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                    borderRadius: 3, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'white',
                    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                }}>
                    <BiotechIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1, letterSpacing: -0.5, color: '#1e293b' }}>
                        kLab
                    </Typography>
                    <Typography variant="caption" fontWeight="800" color="primary" sx={{ letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        Reports
                    </Typography>
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ px: 2, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    const isLocked = item.pro && !isPro;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 3,
                                    py: 1.5,
                                    bgcolor: active ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                    color: active ? '#4f46e5' : '#64748b',
                                    '&:hover': {
                                        bgcolor: active ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0,0,0,0.02)',
                                        transform: 'translateX(4px)'
                                    },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '& .MuiListItemIcon-root': {
                                        color: active ? '#4f46e5' : '#94a3b8',
                                        minWidth: 42,
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" fontWeight={active ? 800 : 700}>
                                                {item.text}
                                            </Typography>
                                            {isLocked && <LockIcon sx={{ fontSize: '0.85rem', color: '#94a3b8', opacity: 0.6 }} />}
                                        </Box>
                                    } 
                                />
                                {active && (
                                    <Box sx={{ 
                                        position: 'absolute', right: 8, width: 4, height: 20, 
                                        borderRadius: 2, background: '#4f46e5',
                                        boxShadow: '0 0 10px rgba(79, 70, 229, 0.4)'
                                    }} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* User Profile & Plan */}
            <Box sx={{ p: 3, borderTop: `1px solid rgba(0,0,0,0.05)`, bgcolor: 'rgba(0,0,0,0.01)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'admin'}`}
                        sx={{ 
                            width: 44, height: 44, borderRadius: 3,
                            bgcolor: '#f1f5f9',
                            border: '2px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                    >
                        {user?.full_name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle2" fontWeight="900" color="#1e293b" noWrap sx={{ lineHeight: 1.2 }}>
                            {user?.full_name || 'Administrator'}
                        </Typography>
                        <Chip 
                            label={isPro ? "PRO VERSION" : "FREE TIER"} 
                            size="small" 
                            sx={{ 
                                height: 16, fontSize: '0.55rem', fontWeight: 900, mt: 0.5,
                                background: isPro ? 'linear-gradient(90deg, #6366f1, #a855f7)' : '#e2e8f0',
                                color: isPro ? 'white' : '#64748b',
                                border: 'none'
                            }} 
                        />
                    </Box>
                </Box>

                {!isPro && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" fontWeight="800" color="text.secondary">REPORT LIMIT</Typography>
                            <Typography variant="caption" fontWeight="900" color="primary">{monthlyUsage}/{usageLimit}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: '#f1f5f9', height: 6, borderRadius: 3, mb: 2.5, overflow: 'hidden' }}>
                            <Box 
                                sx={{ 
                                    width: `${Math.min((monthlyUsage / usageLimit) * 100, 100)}%`, 
                                    background: 'linear-gradient(90deg, #6366f1, #10b981)', 
                                    height: '100%',
                                    borderRadius: 3,
                                    boxShadow: '0 0 8px rgba(99, 102, 241, 0.3)'
                                }} 
                            />
                        </Box>
                        <Button 
                            fullWidth 
                            variant="contained" 
                            size="small"
                            onClick={() => navigate('/upgrade')}
                            className="premium-button"
                            sx={{ borderRadius: 2.5, py: 1, fontWeight: 800, fontSize: '0.75rem' }}
                        >
                            Upgrade to Pro
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
            <AppBar position="fixed" 
                sx={{ 
                    width: { sm: `calc(100% - ${drawerWidth}px)` }, 
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Toolbar>
                    <IconButton color="primary" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    {user ? (
                        <IconButton color="primary" onClick={handleLogout} title="Logout">
                            <LogoutIcon />
                        </IconButton>
                    ) : (
                        <IconButton color="primary" onClick={() => navigate('/login')} title="Login">
                            <LockIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer 
                    variant="temporary" 
                    open={mobileOpen} 
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer 
                    variant="permanent" 
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.02)' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
