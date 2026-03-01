import { useEffect, useState, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Paper } from '@mui/material';
import { api } from '../api/api';
import type { Report, Settings as SettingsType } from '../types';

const PrintReport = () => {
    const { id } = useParams<{ id: string }>();
    const [report, setReport] = useState<Report | null>(null);
    const [settings, setSettings] = useState<SettingsType>({
        lab_name: 'kLab Reports',
        address_line1: '123 Health Street',
        address_line2: 'Medical District',
        phone: '(555) 123-4567',
        email: 'reports@klab.com',
        website: 'www.klab.com'
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
                        setSettings((prev: SettingsType) => ({ ...prev, ...settData }));
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

    const groupedResults = report.results?.filter((res) => {
        // Exclude results that are gender specific and don't match the patient's gender
        if (res.gender_specific === 1 && report.patient_gender.toLowerCase() !== 'male') return false;
        if (res.gender_specific === 2 && report.patient_gender.toLowerCase() !== 'female') return false;
        return true;
    }).reduce((acc, res) => {
        const testName = res.test_name || 'General';
        if (!acc[testName]) acc[testName] = [];
        acc[testName].push(res);
        return acc;
    }, {} as Record<string, typeof report.results>) || {};

    // Advanced slot-based pagination
    type RenderItem = 
        | { type: 'header', testName: string }
        | { type: 'header-continued', testName: string }
        | { type: 'row', result: NonNullable<Report['results']>[0] };

    const allItems: RenderItem[] = [];
    Object.entries(groupedResults).forEach(([testName, testResults]) => {
        allItems.push({ type: 'header', testName });
        testResults.forEach(res => {
            allItems.push({ type: 'row', result: res });
        });
    });

    const chunkedPages: RenderItem[][] = [];
    let currentPage: RenderItem[] = [];
    
    // Adjusted points budget: Page 1 has full header, Page N has compact header
    const PAGE_1_MAX_POINTS = 28; 
    const PAGE_N_MAX_POINTS = 36; 
    let currentPoints = 0;

    for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];
        const itemPoints = item.type === 'row' ? 1 : 1.5;
        
        const isFirstPage = chunkedPages.length === 0;
        const maxPoints = isFirstPage ? PAGE_1_MAX_POINTS : PAGE_N_MAX_POINTS;
        
        let shouldBreak = (currentPoints + itemPoints) > maxPoints;
        
        // Don't leave an orphan header at the absolute bottom
        if (item.type === 'header' && (currentPoints + itemPoints + 1.2) > maxPoints) {
            shouldBreak = true;
        }
        
        // If it's the very last item, make sure we have room for signatures!
        const isLastItem = (i === allItems.length - 1);
        if (isLastItem) {
             if ((currentPoints + itemPoints + 5) > maxPoints) {
                 shouldBreak = true;
             }
        }
        
        if (shouldBreak && currentPage.length > 0) {
            chunkedPages.push(currentPage);
            currentPage = [];
            currentPoints = 0;
            
            if (item.type === 'row') {
                let lastHeader = 'General';
                for (let j = i - 1; j >= 0; j--) {
                    if (allItems[j].type === 'header' || allItems[j].type === 'header-continued') {
                        lastHeader = (allItems[j] as any).testName;
                        break;
                    }
                }
                currentPage.push({ type: 'header-continued', testName: lastHeader });
                currentPoints += 1.5;
            }
        }
        
        currentPage.push(item);
        currentPoints += itemPoints;
    }

    if (currentPage.length > 0) {
        chunkedPages.push(currentPage);
    }
    if (chunkedPages.length === 0) {
        chunkedPages.push([]);
    }

    return (
        <Fragment>
            {chunkedPages.map((pageItems, pageIndex) => {
                const isLastPage = pageIndex === chunkedPages.length - 1;
                
                return (
                    <Paper key={pageIndex} className="a4-page-container" sx={{ 
                        bgcolor: 'white', 
                        minHeight: '297mm', // allow expansion if slightly miscalculated
                        width: '210mm',
                        mx: 'auto',
                        color: '#1e293b',
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                        p: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        mb: 6,
                        position: 'relative',
                        boxSizing: 'border-box',
                        '@media print': { 
                            backgroundColor: 'transparent !important',
                            minHeight: 'auto', // let browser print engine handle exact bounds natively
                            height: 'auto',
                            boxShadow: 'none',
                            borderRadius: 0,
                            border: 'none',
                            p: 0,
                            m: 0,
                            mb: 0,
                            pageBreakInside: 'avoid',
                            pageBreakAfter: isLastPage ? 'auto' : 'always'
                        }
                    }}>
                        {/* Top Brand Accent Bar */}
                        <Box sx={{ height: '6px', bgcolor: '#0d9488', width: '100%', flexShrink: 0 }} />

                        <Box sx={{ p: 3, pt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Header Section */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 4 }}>
                                {/* Left Icon - Microscope (Improved) */}
                                <Box sx={{ 
                                    width: 68, height: 68, 
                                    borderRadius: '18px', 
                                    background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                    border: '2px solid rgba(255,255,255,0.15)'
                                }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 18h8" />
                                        <path d="M3 22h18" />
                                        <path d="M14 22a7 7 0 1 0 0-14h-1" />
                                        <path d="M9 14h2" />
                                        <path d="M9 12a2 2 0 1 1-2-2V6h6v4a2 2 0 1 1-2 2Z" />
                                        <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
                                    </svg>
                                </Box>

                                {/* Center Text */}
                                <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
                                    <Typography variant="h3" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1, mb: 0.8, fontSize: '1.75rem' }}>
                                        {settings.lab_name}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
                                        {settings.address_line1}, {settings.address_line2}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0d9488', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.87.36 1.72.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c1.09.34 1.94.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                            {settings.phone}
                                        </Typography>
                                        <Typography sx={{ color: '#cbd5e1', fontWeight: 900 }}>•</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0d9488', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                            {settings.email}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Right Icon - Lab Flask (Symmetric Bold) */}
                                <Box sx={{ 
                                    width: 68, height: 68, 
                                    borderRadius: '18px', 
                                    background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                    border: '2px solid rgba(255,255,255,0.15)'
                                }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 3h6" />
                                        <path d="M10 3v7L6 19c-.6 1.3.2 2 1.4 2h10.4c1.2 0 2-.7 1.4-2l-4-9V3h-4Z" />
                                        <path d="M8.5 15h7" />
                                        <path d="M12 18h.01" />
                                    </svg>
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
                            {pageIndex === 0 ? (
                                <Box sx={{ 
                                    mb: 2, 
                                    p: 1.5, 
                                    borderRadius: '8px', 
                                    border: '1px solid #e2e8f0',
                                    bgcolor: '#fff',
                                    display: 'grid',
                                    gridTemplateColumns: '1.2fr 1fr',
                                    gap: 3
                                }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <DataRow label="PATIENT NAME" value={report.patient_name} highlight />
                                        <DataRow label="REFERRED BY" value={report.referring_doctor || 'Self / General'} />
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <DataRow label="AGE / GENDER" value={`${report.patient_age} Years / ${report.patient_gender}`} />
                                        <DataRow label="DATE" value={formatDate(report.sample_collection_date)} />
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ 
                                    mb: 2, 
                                    pb: 0.5,
                                    borderBottom: '2px solid #0d9488',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                        Patient: <span style={{ color: '#0d9488' }}>{report.patient_name}</span>
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155' }}>
                                        Age/Gender: {report.patient_age}/{report.patient_gender?.charAt(0)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155' }}>
                                        Date: {formatDate(report.sample_collection_date)}
                                    </Typography>
                                </Box>
                            )}

                            {/* Results Table */}
                            <TableContainer component={Box} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#0d9488', '& th': { fontWeight: 900, py: 0.8, color: 'white', fontSize: '0.6rem' } }}>
                                            <TableCell>INVESTIGATION</TableCell>
                                            <TableCell align="center">RESULT</TableCell>
                                            <TableCell align="center">UNITS</TableCell>
                                            <TableCell align="center">REF. RANGE</TableCell>
                                            <TableCell align="right">STATUS</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pageItems.map((item, itemIndex) => {
                                            if (item.type === 'header' || item.type === 'header-continued') {
                                                return (
                                                    <TableRow key={`hdr-${itemIndex}`} sx={{ bgcolor: '#f1f5f9', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                                        <TableCell colSpan={5} sx={{ py: 0.5, borderBottom: '1px solid #e2e8f0' }}>
                                                            <Typography fontWeight="900" sx={{ color: '#0d9488', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                                                                {item.testName.toUpperCase()} {item.type === 'header-continued' ? '(CONTINUED)' : ''}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            } else {
                                                const res = item.result;
                                                const isAbnormal = res.status !== 'NORMAL';
                                                return (
                                                    <TableRow key={`row-${itemIndex}`} sx={{ 
                                                        bgcolor: itemIndex % 2 === 0 ? 'white' : '#fcfdfd',
                                                        breakInside: 'avoid',
                                                        pageBreakInside: 'avoid',
                                                        '& td': { py: 0.5, borderBottom: '1px solid #f1f5f9' } 
                                                    }}>
                                                        <TableCell>
                                                            <Typography fontWeight="800" sx={{ color: '#1e293b', fontSize: '0.75rem' }}>
                                                                {res.param_name || `Param ${res.parameter_id}`}
                                                            </Typography>
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
                                            }
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Footer Notes */}
                            {isLastPage && (
                                <Box sx={{ mt: 1.5, mb: 1 }}>
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
                            )}

                            <Box sx={{ flexGrow: 1 }} />

                            {/* Flow-based Signature Section */}
                            {isLastPage && (
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    mt: 1,
                                    mb: 2,
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
                            )}

                            {/* Footer Barcode placeholder and End of Report */}
                            <Box sx={{ width: '100%', mt: 'auto', flexShrink: 0 }}>
                                <Divider sx={{ mb: 1.5, borderColor: '#f1f5f9' }} />
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 2 }}>
                                    
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                );
            })}
        </Fragment>
    );
};

const DataRow = ({ label, value, highlight }: { label: string, value: string | number | undefined, highlight?: boolean }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #f8fafc', pb: 0.3 }}>
        <Typography variant="caption" sx={{ width: 100, color: '#94a3b8', fontWeight: 800, pt: 0.2, fontSize: '0.65rem' }}>{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 800, color: highlight ? '#0d9488' : '#334155', fontSize: '0.75rem' }}>{value || '-'}</Typography>
    </Box>
);

const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch {
        return dateStr;
    }
};

export default PrintReport;
