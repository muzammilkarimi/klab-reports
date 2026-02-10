import { useState, useEffect } from 'react';
import { 
    Box, Typography, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip,
    TextField, InputAdornment, IconButton, Tooltip, Button
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface Report {
    id: number;
    patient_name: string;
    patient_age: number;
    patient_gender: string;
    test_names: string;
    total_amount: number;
    status: 'DRAFT' | 'FINAL';
    created_at: string;
}

const Drafts = () => {
    const navigate = useNavigate();
    const { isPro } = useAuth();
    const { showToast, showConfirm } = useNotification();

    useEffect(() => {
        // No redirect - we show a teaser instead
    }, [isPro, navigate]);
    const [reports, setReports] = useState<Report[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await api.getReports();
            if (Array.isArray(data)) {
                // Filter only DRAFTS
                setReports(data.filter((r: Report) => r.status === 'DRAFT'));
            } else {
                setReports([]);
            }
            setLoading(false);
        } catch (e) { 
            console.error('Failed to load drafts', e);
            setLoading(false); 
        }
    };

    const handleResume = (reportId: number) => {
        // Navigate to edit - for now navigate to new report (can be enhanced to load draft data)
        navigate(`/new-report?draft=${reportId}`);
    };

    const handleDelete = async (reportId: number, patientName: string) => {
        showConfirm(
            'Delete Draft',
            `Are you sure you want to delete the draft for ${patientName}?`,
            async () => {
                try {
                    await api.deleteReport(reportId);
                    showToast('Draft deleted successfully');
                    loadReports();
                } catch (error) {
                    console.error('Failed to delete draft:', error);
                    showToast('Failed to delete draft. Please try again.', 'error');
                }
            }
        );
    };

    const filteredReports = reports.filter(r => 
        r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.id).includes(searchTerm)
    );

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 0 }, pb: 10, position: 'relative' }}>
            {!isPro && (
                <Box sx={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                    zIndex: 2000, bgcolor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, p: 4, textAlign: 'center', minHeight: 400
                }}>
                    <Box sx={{ 
                        width: 80, height: 80, borderRadius: '24px', 
                        background: 'var(--primary-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', mb: 3, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)'
                    }}>
                        <LockIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" fontWeight="900" sx={{ mb: 2 }}>Drafts are a Pro feature</Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, fontWeight: 500 }}>
                        Save reports as drafts and finish them later with kLab Pro.
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large"
                        className="premium-button"
                        onClick={() => navigate('/upgrade')}
                        sx={{ borderRadius: 4, px: 6, py: 2, fontWeight: 800, fontSize: '1.1rem' }}
                    >
                        Upgrade to Pro
                    </Button>
                </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, mb: 6, mt: 4, gap: 3 }}>
                <Box>
                    <Typography variant="h3" fontWeight="800" className="gradient-text" sx={{ mb: 1, letterSpacing: -1 }}>
                        Saved Drafts
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight="500">
                        Finish the reports that you saved as drafts.
                    </Typography>
                </Box>
                <TextField 
                    placeholder="Search pending drafts..." 
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ 
                        width: { xs: '100%', md: 350 }, 
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.6)',
                            backdropFilter: 'blur(10px)',
                            fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }
                    }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#f59e0b' }} /></InputAdornment>,
                    }}
                />
            </Box>

            <Box className="glass-card" sx={{ overflow: 'hidden', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(254, 252, 232, 0.5)' }}>
                                <TableCell sx={{ fontWeight: '800', color: '#b45309', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: '800', color: '#b45309', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: '800', color: '#b45309', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Patient Name</TableCell>
                                <TableCell sx={{ fontWeight: '800', color: '#b45309', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Tests</TableCell>
                                <TableCell sx={{ fontWeight: '800', color: '#b45309', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: '800', color: '#b45309', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <Typography variant="body2" color="text.secondary" fontWeight="600">Loading drafts...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredReports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 15 }}>
                                        <Box sx={{ opacity: 0.3 }}>
                                            <DescriptionIcon sx={{ fontSize: 60, mb: 1 }} />
                                            <Typography variant="h6" fontWeight="700">No drafts found</Typography>
                                            <Typography variant="body2">All reports have been finished.</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReports.map((row) => (
                                    <TableRow 
                                        key={row.id} 
                                        hover 
                                        sx={{ 
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.02) !important' }
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: '800', color: '#d97706' }}>#{row.id}</TableCell>
                                        <TableCell sx={{ fontWeight: '600', color: '#1e293b' }}>
                                            {row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight="800" color="#1e293b">{row.patient_name}</Typography>
                                            <Typography variant="caption" fontWeight="700" color="text.secondary">{row.patient_age} Years • {row.patient_gender}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 250 }}>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {(row.test_names || '').split(',').map((test: string, idx: number) => (
                                                    <Chip 
                                                        key={idx} 
                                                        label={test.trim()} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 18, fontSize: '0.65rem', fontWeight: 700,
                                                            bgcolor: '#fef3c7', color: '#92400e', borderRadius: 1
                                                        }} 
                                                    />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label="DRAFT" 
                                                size="small" 
                                                sx={{ 
                                                    fontWeight: '900', 
                                                    fontSize: '0.65rem',
                                                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                                                    color: '#d97706',
                                                    border: '1px solid rgba(245, 158, 11, 0.2)'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                <Tooltip title="Resume">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleResume(row.id)}
                                                        sx={{ 
                                                            color: '#d97706', 
                                                            bgcolor: 'rgba(245, 158, 11, 0.05)',
                                                            '&:hover': { bgcolor: '#d97706', color: 'white' }
                                                        }}
                                                    >
                                                        <PlayArrowIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Draft">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleDelete(row.id, row.patient_name)}
                                                        sx={{ 
                                                            color: '#ef4444', 
                                                            bgcolor: 'rgba(239, 68, 68, 0.05)',
                                                            '&:hover': { bgcolor: '#ef4444', color: 'white' }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default Drafts;
