import { useState, useEffect } from 'react';
import { 
    Box, Typography, List, ListItem, ListItemText, ListItemButton, 
    Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, 
    DialogActions, Chip, InputAdornment, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { api } from '../api/api';
import { useNotification } from '../context/NotificationContext';
import type { TestParameter } from '../types';

interface Test {
    id: number;
    test_name: string;
    price: number;
}

const TestMaster = () => {
    const { showToast, showConfirm } = useNotification();
    const [tests, setTests] = useState<Test[]>([]);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [params, setParams] = useState<TestParameter[]>([]);
    
    // UI State
    const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
    const [isParamDialogOpen, setIsParamDialogOpen] = useState(false);
    const [testSearch, setTestSearch] = useState('');
    const [paramSearch, setParamSearch] = useState('');
    
    // Form State
    const [testForm, setTestForm] = useState({ id: 0, test_name: '', price: '' });
    const [paramForm, setParamForm] = useState({ 
        id: 0, test_id: 0, param_name: '', unit: '', min_range: '', max_range: '', gender_specific: 0
    } as { id: number; test_id: number; param_name: string; unit: string; min_range: string; max_range: string; gender_specific: number; });

    const loadTests = async () => {
        try {
            const data = await api.getTests();
            setTests(data);
        } catch { /* handle error */ }
    };

    const loadParams = async (testId: number) => {
        try {
            const data = await api.getTestParameters(testId);
            setParams(data);
        } catch { /* handle error */ }
    };

    useEffect(() => {
        let ignore = false;
        const fetchData = async () => {
             if (!ignore) await loadTests();
        };
        fetchData();
        return () => { ignore = true; };
    }, []);

    useEffect(() => {
        let ignore = false;
        const fetchData = async () => {
            if (selectedTest) {
                if (!ignore) await loadParams(selectedTest.id);
            } else {
                setParams([]);
            }
        };
        fetchData();
        return () => { ignore = true; };
    }, [selectedTest]);

    const handleSaveTest = async () => {
        try {
            const payload = { ...testForm, price: Number(testForm.price) };
            if (testForm.id) {
                await api.updateTest(testForm.id, payload);
            } else {
                await api.createTest(payload);
            }
            setIsTestDialogOpen(false);
            showToast(`Test ${testForm.id ? 'updated' : 'added'} successfully`);
            loadTests();
        } catch { showToast('Failed to save test', 'error'); }
    };

    const handleDeleteTest = async (test: Test) => {
        showConfirm(
            'Delete Test',
            `Delete test "${test.test_name}"? This cannot be undone.`,
            async () => {
                try {
                    await api.deleteTest(test.id);
                    if (selectedTest?.id === test.id) setSelectedTest(null);
                    showToast('Test deleted successfully');
                    loadTests();
                } catch { showToast('Failed to delete test', 'error'); }
            }
        );
    };

    const handleSaveParam = async () => {
        try {
            const payload = { 
                ...paramForm, 
                test_id: selectedTest!.id, 
                min_range: Number(paramForm.min_range), 
                max_range: Number(paramForm.max_range)
            };
            await api.saveParameter(payload);
            setIsParamDialogOpen(false);
            showToast('Field saved successfully');
            loadParams(selectedTest!.id);
        } catch { showToast('Failed to save field', 'error'); }
    };

    const handleDeleteParam = async (id: number) => {
        showConfirm(
            'Delete Field',
            'Are you sure you want to delete this field?',
            async () => {
                try {
                    await api.deleteParameter(id);
                    showToast('Field deleted successfully');
                    loadParams(selectedTest!.id);
                } catch { showToast('Failed to delete field', 'error'); }
            }
        );
    };

    const openTestDialog = (test?: Test) => {
        if (test) {
            setTestForm({ id: test.id, test_name: test.test_name, price: test.price.toString() });
        } else {
            setTestForm({ id: 0, test_name: '', price: '' });
        }
        setIsTestDialogOpen(true);
    };

    const openParamDialog = (param?: TestParameter) => {
        if (param) {
            setParamForm({
                id: param.id, test_id: param.test_id, param_name: param.param_name,
                unit: param.unit, min_range: param.min_range.toString(), max_range: param.max_range.toString(),
                gender_specific: param.gender_specific || 0
            });
        } else {
            setParamForm({
                id: 0, test_id: selectedTest!.id, param_name: '',
                unit: '', min_range: '', max_range: '', gender_specific: 0
            });
        }
        setIsParamDialogOpen(true);
    };

    const filteredTests = tests.filter(test => 
        test.test_name.toLowerCase().includes(testSearch.toLowerCase())
    );

    const filteredParams = params.filter(param => 
        param.param_name.toLowerCase().includes(paramSearch.toLowerCase()) ||
        param.unit.toLowerCase().includes(paramSearch.toLowerCase())
    );

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 }, overflow: 'hidden', boxSizing: 'border-box' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" className="gradient-text" sx={{ mb: 0.5, letterSpacing: -1 }}>
                        Manage Tests
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Add, edit, or remove tests and their settings.
                    </Typography>
                </Box>
                <Chip 
                    label={`${tests.length} Total Tests`} 
                    sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', fontWeight: 800, px: 1, height: 28 }}
                />
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '350px 1fr' }, gap: 3, flexGrow: 1, minHeight: 0 }}>
                {/* Left Panel: Tests List */}
                <Box sx={{ height: '100%', minHeight: 0 }}>
                    <Box className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ScienceIcon sx={{ color: '#4f46e5', fontSize: 20 }} />
                                    <Typography variant="subtitle1" fontWeight="800">Test List</Typography>
                                </Box>
                                <Button 
                                    startIcon={<AddIcon />} 
                                    variant="contained" 
                                    size="small" 
                                    onClick={() => openTestDialog()}
                                    className="premium-button"
                                    sx={{ borderRadius: 2, px: 1.5, py: 0.5, fontWeight: 800, fontSize: '0.75rem' }}
                                >
                                    Add Test
                                </Button>
                            </Box>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search tests..."
                                value={testSearch}
                                onChange={(e) => setTestSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 1.5, bgcolor: 'white', '& .MuiOutlinedInput-input': { py: 0.8 } }
                                }}
                            />
                        </Box>
                        <List sx={{ px: 1, py: 1, flexGrow: 1, overflow: 'auto' }}>
                            {filteredTests.map(test => (
                                <Box key={test.id} sx={{ mb: 0.5 }}>
                                    <ListItem 
                                        disablePadding
                                        secondaryAction={
                                            <Box sx={{ display: 'flex', gap: 0.3 }}>
                                                <IconButton size="small" onClick={() => openTestDialog(test)} sx={{ color: '#6366f1', p: 0.5 }}>
                                                    <EditIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteTest(test)} sx={{ p: 0.5 }}>
                                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Box>
                                        }
                                        sx={{ 
                                            borderRadius: 1.5,
                                            border: selectedTest?.id === test.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                            bgcolor: selectedTest?.id === test.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                            '&:hover': {
                                                bgcolor: selectedTest?.id === test.id ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0,0,0,0.02)',
                                            }
                                        }}
                                    >
                                        <ListItemButton 
                                            selected={selectedTest?.id === test.id}
                                            onClick={() => setSelectedTest(test)}
                                            sx={{ 
                                                borderRadius: 1.5, 
                                                py: 0.8,
                                                '&.Mui-selected': { bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent' } }
                                            }}
                                        >
                                            <ListItemText 
                                                primary={<Typography variant="body2" fontWeight="700" noWrap>{test.test_name}</Typography>} 
                                                secondary={<Typography variant="caption" fontWeight="600" color="#64748b">₹{test.price.toFixed(2)}</Typography>} 
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </Box>
                            ))}
                            {filteredTests.length === 0 && (
                                <Box sx={{ py: 5, textAlign: 'center', opacity: 0.5 }}>
                                    <Typography variant="caption" fontWeight="600">No tests found</Typography>
                                </Box>
                            )}
                        </List>
                    </Box>
                </Box>


                {/* Right Panel: Parameters */}
                <Box sx={{ height: '100%', minHeight: 0 }}>
                    {selectedTest ? (
                        <Box className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                                <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5, lineHeight: 1 }}>{selectedTest.test_name}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">Price:</Typography>
                                            <Typography variant="caption" fontWeight="800" sx={{ color: '#10b981' }}>₹{selectedTest.price.toFixed(2)}</Typography>
                                        </Box>
                                    </Box>
                                    <Button 
                                        startIcon={<AddIcon />} 
                                        variant="outlined" 
                                        size="small"
                                        onClick={() => openParamDialog()}
                                        sx={{ borderRadius: 1.5, fontWeight: 700, px: 2, border: '2px solid' }}
                                    >
                                        Add Field
                                    </Button>
                                </Box>
                                
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search parameters or units..."
                                    value={paramSearch}
                                    onChange={(e) => setParamSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 1.5, bgcolor: 'white', '& .MuiOutlinedInput-input': { py: 0.8 } }
                                    }}
                                />
                            </Box>
                            
                            <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {params.length === 0 ? (
                                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                        <ListAltIcon sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography variant="body2" fontWeight="600">No parameters defined yet.</Typography>
                                    </Box>
                                ) : (
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1, bgcolor: 'rgba(255,255,255,0.9)' }}>Parameter Name</TableCell>
                                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1, bgcolor: 'rgba(255,255,255,0.9)' }}>Normal Range</TableCell>
                                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1, bgcolor: 'rgba(255,255,255,0.9)' }}>Unit</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 1, bgcolor: 'rgba(255,255,255,0.9)' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredParams.map((param) => (
                                                <TableRow 
                                                    key={param.id}
                                                    sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
                                                >
                                                    <TableCell sx={{ fontWeight: 700, py: 1 }}>
                                                        {param.param_name}
                                                        {param.gender_specific === 1 && <Chip label="Male" size="small" sx={{ ml: 1, height: 16, fontSize: '0.6rem', bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 800 }} />}
                                                        {param.gender_specific === 2 && <Chip label="Female" size="small" sx={{ ml: 1, height: 16, fontSize: '0.6rem', bgcolor: '#fce7f3', color: '#db2777', fontWeight: 800 }} />}
                                                    </TableCell>
                                                    <TableCell sx={{ py: 1 }}>
                                                        <Chip 
                                                            label={`${param.min_range} - ${param.max_range}`} 
                                                            size="small" 
                                                            sx={{ height: 18, bgcolor: '#f1f5f9', fontWeight: 700, fontSize: '0.6rem' }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ py: 1 }}>
                                                        <Typography variant="caption" fontWeight="800" sx={{ color: '#4f46e5', bgcolor: 'rgba(99, 102, 241, 0.05)', px: 1, py: 0.2, borderRadius: 1 }}>
                                                            {param.unit}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ py: 0.5 }}>
                                                        <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'flex-end' }}>
                                                            <IconButton size="small" onClick={() => openParamDialog(param)} sx={{ color: '#6366f1' }}>
                                                                <EditIcon sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                            <IconButton size="small" color="error" onClick={() => handleDeleteParam(param.id)} sx={{ opacity: 0.7 }}>
                                                                <DeleteIcon sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredParams.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 10, opacity: 0.5 }}>
                                                        <Typography variant="caption" fontWeight="600">No parameters found</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </TableContainer>
                        </Box>
                    ) : (
                        <Box className="glass-card" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                            <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                                <ScienceIcon sx={{ fontSize: 60, mb: 2, opacity: 0.2 }} />
                                <Typography variant="subtitle1" fontWeight="700">Select a test</Typography>
                                <Typography variant="caption">to see its settings</Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Test Dialog */}
            <Dialog open={isTestDialogOpen} onClose={() => setIsTestDialogOpen(false)} PaperProps={{ sx: { borderRadius: 6, p: 2 } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem' }}>{testForm.id ? 'Edit Test' : 'New Test'}</DialogTitle>
                <DialogContent sx={{ pt: 2, width: { xs: '100%', sm: 400 } }}>
                    <TextField 
                        fullWidth label="Test Name" margin="normal" 
                        value={testForm.test_name} 
                        onChange={e => setTestForm({...testForm, test_name: e.target.value})} 
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                    <TextField 
                        fullWidth label="Price (₹)" type="number" margin="normal" 
                        value={testForm.price} 
                        onChange={e => setTestForm({...testForm, price: e.target.value})} 
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsTestDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveTest} className="premium-button" sx={{ px: 4, fontWeight: 800 }}>
                        {testForm.id ? 'Save' : 'Add Test'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Parameter Dialog */}
            <Dialog open={isParamDialogOpen} onClose={() => setIsParamDialogOpen(false)} PaperProps={{ sx: { borderRadius: 6, p: 2 } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem' }}>{paramForm.id ? 'Edit Field' : 'Add Field'}</DialogTitle>
                <DialogContent sx={{ pt: 2, width: { xs: '100%', sm: 450 } }}>
                    <TextField 
                        fullWidth label="Field Name" margin="normal" 
                        value={paramForm.param_name} 
                        onChange={e => setParamForm({...paramForm, param_name: e.target.value})} 
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                    <TextField 
                        fullWidth label="Unit (e.g. mg/dL)" margin="normal" 
                        value={paramForm.unit} 
                        onChange={e => setParamForm({...paramForm, unit: e.target.value})} 
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField 
                            fullWidth label="Minimum Range" type="number" 
                            value={paramForm.min_range} 
                            onChange={e => setParamForm({...paramForm, min_range: e.target.value})} 
                            InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                        />
                        <TextField 
                            fullWidth label="Maximum Range" type="number" 
                            value={paramForm.max_range} 
                            onChange={e => setParamForm({...paramForm, max_range: e.target.value})} 
                            InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                        />
                    </Box>
                    <TextField
                        select
                        fullWidth label="Gender Specificity" margin="normal"
                        value={paramForm.gender_specific}
                        onChange={e => setParamForm({...paramForm, gender_specific: Number(e.target.value)})}
                        SelectProps={{ native: true }}
                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                    >
                        <option value={0}>All Genders</option>
                        <option value={1}>Male Only</option>
                        <option value={2}>Female Only</option>
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsParamDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveParam} className="premium-button" sx={{ px: 4, fontWeight: 800 }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TestMaster;
