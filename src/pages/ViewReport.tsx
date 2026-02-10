import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, AppBar, Toolbar, Typography, IconButton, Paper, Container, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import PrintReport from './PrintReport';
import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import CircularProgress from '@mui/material/CircularProgress';
import { api } from '../api/api';

const ViewReport = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { showToast } = useNotification();
    const [generating, setGenerating] = useState(false);
    const [patientName, setPatientName] = useState('');

    useEffect(() => {
        const fetchPatientInfo = async () => {
            if (id) {
                try {
                    const report = await api.getReport(Number(id));
                    setPatientName(report.patient_name || 'Patient');
                } catch (e) {
                    console.error('Failed to fetch patient name for filename', e);
                }
            }
        };
        fetchPatientInfo();
    }, [id]);

    const handleSavePDF = async () => {
        if (id) {
            try {
                if (window.electron && window.electron.printReport) {
                    setGenerating(true);
                    showToast('Generating PDF...', 'info');
                    
                    const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
                    const suggestedName = `${patientName.replace(/\s+/g, '_')}_${dateStr}`;
                    
                    const result = await window.electron.printReport(Number(id), suggestedName);
                    if (result && result.success) {
                        showToast('PDF saved successfully!', 'success');
                    }
                } else {
                    showToast('PDF saving not available in this environment', 'warning');
                }
            } catch (error) {
                console.error('Save PDF failed:', error);
                showToast('Failed to save PDF: ' + (error instanceof Error ? error.message : String(error)), 'error');
            } finally {
                setGenerating(false);
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: '#f8fafc', // Light slate background for app consistency
            color: '#1e293b'
        }}>
            {/* Action Toolbar */}
            <AppBar 
                position="sticky" 
                elevation={0} 
                sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    color: '#1e293b',
                    '@media print': { display: 'none' }
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ px: '0 !important', py: 1 }}>
                        <IconButton 
                            onClick={() => navigate(-1)} 
                            sx={{ mr: 2, color: '#1e293b', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: -0.5, color: '#1e293b' }}>
                                Print Preview
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                ID: #{id} • {patientName}
                            </Typography>
                        </Box>
                        
                        <Stack direction="row" spacing={2}>
                            <Button 
                                variant="outlined" 
                                startIcon={<PrintIcon />} 
                                onClick={handlePrint}
                                sx={{ 
                                    borderRadius: 3, px: 3, fontWeight: 700, 
                                    color: '#475569', borderColor: '#e2e8f0',
                                    '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                                }}
                            >
                                Print
                            </Button>
                            <Button 
                                variant="contained" 
                                startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
                                onClick={handleSavePDF}
                                disabled={generating}
                                className="premium-button"
                                sx={{ px: 4, py: 1, borderRadius: 3, fontWeight: 800 }}
                            >
                                {generating ? 'Saving...' : 'Save PDF'}
                            </Button>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Preview Container */}
            <Box sx={{ 
                flexGrow: 1, 
                p: { xs: 2, md: 6 }, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                overflow: 'auto',
                '@media print': { p: 0, bgcolor: 'white', overflow: 'visible' }
            }}>
                <Paper sx={{ 
                    width: '210mm', 
                    minHeight: '297mm',
                    bgcolor: 'white',
                    color: '#1e293b',
                    borderRadius: 2,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', // Softer shadow for light mode
                    overflow: 'hidden',
                    transform: { xs: 'scale(0.4)', sm: 'scale(0.6)', md: 'scale(0.8)', lg: 'scale(1)' },
                    transformOrigin: 'top center',
                    mb: 10,
                    '@media print': {
                        transform: 'none',
                        boxShadow: 'none',
                        borderRadius: 0,
                        margin: 0
                    }
                }}>
                    <PrintReport />
                </Paper>
            </Box>
        </Box>
    );
};

export default ViewReport;
