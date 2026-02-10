import React, { useState } from 'react';
import { 
    Box, Paper, TextField, Button, Typography, IconButton, InputAdornment, 
    Alert, CircularProgress 
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.login({ username, password });
            if (data.success) {
                login(data.user);
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1F3A5F 0%, #4d648d 100%)',
            p: 2
        }}>
            <Paper elevation={24} sx={{ 
                p: 5, 
                width: '100%', 
                maxWidth: 400, 
                borderRadius: 4,
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
            }}>
                <Box sx={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    backgroundColor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                }}>
                    <LockOutlinedIcon sx={{ fontSize: 32 }} />
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1F3A5F' }}>kLab Reports</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Please sign in to continue</Typography>

                {error && <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>{error}</Alert>}

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ 
                            mt: 4, 
                            py: 1.5, 
                            borderRadius: 2,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 8px 16px rgba(31, 58, 95, 0.3)',
                        }}
                    >
                        {loading ? <CircularProgress size={26} color="inherit" /> : 'Log In'}
                    </Button>
                </form>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
                    &copy; {new Date().getFullYear()} kLab Reports - v1.5.0
                </Typography>
            </Paper>
        </Box>
    );
};

export default LoginPage;
