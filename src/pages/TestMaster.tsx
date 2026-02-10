import { useState, useEffect } from 'react';
import { 
    Box, Typography, List, ListItem, ListItemText, ListItemButton, 
    Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, 
    DialogActions, Chip, Divider 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
    
    // Form State
    const [testForm, setTestForm] = useState({ id: 0, test_name: '', price: '' });
    const [paramForm, setParamForm] = useState({ 
        id: 0, test_id: 0, param_name: '', unit: '', min_range: '', max_range: '' 
    });

    useEffect(() => {
        loadTests();
    }, []);

    useEffect(() => {
        if (selectedTest) {
            loadParams(selectedTest.id);
        } else {
            setParams([]);
        }
    }, [selectedTest]);

    const loadTests = async () => {
        try {
            const data = await api.getTests();
            setTests(data);
        } catch (e) { console.error(e); }
    };

    const loadParams = async (testId: number) => {
        try {
            const data = await api.getTestParameters(testId);
            setParams(data);
        } catch (e) { console.error(e); }
    };

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
        } catch (e) { showToast('Failed to save test', 'error'); }
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
                } catch (e) { showToast('Failed to delete test', 'error'); }
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
        } catch (e) { showToast('Failed to save field', 'error'); }
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
                } catch (e) { showToast('Failed to delete field', 'error'); }
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
                unit: param.unit, min_range: param.min_range.toString(), max_range: param.max_range.toString()
            });
        } else {
            setParamForm({
                id: 0, test_id: selectedTest!.id, param_name: '',
                unit: '', min_range: '', max_range: ''
            });
        }
        setIsParamDialogOpen(true);
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 0 }, pb: 10 }}>
            <Box sx={{ mb: 6, mt: 4 }}>
                <Typography variant="h3" fontWeight="800" className="gradient-text" sx={{ mb: 1, letterSpacing: -1 }}>
                    Manage Tests
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight="500">
                    Add, edit, or remove tests and their settings.
                </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.6fr' }, gap: 4, height: 'calc(100vh - 280px)', minHeight: 600 }}>
                {/* Left Panel: Tests List */}
                <Box sx={{ height: '100%' }}>
                    <Box className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Box sx={{ p: 4, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.4)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <ScienceIcon sx={{ color: '#4f46e5' }} />
                                <Typography variant="h6" fontWeight="800">Test List</Typography>
                            </Box>
                            <Button 
                                startIcon={<AddIcon />} 
                                variant="contained" 
                                size="small" 
                                onClick={() => openTestDialog()}
                                className="premium-button"
                                sx={{ borderRadius: 2.5, px: 2, py: 1, fontWeight: 800 }}
                            >
                                Add Test
                            </Button>
                        </Box>
                        <List sx={{ px: 2, py: 2, flexGrow: 1, overflow: 'auto' }}>
                            {tests.map(test => (
                                <Box key={test.id} sx={{ mb: 1.5 }}>
                                    <ListItem 
                                        disablePadding
                                        secondaryAction={
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton size="small" onClick={() => openTestDialog(test)} sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)', '&:hover': { bgcolor: '#6366f1', color: 'white' } }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteTest(test)} sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: '#ef4444', color: 'white' } }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        }
                                        sx={{ 
                                            borderRadius: 3,
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            border: selectedTest?.id === test.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                            bgcolor: selectedTest?.id === test.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                            '&:hover': {
                                                bgcolor: selectedTest?.id === test.id ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0,0,0,0.02)',
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                    >
                                        <ListItemButton 
                                            selected={selectedTest?.id === test.id}
                                            onClick={() => setSelectedTest(test)}
                                            sx={{ 
                                                borderRadius: 3, 
                                                py: 2,
                                                '&.Mui-selected': { bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent' } }
                                            }}
                                        >
                                            <Box sx={{ 
                                                width: 40, height: 40, borderRadius: 2, 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                bgcolor: selectedTest?.id === test.id ? '#4f46e5' : '#f1f5f9',
                                                color: selectedTest?.id === test.id ? 'white' : '#64748b',
                                                mr: 2, transition: 'all 0.2s'
                                            }}>
                                                <ScienceIcon fontSize="small" />
                                            </Box>
                                            <ListItemText 
                                                primary={<Typography variant="subtitle1" fontWeight="800" color={selectedTest?.id === test.id ? '#1e293b' : 'text.primary'}>{test.test_name}</Typography>} 
                                                secondary={<Typography variant="caption" fontWeight="700" color="#64748b">₹{test.price.toFixed(2)}</Typography>} 
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </Box>
                            ))}
                        </List>
                    </Box>
                </Box>


                {/* Right Panel: Parameters */}
                <Box>
                    {selectedTest ? (
                        <Box className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 4, bgcolor: 'rgba(255,255,255,0.4)' }}>
                            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: -0.5 }}>{selectedTest.test_name}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary" fontWeight="500">Price:</Typography>
                                        <Typography variant="body2" fontWeight="800" sx={{ color: '#10b981' }}>₹{selectedTest.price.toFixed(2)}</Typography>
                                    </Box>
                                </Box>
                                <Button 
                                    startIcon={<AddIcon />} 
                                    variant="outlined" 
                                    onClick={() => openParamDialog()}
                                    sx={{ borderRadius: 3, fontWeight: 700, px: 3, border: '2px solid' }}
                                >
                                    Add Field
                                </Button>
                            </Box>
                            
                            <Divider sx={{ mb: 3, opacity: 0.5 }} />

                            <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
                                {params.length === 0 ? (
                                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                        <ListAltIcon sx={{ fontSize: 48, mb: 1 }} />
                                        <Typography fontWeight="600">No parameters defined yet.</Typography>
                                    </Box>
                                ) : (
                                    <List disablePadding>
                                        {params.map((param) => (
                                            <Box key={param.id} sx={{ mb: 2 }}>
                                                <Box sx={{ 
                                                    p: 3, borderRadius: 4, bgcolor: 'white', 
                                                    border: '1px solid #e2e8f0',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                                                }}>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#1e293b' }}>{param.param_name}</Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                            <Chip 
                                                                label={`${param.min_range} - ${param.max_range}`} 
                                                                size="small" 
                                                                sx={{ height: 20, bgcolor: '#f1f5f9', fontWeight: 700, fontSize: '0.7rem' }} 
                                                            />
                                                            <Chip 
                                                                label={param.unit} 
                                                                size="small" 
                                                                sx={{ height: 20, bgcolor: 'rgba(99, 102, 241, 0.05)', color: '#4f46e5', fontWeight: 800, fontSize: '0.7rem' }} 
                                                            />
                                                        </Box>
                                                    </Box>
                                                    <Box>
                                                        <IconButton onClick={() => openParamDialog(param)} sx={{ color: '#6366f1' }}><EditIcon fontSize="small" /></IconButton>
                                                        <IconButton color="error" onClick={() => handleDeleteParam(param.id)} sx={{ opacity: 0.7 }}><DeleteIcon fontSize="small" /></IconButton>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </Box>
                    ) : (
                        <Box className="glass-card" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                            <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                                <ScienceIcon sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                                <Typography variant="h6" fontWeight="700">Select a test</Typography>
                                <Typography variant="body2">to see its settings</Typography>
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
