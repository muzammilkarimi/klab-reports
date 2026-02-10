import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';
import { api } from '../api/api';
import type { Report } from '../types';

const PrintReport = () => {
    const { id } = useParams<{ id: string }>();
    const [report, setReport] = useState<Report | null>(null);
    const [settings, setSettings] = useState<any>({
        lab_name: 'kLab Reports',
        address_line1: '123 Health Street',
        address_line2: 'Medical District',
        phone: '(555) 123-4567',
        email: 'reports@klab.com'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const [repData, settData] = await Promise.all([
                        api.getReport(Number(id)),
                        api.getSettings()
                    ]);
                    setReport(repData);
                    if (Object.keys(settData).length > 0) {
                        setSettings((prev: any) => ({ ...prev, ...settData }));
                    }
                } catch (err) {
                    console.error('Failed to load data', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <Typography sx={{ p: 4, textAlign: 'center' }}>Loading Report...</Typography>;
    if (!report) return <Typography sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>Report not found</Typography>;

    return (
        <Box sx={{ 
            bgcolor: 'white', 
            minHeight: '297mm', 
            width: '210mm',
            mx: 'auto',
            color: '#1e293b',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 20px rgba(0,0,0,0.05)',
            '@media print': { 
                boxShadow: 'none',
                p: 0,
                m: 0 
            }
        }}>
            {/* Top Brand Accent Bar */}
            <Box sx={{ height: '6px', bgcolor: '#0d9488', width: '100%' }} />

            <Box sx={{ p: 4, pt: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Custom SVG Microscope Logo */}
                        <Box sx={{ 
                            width: 52, 
                            height: 52, 
                            bgcolor: '#f0fdfa', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid #ccfbf1'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 18h8" />
                                <path d="M3 22h18" />
                                <path d="M14 22a7 7 0 1 0 0-14h-1" />
                                <path d="M9 14h2" />
                                <path d="M9 12a2 2 0 1 1-2-2V6h6v4a2 2 0 1 1-2 2Z" />
                                <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
                            </svg>
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="900" sx={{ color: '#0d9488', letterSpacing: -0.5, lineHeight: 1.1, fontSize: '1.4rem' }}>
                                {settings.lab_name}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', display: 'block', mt: 0.2, fontSize: '0.7rem' }}>
                                {settings.address_line1}, {settings.address_line2}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#0d9488', display: 'flex', gap: 1, mt: 0.2, fontSize: '0.65rem' }}>
                                <span>PH: {settings.phone}</span>
                                <span>•</span>
                                <span>EMAIL: {settings.email}</span>
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: 1.5, display: 'block', fontSize: '0.6rem' }}>
                            ACCREDITED & CERTIFIED
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'block', fontSize: '0.7rem' }}>
                            ISO 9001:2015 CERTIFIED
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.65rem' }}>
                            Reg No: KLAB/2026/088
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography fontWeight="900" sx={{ 
                        letterSpacing: 3, 
                        color: '#1e293b', 
                        bgcolor: '#f8fafc', 
                        display: 'inline-block', 
                        px: 3, 
                        py: 0.8, 
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.85rem'
                    }}>
                        LABORATORY REPORT
                    </Typography>
                </Box>

                {/* Patient Information Box */}
                <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    bgcolor: '#fff',
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: 3
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <DataRow label="PATIENT NAME" value={report.patient_name} highlight />
                        <DataRow label="AGE / GENDER" value={`${report.patient_age} Years / ${report.patient_gender}`} />
                        <DataRow label="REFERRED BY" value={report.referring_doctor || 'Self / General'} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <DataRow label="REPORT ID / BILL" value={report.bill_number || `KLAB-${report.id}`} highlight />
                        <DataRow label="COLLECTION DATE" value={formatDate(report.sample_collection_date)} />
                        <DataRow label="REPORTING DATE" value={formatDate(new Date().toISOString())} />
                    </Box>
                </Box>

                {/* Results Table */}
                <TableContainer component={Box} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#0d9488', '& th': { fontWeight: 900, py: 1.2, color: 'white', fontSize: '0.65rem' } }}>
                                <TableCell>INVESTIGATION</TableCell>
                                <TableCell align="center">RESULT</TableCell>
                                <TableCell align="center">UNITS</TableCell>
                                <TableCell align="center">REF. RANGE</TableCell>
                                <TableCell align="right">STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {report.results?.map((res, index) => {
                                const isAbnormal = res.status !== 'NORMAL';
                                return (
                                    <TableRow key={index} sx={{ 
                                        bgcolor: index % 2 === 0 ? 'white' : '#fcfdfd',
                                        '& td': { py: 1.2, borderBottom: '1px solid #f1f5f9' } 
                                    }}>
                                        <TableCell>
                                            <Typography fontWeight="800" sx={{ color: '#1e293b', fontSize: '0.75rem' }}>
                                                {res.param_name || `Param ${res.parameter_id}`}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.6rem' }}>Method: Automated Analyzers</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography fontWeight="900" sx={{ color: isAbnormal ? '#ef4444' : '#1e293b', fontSize: '0.85rem' }}>
                                                {res.result_value}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography fontWeight="700" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{res.unit || '-'}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography fontWeight="800" color="#334155" sx={{ fontSize: '0.75rem' }}>{res.min_range} - {res.max_range}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ 
                                                display: 'inline-block', 
                                                px: 1, 
                                                py: 0.2, 
                                                borderRadius: '4px', 
                                                bgcolor: isAbnormal ? '#fee2e2' : '#f1f5f9',
                                                color: isAbnormal ? '#ef4444' : '#64748b'
                                            }}>
                                                <Typography variant="caption" fontWeight="900" sx={{ fontSize: '0.6rem' }}>{res.status}</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer Notes */}
                <Box sx={{ mt: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box sx={{ width: 3, height: 12, bgcolor: '#0d9488', borderRadius: 1 }} />
                        <Typography fontWeight="900" color="#334155" sx={{ fontSize: '0.75rem' }}>NOTES & INTERPRETATION</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.6, ml: 1, fontSize: '0.65rem' }}>
                        • Results marked in red are outside the biological reference interval for the specified age and gender.<br />
                        • Clinical correlation is essential for definitive clinical diagnosis. This report is for medical information only.<br />
                        • This is a secure computer-generated report and does not require a physical stamp for validation.
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {/* Flow-based Signature Section */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mt: 4,
                    mb: 6,
                    px: 2
                }}>
                    <Box sx={{ textAlign: 'center', width: 180 }}>
                        <Box sx={{ height: 50, borderBottom: '1px dashed #cbd5e1', mb: 1 }} />
                        <Typography fontWeight="800" sx={{ color: '#334155', fontSize: '0.75rem' }}>CONSULTANT PATHOLOGIST</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.65rem' }}>M.D. (Pathology)</Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center', width: 180 }}>
                        <Box sx={{ height: 50, borderBottom: '1px dashed #cbd5e1', mb: 1 }} />
                        <Typography fontWeight="800" sx={{ color: '#334155', fontSize: '0.75rem' }}>LAB TECHNICIAN</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.65rem' }}>DMLT / B.Sc MLT</Typography>
                    </Box>
                </Box>

                {/* Footer Barcode placeholder and End of Report */}
                <Box sx={{ width: '100%', mt: 'auto' }}>
                    <Divider sx={{ mb: 1.5, borderColor: '#f1f5f9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {[...Array(15)].map((_, i) => (
                                <Box key={i} sx={{ width: Math.random() * 2 + 1, height: 16, bgcolor: '#e2e8f0' }} />
                            ))}
                        </Box>
                        <Typography variant="caption" color="#cbd5e1" fontWeight="900" letterSpacing={3} sx={{ fontSize: '0.6rem' }}>
                            *** END OF REPORT ***
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.6rem' }}>
                            Page 1 of 1
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

const DataRow = ({ label, value, highlight }: { label: string, value: any, highlight?: boolean }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #f8fafc', pb: 0.3 }}>
        <Typography variant="caption" sx={{ width: 100, color: '#94a3b8', fontWeight: 800, pt: 0.2, fontSize: '0.65rem' }}>{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 800, color: highlight ? '#0d9488' : '#334155', fontSize: '0.75rem' }}>{value || '-'}</Typography>
    </Box>
);

const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true 
        });
    } catch {
        return dateStr;
    }
};

export default PrintReport;
