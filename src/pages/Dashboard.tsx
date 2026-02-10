import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, Chip, IconButton } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PrintIcon from '@mui/icons-material/Print';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { isPro } = useAuth();
    const { showToast } = useNotification();

    const [stats, setStats] = useState({
        today: 0,
        month: 0,
        drafts: 0,
        mostUsed: 'N/A'
    });
    const [recent, setRecent] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [labName, setLabName] = useState('My Laboratory');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 10000); // Update every 10s
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Load Lab Name
                const settings = await api.getSettings();
                if (settings.lab_name) setLabName(settings.lab_name);

                const reports = await api.getReports(); 
                if (Array.isArray(reports)) {
                    setRecent(reports.slice(0, 5));
                    const now = new Date();
                    const todayStr = now.toDateString();
                    const currentMonth = now.getMonth();

                    let todayCount = 0;
                    let monthCount = 0;
                    let draftsCount = 0;
                    const testCounts: Record<string, number> = {};

                    reports.forEach((r: any) => {
                        const rDate = new Date(r.created_at);
                        if (rDate.toDateString() === todayStr) todayCount++;
                        if (rDate.getMonth() === currentMonth && rDate.getFullYear() === now.getFullYear()) monthCount++;
                        if (r.status === 'DRAFT') draftsCount++;
                        if (r.test_names) {
                            r.test_names.split(',').forEach((t: string) => {
                                const trimT = t.trim();
                                testCounts[trimT] = (testCounts[trimT] || 0) + 1;
                            });
                        }
                    });

                    let mostUsed = 'N/A';
                    let maxCount = 0;
                    for (const [name, count] of Object.entries(testCounts)) {
                        if (count > maxCount) {
                            maxCount = count;
                            mostUsed = name;
                        }
                    }

                    setStats({ today: todayCount, month: monthCount, drafts: draftsCount, mostUsed });

                    const sortedChartData = Object.entries(testCounts)
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => (b.count as number) - (a.count as number))
                        .slice(0, 6);
                    setChartData(sortedChartData);
                }
            } catch (e) {
                console.error('Failed to load dashboard data', e);
            }
        };
        loadDashboardData();
    }, []);

    const statCards = [
        { title: 'Reports Made', subtitle: 'Total reports today', value: stats.today, icon: <DescriptionIcon sx={{ fontSize: 28 }} />, gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', shadow: 'rgba(99, 102, 241, 0.2)' },
        { title: 'Monthly Total', subtitle: 'Reports this month', value: stats.month, icon: <TrendingUpIcon sx={{ fontSize: 28 }} />, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.2)' },
        { title: 'Saved Drafts', subtitle: 'Reports to be finished', value: stats.drafts, icon: <WarningAmberIcon sx={{ fontSize: 28 }} />, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: 'rgba(245, 158, 11, 0.2)' },
        { title: 'Most Common Test', subtitle: stats.mostUsed, value: 'TOP', icon: <TrendingUpIcon sx={{ fontSize: 28 }} />, gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', shadow: 'rgba(236, 72, 153, 0.2)' },
    ];

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 0 }, pb: 10 }}>
            {/* Spiritual Header */}
            <Box sx={{ textAlign: 'center', py: 1, mb: 1 }}>
                <Typography 
                    variant="h5" 
                    sx={{ 
                        fontFamily: "'Amiri', serif", 
                        fontWeight: 700, 
                        color: 'primary.main',
                        opacity: 0.8,
                        letterSpacing: 2
                    }}
                >
                    بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </Typography>
            </Box>

            <Box sx={{ mb: 6, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h3" fontWeight="900" className="gradient-text" sx={{ mb: 0.5, letterSpacing: -1 }}>
                        {labName}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight="700" sx={{ opacity: 0.8 }}>
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} • {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<NoteAddIcon />} 
                    onClick={() => navigate('/new-report')}
                    className="premium-button"
                    sx={{ height: 54, px: 4, borderRadius: 3, fontWeight: 800 }}
                >
                    Create New Report
                </Button>
            </Box>

            {/* Top Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 6 }}>
                {statCards.map((card, index) => (
                    <Box key={index} className="glass-card" sx={{ 
                        p: 3, 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 160,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 20px 40px ${card.shadow}` }
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ 
                                width: 48, height: 48, borderRadius: 2, 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: card.gradient, color: 'white',
                                boxShadow: `0 8px 16px ${card.shadow}`
                            }}>
                                {card.icon}
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>{card.value}</Typography>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" fontWeight="800" color="#1e293b">{card.title}</Typography>
                            <Typography variant="caption" fontWeight="600" color="text.secondary">{card.subtitle}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.8fr 1.2fr' }, gap: 4 }}>
                <Box>
                    <Box className="glass-card" sx={{ p: 4, height: '100%', bgcolor: 'rgba(255,255,255,0.4)', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight="800">Testing Trends</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="500">Number of times each test was performed.</Typography>
                        </Box>
                        
                        {!isPro && (
                            <Box sx={{ 
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                zIndex: 10, bgcolor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                p: 4, textAlign: 'center'
                            }}>
                                <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.8 }} />
                                <Typography variant="h5" fontWeight="900" sx={{ mb: 1 }}>Pro Version Required</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 300 }}>
                                    Get the Pro version to see detailed charts and real-time activity.
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    className="premium-button"
                                    onClick={() => navigate('/upgrade')}
                                    sx={{ borderRadius: 3, px: 4, fontWeight: 800 }}
                                >
                                    Upgrade to Pro
                                </Button>
                            </Box>
                        )}

                        <Box sx={{ height: 320, width: '100%' }}>
                            {chartData.length === 0 ? (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                    <TrendingUpIcon sx={{ fontSize: 48, mr: 2 }} />
                                    <Typography fontWeight="600">Collecting operational data...</Typography>
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                            contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                                            itemStyle={{ fontWeight: 800, color: '#4f46e5' }}
                                            labelStyle={{ fontWeight: 900, marginBottom: 4 }}
                                        />
                                        <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={45}>
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" />
                                                    <stop offset="100%" stopColor="#818cf8" />
                                                </linearGradient>
                                            </defs>
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Box>
                </Box>

                <Box>
                    <Box className="glass-card" sx={{ p: 4, height: '100%', bgcolor: 'rgba(255,255,255,0.4)', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" fontWeight="800">Recent Reports</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight="500">The latest reports you worked on.</Typography>
                            </Box>
                            <Button variant="text" size="small" sx={{ fontWeight: 800 }} onClick={() => navigate('/history')}>View All</Button>
                        </Box>

                        {!isPro && (
                            <Box sx={{ 
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                zIndex: 10, bgcolor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)',
                                borderRadius: '30px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                p: 4, textAlign: 'center'
                            }}>
                                <Typography variant="body2" fontWeight="800" color="text.secondary">PRIVATE ACTIVITY FEED</Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>Upgrade to Pro to see recent reports here</Typography>
                            </Box>
                        )}
                        <Stack spacing={2}>
                            {recent.length === 0 ? (
                                <Box sx={{ py: 6, textAlign: 'center', opacity: 0.3 }}>
                                    <DescriptionIcon sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography variant="body2" fontWeight="700">No recent activity detected.</Typography>
                                </Box>
                            ) : recent.map((report) => (
                                <Box key={report.id} sx={{ 
                                    p: 2.5, 
                                    borderRadius: 4, 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e2e8f0',
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }
                                }} onClick={() => navigate('/history')}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1e293b' }}>{report.patient_name}</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight="700" noWrap sx={{ maxWidth: 120, display: 'block' }}>{report.test_names}</Typography>
                                    </Box>

                                    <Box sx={{ textAlign: 'right' }}>
                                        <Chip 
                                            label={report.status} 
                                            size="small" 
                                            sx={{ 
                                                height: 18, fontSize: '0.6rem', fontWeight: 900, mb: 1,
                                                bgcolor: report.status === 'FINAL' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                color: report.status === 'FINAL' ? '#059669' : '#d97706',
                                                border: report.status === 'FINAL' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                                            }} 
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                            <IconButton size="small" sx={{ bgcolor: '#f8fafc' }} onClick={async (e) => {
                                                e.stopPropagation();
                                                if (window.electron && window.electron.printReport) {
                                                    showToast('Making PDF...', 'info');
                                                    const result = await window.electron.printReport(report.id, `${report.patient_name}_${new Date().toLocaleDateString().replace(/\//g, '-')}`);
                                                    if (result && result.success) {
                                                        showToast('PDF Saved Successfully', 'success');
                                                    } else {
                                                        showToast('Save Failed', 'error');
                                                    }
                                                }
                                            }}>
                                                <PrintIcon sx={{ fontSize: 16, color: '#4f46e5' }}  />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;
