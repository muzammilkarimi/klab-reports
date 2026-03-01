import { ThemeProvider } from '@mui/material/styles';
import { HashRouter, Routes, Route } from 'react-router-dom';
import theme from './theme/theme';
import MainLayout from './layout/MainLayout';
import ReportEntry from './pages/ReportEntry';
import Dashboard from './pages/Dashboard';
import PrintReport from './pages/PrintReport';
import ViewReport from './pages/ViewReport';
import TestMaster from './pages/TestMaster';
import ReportHistory from './pages/ReportHistory';
import Drafts from './pages/Drafts';
import Settings from './pages/Settings';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <NotificationProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="new-report" element={<ReportEntry />} />
                <Route path="tests" element={<TestMaster />} />
                <Route path="history" element={<ReportHistory />} />
                <Route path="drafts" element={<Drafts />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="/view-report/:id" element={<ViewReport />} />
              <Route path="/print-report/:id" element={<PrintReport />} />
            </Routes>
          </HashRouter>
        </NotificationProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
