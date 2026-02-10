import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';

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

const ReportHistory = () => {
    const navigate = useNavigate();
    const { isPro } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const filteredReports = reports.filter(r => 
        r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.test_names.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.id).includes(searchTerm)
    );

    const displayedReports = isPro ? filteredReports : filteredReports.slice(0, 10);
    const hasMore = !isPro && filteredReports.length > 10;

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await api.getReports();
            console.log('Fetched Reports:', data); // Debug log
            if (Array.isArray(data)) {
                setReports(data);
            } else {
                console.error('API did not return an array:', data);
                setReports([]);
            }
            setLoading(false);
        } catch (e) { 
            console.error('Failed to load reports', e);
            setLoading(false); 
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 0 }, pb: 10 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, mb: 6, mt: 4, gap: 3 }}>
                <Box>
                    <Typography variant="h3" fontWeight="800" className="gradient-text" sx={{ mb: 1, letterSpacing: -1 }}>
                        Report History
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight="500">
                        View and manage all saved reports.
                    </Typography>
                </Box>
                <TextField 
                    placeholder="Search by Patient, ID or Test..." 
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
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6366f1' }} /></InputAdornment>,
                    }}
                />
            </Box>

            <Box className="glass-card" sx={{ overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(241, 245, 249, 0.5)' }}>
                                <TableCell sx={{ fontWeight: '800', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Report ID</TableCell>
                                <TableCell sx={{ fontWeight: '800', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: '800', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Patient Name</TableCell>
                                <TableCell sx={{ fontWeight: '800', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Tests</TableCell>
                                <TableCell sx={{ fontWeight: '800', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: '800', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <Typography variant="body2" color="text.secondary" fontWeight="600">Loading reports...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : displayedReports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 15 }}>
                                        <Box sx={{ opacity: 0.3 }}>
                                            <SearchIcon sx={{ fontSize: 60, mb: 1 }} />
                                            <Typography variant="h6" fontWeight="700">No matching records found</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayedReports.map((row) => (
                                    <TableRow 
                                        key={row.id} 
                                        hover 
                                        sx={{ 
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.02) !important' }
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: '800', color: '#4f46e5' }}>#{row.id}</TableCell>
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
                                                            bgcolor: '#f1f5f9', color: '#64748b', borderRadius: 1
                                                        }} 
                                                    />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.status} 
                                                size="small" 
                                                sx={{ 
                                                    fontWeight: '900', 
                                                    fontSize: '0.65rem',
                                                    bgcolor: row.status === 'FINAL' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: row.status === 'FINAL' ? '#059669' : '#d97706',
                                                    border: row.status === 'FINAL' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => navigate(`/view-report/${row.id}`)}
                                                sx={{ 
                                                    color: '#4f46e5', 
                                                    bgcolor: 'rgba(99, 102, 241, 0.05)',
                                                    '&:hover': { bgcolor: '#4f46e5', color: 'white' }
                                                }}
                                            >
                                                <PrintIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {hasMore && (
                <Box 
                    sx={{ 
                        mt: 4, p: 3, borderRadius: 5, 
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
                        border: '1px dashed rgba(99, 102, 241, 0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <SearchIcon sx={{ color: '#4f46e5' }} />
                        </Box>
                        <Typography variant="body2" fontWeight="700" color="#475569">
                            Showing last 10 reports. Upgrade to Pro to see all reports.
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        size="small" 
                        onClick={() => navigate('/upgrade')}
                        className="premium-button"
                        sx={{ px: 3, py: 1, borderRadius: 2.5, fontWeight: 800 }}
                    >
                        Upgrade to Pro
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default ReportHistory;
