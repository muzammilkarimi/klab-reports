import { useState } from 'react';
import { 
    Box, Typography, Button, TextField, Stack, 
    Chip, Alert, CircularProgress 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';

const UpgradePage = () => {
    const { tier, isPro, monthlyUsage, usageLimit, refreshLicense } = useAuth();
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleActivate = async () => {
        if (!licenseKey) return;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.activateLicense(licenseKey);
            if (res.success) {
                setSuccess('Pro Version Activated Successfully!');
                await refreshLicense();
            }
        } catch (err: any) {
            setError(err.message || 'Activation failed');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { name: 'Monthly Reports', free: '30 Reports', pro: 'Unlimited', highlight: true },
        { name: 'Save Drafts', free: false, pro: true },
        { name: 'Detailed Charts', free: false, pro: true },
        { name: 'Manage Staff', free: false, pro: true },
        { name: 'Backups', free: false, pro: true },
        { name: 'Priority Support', free: false, pro: true },
    ];

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 10, mt: 4 }}>
                <Typography variant="h2" fontWeight="900" className="gradient-text" sx={{ mb: 2, letterSpacing: -2 }}>
                    Get More with kLab Pro
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight="500">
                    Unlock extra features and unlimited reports.
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, mb: 10 }}>
                {/* Free Tier */}
                <Box className={`glass-card ${tier === 'FREE' ? 'current-plan' : ''}`} sx={{ 
                    p: 6, 
                    border: tier === 'FREE' ? '2px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(0,0,0,0.05)',
                    position: 'relative',
                    transition: 'all 0.4s ease',
                    '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }
                }}>
                    {tier === 'FREE' && (
                        <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                            <Chip label="CURRENT PLAN" sx={{ fontWeight: 900, bgcolor: 'primary.main', color: 'white', px: 1 }} />
                        </Box>
                    )}
                    <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>Basic</Typography>
                    <Typography variant="h3" fontWeight="900" sx={{ mb: 4, display: 'baseline' }}>
                        Free <Typography component="span" variant="body1" color="text.disabled" sx={{ ml: 1, fontWeight: 700 }}>/ month</Typography>
                    </Typography>
                    
                    <Stack spacing={2.5} sx={{ mb: 6 }}>
                        {features.map((f, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: f.free ? 1 : 0.4 }}>
                                <Box sx={{ 
                                    width: 24, height: 24, borderRadius: '50%', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: f.free ? 'rgba(79, 70, 229, 0.1)' : 'rgba(0,0,0,0.05)',
                                    color: f.free ? 'primary.main' : 'text.disabled'
                                }}>
                                    {f.free ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <LockIcon sx={{ fontSize: 14 }} />}
                                </Box>
                                <Typography variant="body1" fontWeight="600" color={f.free ? 'text.primary' : 'text.disabled'}>
                                    {typeof f.free === 'string' ? f.free : f.name}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                    <Button fullWidth variant="outlined" disabled size="large" sx={{ py: 2, borderRadius: 4, fontWeight: 800 }}>
                        {tier === 'FREE' ? 'Active Plan' : 'Free Access'}
                    </Button>
                </Box>

                {/* Pro Tier */}
                <Box className={`glass-card ${isPro ? 'current-plan' : ''}`} sx={{ 
                    p: 6, 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    border: isPro ? '2px solid #2dd4bf' : '1px solid rgba(45, 212, 191, 0.2)',
                    position: 'relative',
                    transition: 'all 0.4s ease',
                    '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(45, 212, 191, 0.15)' }
                }}>
                    <Box sx={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)' }}>
                        <Chip label="RECOMMENDED" sx={{ fontWeight: 900, background: 'var(--secondary-gradient)', color: 'white', px: 2, boxShadow: '0 4px 12px rgba(45, 212, 191, 0.4)' }} />
                    </Box>
                    
                    <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: '#0d9488' }}>Pro Version</Typography>
                    <Typography variant="h2" fontWeight="900" sx={{ my: 2 }}>₹99<Typography component="span" variant="h5" color="text.secondary">/mo</Typography></Typography>
                    
                    <Stack spacing={2.5} sx={{ mb: 6 }}>
                        {features.map((f, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ 
                                    width: 24, height: 24, borderRadius: '50%', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: 'rgba(45, 212, 191, 0.15)',
                                    color: '#0d9488'
                                }}>
                                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                                </Box>
                                <Typography variant="body1" fontWeight="800" sx={{ color: f.highlight ? '#0d9488' : 'text.primary' }}>
                                    {typeof f.pro === 'string' ? f.pro : f.name}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                    
                    {!isPro ? (
                        <Button fullWidth variant="contained" className="premium-button" size="large" sx={{ py: 2, borderRadius: 4, fontWeight: 800 }}>
                            Upgrade Now
                        </Button>
                    ) : (
                        <Button fullWidth variant="contained" disabled size="large" sx={{ py: 2, borderRadius: 4, fontWeight: 800, bgcolor: '#2dd4bf !important', color: 'white !important' }}>
                            Pro Status Active
                        </Button>
                    )}
                </Box>
            </Box>

            {/* License Activation */}
            {!isPro ? (
                <Box className="glass-card" sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.4)', mb: 10 }}>
                    <Typography variant="h4" fontWeight="900" sx={{ mb: 2 }}>Enter Pro Key</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto', fontWeight: 500 }}>
                        Enter your Pro key below to unlock all features.
                    </Typography>
                    
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField 
                                fullWidth 
                                placeholder="XXXX-XXXX-XXXX-XXXX" 
                                value={licenseKey}
                                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                                disabled={loading}
                                InputProps={{ sx: { borderRadius: 4, height: 60, fontWeight: 800, fontSize: '1.2rem', textAlign: 'center' } }}
                            />
                            <Button 
                                variant="contained" 
                                onClick={handleActivate}
                                disabled={loading || !licenseKey}
                                className="premium-button"
                                sx={{ minWidth: 180, height: 60, borderRadius: 4, fontWeight: 800, fontSize: '1.1rem' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Activate'}
                            </Button>
                        </Stack>
                        {error && <Alert severity="error" variant="filled" sx={{ mt: 3, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}
                        {success && <Alert severity="success" variant="filled" sx={{ mt: 3, borderRadius: 3, fontWeight: 700 }}>{success}</Alert>}
                    </Box>
                </Box>
            ) : (
                <Box className="glass-card" sx={{ p: 6, mb: 10, bgcolor: 'rgba(45, 212, 191, 0.05)', border: '1px solid rgba(45, 212, 191, 0.3)', textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 60, color: '#2dd4bf', mb: 2 }} />
                    <Typography variant="h4" fontWeight="900" sx={{ mb: 1 }}>Pro Version Active</Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight="600">
                        Thank you! You now have access to all Pro features.
                    </Typography>
                </Box>
            )}

            {/* Usage Stats (Free Tier only) */}
            {!isPro && (
                <Box sx={{ mb: 10, p: 4, border: '1px dashed rgba(99, 102, 241, 0.3)', borderRadius: 6, textAlign: 'center', bgcolor: 'rgba(99, 102, 241, 0.02)' }}>
                    <Typography variant="h6" fontWeight="800" sx={{ mb: 2, opacity: 0.8 }}>
                        Current Monthly Usage
                    </Typography>
                    <Typography variant="h2" fontWeight="900" color="primary" sx={{ mb: 1 }}>
                        {monthlyUsage} <Typography component="span" variant="h5" color="text.disabled" fontWeight="800">/ {usageLimit}</Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="700" sx={{ mb: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Reports generated this month
                    </Typography>
                    
                    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', bgcolor: 'rgba(0,0,0,0.05)', height: 12, borderRadius: 6, overflow: 'hidden' }}>
                        <Box sx={{ 
                            width: `${Math.min((monthlyUsage / usageLimit) * 100, 100)}%`, 
                            background: 'var(--primary-gradient)', 
                            height: '100%',
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default UpgradePage;
