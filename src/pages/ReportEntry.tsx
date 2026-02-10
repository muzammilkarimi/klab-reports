import { 
    Box, TextField, Typography, MenuItem, Chip, Button, 
    InputAdornment, ToggleButtonGroup, ToggleButton,
    Autocomplete, CircularProgress, Tooltip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import ScienceIcon from '@mui/icons-material/Science';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/api';
import type { TestParameter } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import WarningIcon from '@mui/icons-material/Warning';
import { Alert, AlertTitle } from '@mui/material';

interface Test {
    id: number;
    test_name: string;
    price: number;
}

const ReportEntry = () => {
    const navigate = useNavigate();
    const { isPro, monthlyUsage, usageLimit, refreshLicense } = useAuth();
    const { showToast, showConfirm } = useNotification();
    // State
    const [tests, setTests] = useState<Test[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
    const [patient, setPatient] = useState({ name: '', age: '', gender: '', phone: '' });
    const [existingPatientId, setExistingPatientId] = useState<number | null>(null);
    
    // New PRD fields
    const [referringDoctor, setReferringDoctor] = useState('');
    const [sampleCollectionDate, setSampleCollectionDate] = useState(
        new Date().toLocaleDateString('sv').split(' ')[0] // Today's date in local YYYY-MM-DD format
    );
    const [billNumber, setBillNumber] = useState('');
    
    // Results State
    const [parameters, setParameters] = useState<TestParameter[]>([]);
    const [results, setResults] = useState<Record<number, string>>({});
    const [saving, setSaving] = useState(false);

    // Load tests and patients on mount
    useEffect(() => {
        api.getTests()
            .then(data => setTests(data))
            .catch(err => console.error('Error fetching tests:', err));

        setLoadingPatients(true);
        api.getPatients()
            .then(data => setPatients(data))
            .catch(err => console.error('Error fetching patients:', err))
            .finally(() => setLoadingPatients(false));
            
        // Suggest next bill number if not in draft mode
        if (!draftId) {
            api.getNextBillNumber()
                .then(data => {
                    if (data.nextBillNumber) setBillNumber(data.nextBillNumber);
                })
                .catch(err => console.error('Error fetching next bill number:', err));
        }
    }, []);

    // Load draft data if draft ID is present in URL
    const [searchParams] = useSearchParams();
    const draftId = searchParams.get('draft');

    useEffect(() => {
        if (draftId) {
            loadDraftData(Number(draftId));
        }
    }, [draftId]);

    const loadDraftData = async (id: number) => {
        try {
            const report = await api.getReport(id);
            // Pre-fill patient info
            setPatient({
                name: report.patient_name || '',
                age: String(report.patient_age || ''),
                gender: report.patient_gender || '',
                phone: report.patient_phone || ''
            });
            setExistingPatientId(report.patient_id);

            // Pre-fill new PRD fields
            setReferringDoctor(report.referring_doctor || '');
            setSampleCollectionDate(report.sample_collection_date ? report.sample_collection_date.split('T')[0] : new Date().toLocaleDateString('sv'));
            setBillNumber(report.bill_number || '');
            
            // Pre-fill test selection and results if available
            if (report.results && report.results.length > 0) {
                // Use test_id which we now return from the backend
                const testIds = [...new Set(report.results.map((r: any) => r.test_id))].filter(Boolean);
                setSelectedTestIds(testIds as number[]);
                
                const resultsMap: Record<number, string> = {};
                report.results.forEach((r: any) => {
                    if (r.parameter_id && r.result_value) {
                        resultsMap[r.parameter_id] = r.result_value;
                    }
                });
                setResults(resultsMap);
            }
        } catch (error) {
            console.error('Failed to load draft:', error);
            showToast('Failed to load draft data', 'error');
        }
    };

    const [loadingParams, setLoadingParams] = useState(false);

    // Load parameters when tests change
    useEffect(() => {
        const fetchParams = async () => {
            setLoadingParams(true);
            try {
                // Fetch all parameters in parallel
                const paramPromises = selectedTestIds.map(testId => 
                    api.getTestParameters(testId).catch(e => {
                        console.error(`Failed to load params for test ${testId}`, e);
                        return [];
                    })
                );
                const results = await Promise.all(paramPromises);
                const allParams = results.flat();
                setParameters(allParams);
            } finally {
                setLoadingParams(false);
            }
        };

        if (selectedTestIds.length > 0) {
            fetchParams();
        } else {
            setParameters([]);
        }
    }, [selectedTestIds]);

    // Unsaved changes guard
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (Object.keys(results).length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [results]);


    const handleResultChange = (paramId: number, value: string) => {
        setResults(prev => ({ ...prev, [paramId]: value }));
    };

    const calculateStatus = (value: string, param: TestParameter): 'LOW' | 'NORMAL' | 'HIGH' => {
        const numVal = parseFloat(value);
        if (isNaN(numVal)) return 'NORMAL';
        if (numVal < param.min_range) return 'LOW';
        if (numVal > param.max_range) return 'HIGH';
        return 'NORMAL';
    };

    const limitReached = !isPro && monthlyUsage >= usageLimit;

    const isFormValidForFinal = () => {
        // 1. Patient Info Check
        const patientFieldsOk = patient.name && patient.age && patient.gender && referringDoctor && billNumber;
        if (!patientFieldsOk) return { valid: false, reason: 'Please fill all patient and registry details.' };

        // 2. Tests Check
        if (selectedTestIds.length === 0) return { valid: false, reason: 'Please select at least one test.' };

        // 3. Results Check
        const allResultsFilled = parameters.length > 0 && parameters.every(p => results[p.id] && String(results[p.id]).trim() !== '');
        if (!allResultsFilled) return { valid: false, reason: 'Please fill all test result fields.' };

        return { valid: true };
    };

    const handleSave = async (status: 'DRAFT' | 'FINAL') => {
        if (status === 'FINAL' && limitReached) {
            showToast('Monthly report limit reached for Free Tier. Please upgrade to Pro.', 'warning');
            return;
        }
        
        const validation = status === 'FINAL' ? isFormValidForFinal() : { valid: !!patient.name, reason: 'Please enter at least the patient name.' };
        
        if (!validation.valid) {
            showToast(validation.reason || 'Form is incomplete.', 'info');
            return;
        }

        try {
            setSaving(true);
            // 1. Create or link patient
            let patientId = existingPatientId;
            
            // If patient name changed or we don't have an ID, look up or create
            const patientRes = await api.createPatient({
                name: patient.name,
                age: Number(patient.age) || 0,
                gender: patient.gender,
                phone: patient.phone
            });
            patientId = patientRes.id;
            
            // 2. Prepare report data
            const reportResults = parameters.map(p => {
                const val = results[p.id] || '';
                return {
                    parameter_id: p.id,
                    result_value: val,
                    status: calculateStatus(val, p),
                    remarks: '' 
                };
            });

            const reportData = {
                patient_id: patientId,
                test_ids: selectedTestIds,
                total_amount: tests.filter(t => selectedTestIds.includes(t.id)).reduce((sum, t) => sum + t.price, 0),
                status: status,
                results: reportResults,
                referring_doctor: referringDoctor,
                sample_collection_date: sampleCollectionDate,
                bill_number: billNumber
            };

            let reportRes;
            if (draftId) {
                // Update existing report
                reportRes = await api.updateReport(Number(draftId), reportData);
            } else {
                // Create new report
                reportRes = await api.saveReport(reportData);
            }

            if (reportRes.success) {
                showToast(`Report ${draftId ? 'updated' : 'saved'} as ${status}!`);
                await refreshLicense(); // Update usage count

                if (status === 'FINAL') {
                    // 1. Reset and navigate on final
                    setPatient({ name: '', age: '', gender: '', phone: '' });
                    setExistingPatientId(null);
                    setSelectedTestIds([]);
                    setResults({});
                    setParameters([]);
                    setBillNumber('');

                    // 2. Clear URL draft parameter
                    if (draftId) {
                        navigate('/new-report', { replace: true });
                    }

                    showConfirm(
                        'Print Report',
                        'Do you want to preview and print this report now?',
                        () => navigate(`/view-report/${reportRes.report_id}`)
                    );
                }
            }
        } catch (error: any) {
            console.error('Save failed:', error);
            if (error?.status === 403) {
                showToast(error.message || 'Monthly limit reached. Please upgrade to Pro.', 'error');
            } else {
                showToast('Failed to save report: ' + (error instanceof Error ? error.message : String(error)), 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    // Group parameters by Test ID for the Accordion UI
    const paramsByTest = selectedTestIds.reduce((acc, testId) => {
        const test = tests.find(t => t.id === testId);
        if (test) {
            acc[test.id] = {
                testName: test.test_name,
                params: parameters.filter(p => p.test_id === test.id)
            };
        }
        return acc;
    }, {} as Record<number, { testName: string, params: TestParameter[] }>);

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 15, px: { xs: 2, md: 0 } }}>
            <Box sx={{ mb: 6, mt: 4 }}>
                <Typography variant="h3" fontWeight="800" className="gradient-text" sx={{ mb: 1, letterSpacing: -1 }}>
                    Create Medical Report
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight="500">
                    Enter patient info and test results.
                </Typography>
            </Box>

            {loadingParams && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, p: 2, borderRadius: 4, bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
                    <CircularProgress size={20} thickness={6} sx={{ color: '#6366f1' }} />
                    <Typography sx={{ ml: 2, fontWeight: 600, color: '#4f46e5' }}>Loading test details...</Typography>
                </Box>
            )}

            {limitReached && (
                <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 4, borderRadius: 6, border: '1px solid rgba(255, 171, 0, 0.2)', bgcolor: 'rgba(255, 171, 0, 0.05)' }}>
                    <AlertTitle sx={{ fontWeight: '800' }}>Monthly Limit Warning</AlertTitle>
                    You have reached the monthly limit of {usageLimit} reports. 
                    Upgrade to <strong>PRO</strong> for unlimited reports.
                </Alert>
            )}

            {/* Section A: Patient Info */}
            <Box className="glass-card" sx={{ p: { xs: 3, md: 5 }, mb: 4, bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ 
                        width: 48, height: 48, borderRadius: '16px', 
                        background: 'var(--primary-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>
                        <PersonIcon />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight="900" color="#1e293b">Patient Info</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">Enter new patient or search existing ones.</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1.2fr 1.8fr' }, gap: 4 }}>
                    <Box>
                        <Autocomplete
                            freeSolo
                            options={patients.slice(0, 50)}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                            loading={loadingPatients}
                            value={patient.name}
                            onInputChange={(_, newValue) => {
                                setPatient({ ...patient, name: newValue });
                                if (!newValue) setExistingPatientId(null);
                            }}
                            onChange={(_, newValue: any) => {
                                if (newValue && typeof newValue !== 'string') {
                                    setPatient({
                                        name: newValue.name,
                                        age: String(newValue.age || ''),
                                        gender: newValue.gender || '',
                                        phone: newValue.phone || ''
                                    });
                                    setExistingPatientId(newValue.id);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    label="Patient Full Name"
                                    variant="outlined"
                                    sx={{ '& .MuiInputLabel-root': { color: '#64748b', fontWeight: 600 } }}
                                    InputProps={{
                                        ...params.InputProps,
                                        sx: { 
                                            borderRadius: 3, 
                                            bgcolor: '#f8fafc',
                                            color: '#1e293b',
                                            fontWeight: 700, 
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1', borderWidth: '1.5px' }, 
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5', borderWidth: '2px' }
                                        },
                                        endAdornment: (
                                            <>
                                                {loadingPatients ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Box>
                    <Box>
                        <TextField 
                            fullWidth label="Age" type="number" variant="outlined" 
                            value={patient.age}
                            onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                            sx={{ '& .MuiInputLabel-root': { color: '#64748b', fontWeight: 600 } }}
                            InputProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc', color: '#1e293b', fontWeight: 700, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1', borderWidth: '1.5px' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' } } }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <ToggleButtonGroup
                            value={patient.gender}
                            exclusive
                            onChange={(_, newValue) => {
                                if (newValue !== null) {
                                    setPatient({ ...patient, gender: newValue });
                                }
                            }}
                            fullWidth
                            sx={{ 
                                gap: 1,
                                '& .MuiToggleButton-root': {
                                    border: '1px solid #cbd5e1 !important',
                                    borderRadius: '12px !important',
                                    bgcolor: '#f1f5f9',
                                    fontWeight: 700,
                                    color: '#475569',
                                    textTransform: 'none',
                                    transition: 'all 0.2s',
                                    '&.Mui-selected': {
                                        background: 'var(--primary-gradient)',
                                        color: 'white',
                                        borderColor: 'transparent !important',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                                    },
                                    '&:hover': {
                                        bgcolor: '#cbd5e1'
                                    }
                                },
                                height: 56 // Match standard TextField height
                            }}
                        >
                            <ToggleButton value="Male">Male</ToggleButton>
                            <ToggleButton value="Female">Female</ToggleButton>
                            <ToggleButton value="Other">Other</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                {/* Second row: Registry Details */}
                <Box sx={{ mt: 4, pt: 4, borderTop: '1px dashed #e2e8f0' }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
                        <TextField 
                            fullWidth 
                            label="Referring Clinician" 
                            variant="outlined" 
                            value={referringDoctor} 
                            onChange={(e) => setReferringDoctor(e.target.value)}
                            placeholder="Dr. Smith"
                            sx={{ '& .MuiInputLabel-root': { color: '#64748b', fontWeight: 600 } }}
                            InputProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc', color: '#1e293b', fontWeight: 700, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1', borderWidth: '1.5px' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' } } }}
                        />

                        <TextField 
                            fullWidth 
                            label="Collection Date" 
                            type="date"
                            variant="outlined" 
                            value={sampleCollectionDate} 
                            onChange={(e) => setSampleCollectionDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiInputLabel-root': { color: '#64748b', fontWeight: 600 } }}
                            InputProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc', color: '#1e293b', fontWeight: 700, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1', borderWidth: '1.5px' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' } } }}
                        />

                        <TextField 
                            fullWidth 
                            label="Invoice/Bill #" 
                            variant="outlined" 
                            value={billNumber} 
                            onChange={(e) => setBillNumber(e.target.value)}
                            sx={{ '& .MuiInputLabel-root': { color: '#64748b', fontWeight: 600 } }}
                            InputProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc', color: '#1e293b', fontWeight: 700, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1', borderWidth: '1.5px' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' } } }}
                        />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                        <TextField 
                            fullWidth 
                            label="Contact Number" 
                            variant="outlined" 
                            value={patient.phone}
                            onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            sx={{ '& .MuiInputLabel-root': { color: '#64748b', fontWeight: 600 } }}
                            InputProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc', color: '#1e293b', fontWeight: 700, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1', borderWidth: '1.5px' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' } } }}
                        />
                    </Box>
                </Box>
            </Box>

            
            {/* Section B: Test Selection */}
            <Box className="glass-card" sx={{ p: { xs: 3, md: 5 }, mb: 6, bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ 
                        width: 48, height: 48, borderRadius: '16px', 
                        background: 'var(--secondary-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}>
                        <ScienceIcon />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight="900" color="#1e293b">Select Tests</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">Choose the tests for this report.</Typography>
                    </Box>
                </Box>
                 <Autocomplete
                    multiple
                    options={tests}
                    getOptionLabel={(option) => option.test_name}
                    value={tests.filter(t => selectedTestIds.includes(t.id))}
                    onChange={(_, newValue) => {
                        setSelectedTestIds(newValue.map(t => t.id));
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search or Select Tests"
                            placeholder="Add more tests..."
                            sx={{ 
                                borderRadius: 4, 
                                bgcolor: '#f8fafc', 
                                '& .MuiInputLabel-root': { color: '#64748b', fontWeight: 600 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 4,
                                    color: '#1e293b',
                                    '& fieldset': { borderColor: '#cbd5e1', borderWidth: '1.5px' },
                                    '&:hover fieldset': { borderColor: '#6366f1' }
                                }
                            }}
                        />
                    )}
                    renderOption={(props, option: Test) => (
                        <MenuItem {...props} key={option.id} sx={{ py: 1.5, px: 2, borderRadius: 2, mx: 1, mb: 0.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <Typography fontWeight="600">{option.test_name}</Typography>
                                <Typography variant="caption" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1.5, fontWeight: 700, color: '#64748b' }}>
                                    ₹{option.price.toFixed(2)}
                                </Typography>
                            </Box>
                        </MenuItem>
                    )}
                    renderTags={(value: Test[], getTagProps) =>
                        value.map((option: Test, index: number) => (
                            <Chip
                                label={option.test_name}
                                {...getTagProps({ index })}
                                key={option.id}
                                sx={{ 
                                    bgcolor: 'rgba(99, 102, 241, 0.1)', 
                                    color: '#4f46e5',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    border: '1px solid rgba(99, 102, 241, 0.2)'
                                }} 
                            />
                        ))
                    }
                />
                
                {selectedTestIds.length > 0 && (
                    <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {selectedTestIds.map((testId) => {
                            const test = tests.find(t => t.id === testId);
                            return test ? (
                                <Chip
                                    key={testId}
                                    label={test.test_name}
                                    onDelete={() => {
                                        setSelectedTestIds(prev => prev.filter(id => id !== testId));
                                    }}
                                    sx={{ 
                                        px: 1, height: 40,
                                        borderRadius: 3,
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        fontWeight: 800,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        '& .MuiChip-deleteIcon': { color: '#ef4444' }
                                    }}
                                />
                            ) : null;
                        })}
                    </Box>
                )}
            </Box>

            {/* Section C: Results Entry */}
            {selectedTestIds.length > 0 && (
                <Box sx={{ mb: 10 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Box sx={{ 
                            width: 40, height: 40, borderRadius: '12px', 
                            background: '#f8fafc',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#4f46e5', border: '1px solid #e2e8f0'
                        }}>
                            <DescriptionIcon fontSize="small" />
                        </Box>
                        <Typography variant="h5" fontWeight="900" color="#1e293b">Enter Results</Typography>
                    </Box>

                    {Object.entries(paramsByTest).map(([testId, { testName, params }]) => (
                        <Box key={testId} sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" fontWeight="900" sx={{ mb: 2, ml: 1, color: '#1e293b' }}>
                                {testName} Test
                            </Typography>
                            <Box className="glass-card" sx={{ p: 4, bgcolor: '#f1f5f9', border: '1.5px solid #e2e8f0' }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
                                    {params.map((param) => {
                                        const val = results[param.id] || '';
                                        const status = calculateStatus(val, param);
                                        const isAbnormal = status !== 'NORMAL';
                                        
                                        return (
                                            <Box key={param.id}>
                                                <TextField 
                                                    fullWidth
                                                    label={param.param_name}
                                                    value={val}
                                                    onChange={(e) => handleResultChange(param.id, e.target.value)}
                                                    helperText={`${param.min_range} - ${param.max_range} ${param.unit}`}
                                                    error={isAbnormal}
                                                    sx={{ 
                                                        '& .MuiInputLabel-root': { color: '#64748b', fontWeight: 700 },
                                                        '& .MuiFormHelperText-root': { color: '#4b5563', fontWeight: 700 }
                                                    }}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end" sx={{ fontWeight: 700, color: 'text.disabled' }}>{param.unit}</InputAdornment>,
                                                        sx: { 
                                                            borderRadius: 3, 
                                                            bgcolor: isAbnormal ? 'rgba(239, 68, 68, 0.05)' : 'white',
                                                            color: '#1e293b',
                                                            fontWeight: 700,
                                                            '& fieldset': { borderColor: isAbnormal ? '#ef4444' : '#cbd5e1', borderWidth: '1.5px' },
                                                            '&:hover fieldset': { borderColor: isAbnormal ? '#dc2626' : '#6366f1' },
                                                            '&.Mui-focused fieldset': { borderColor: isAbnormal ? '#dc2626' : '#4f46e5', borderWidth: '2px' }
                                                        }
                                                    }}
                                                />
                                                {isAbnormal && (
                                                    <Box sx={{ 
                                                        mt: 1, px: 2, py: 0.5, borderRadius: 2, 
                                                        display: 'inline-flex', alignItems: 'center', gap: 1,
                                                        bgcolor: '#ef4444', color: 'white',
                                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                                                    }}>
                                                        <Typography variant="caption" fontWeight="900">
                                                            {status === 'HIGH' ? 'HIGH ↑' : 'LOW ↓'}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Sticky Action Bar */}
            <Box sx={{ 
                position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
                width: { xs: '90%', sm: '600px', md: '800px' },
                p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 3,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '30px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.4)',
                zIndex: 2000,
                ml: { sm: '120px' } // Adjust for sidebar offset if needed, but centering usually works best
            }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">TOTAL PRICE</Typography>
                    <Typography variant="h6" fontWeight="900" sx={{ color: '#1e293b' }}>
                        ₹{tests.filter(t => selectedTestIds.includes(t.id)).reduce((sum, t) => sum + t.price, 0).toFixed(2)}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Tooltip title={!isPro ? "Draft management is a Pro feature" : ""}>
                        <span>
                            <Button 
                                variant="outlined" 
                                startIcon={<SaveIcon />}
                                onClick={() => handleSave('DRAFT')}
                                disabled={saving || !isPro}
                                sx={{ px: 4, borderRadius: 4, fontWeight: 700, border: '2px solid' }}
                            >
                                Save as Draft
                            </Button>
                        </span>
                    </Tooltip>
                    
                    <Tooltip title={limitReached ? "Monthly limit reached (30/30). Upgrade to Pro for unlimited access." : ""}>
                        <span>
                            <Button 
                                variant="contained" 
                                startIcon={<DescriptionIcon />}
                                onClick={() => handleSave('FINAL')}
                                    className={!isFormValidForFinal().valid ? "" : "premium-button"}
                                    color={!isFormValidForFinal().valid ? "inherit" : "primary"}
                                    sx={{ 
                                        px: 5, py: 1.5, fontWeight: 800,
                                        borderRadius: 4,
                                        textTransform: 'none',
                                        boxShadow: !isFormValidForFinal().valid ? 'none' : undefined
                                    }}
                                    disabled={saving || limitReached || !isFormValidForFinal().valid}
                                >
                                {saving ? <CircularProgress size={24} color="inherit" /> : (limitReached ? 'Limit Reached' : 'Finish and Save Report')}
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
};

export default ReportEntry;
