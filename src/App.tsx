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
import LoginPage from './pages/LoginPage';
import UpgradePage from './pages/UpgradePage';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <HashRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="new-report" element={<ReportEntry />} />
                  <Route path="tests" element={<TestMaster />} />
                  <Route path="history" element={<ReportHistory />} />
                  <Route path="drafts" element={<Drafts />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="upgrade" element={<UpgradePage />} />
                </Route>

                <Route path="/view-report/:id" element={<ViewReport />} />
                
                <Route path="/print-report/:id" element={<PrintReport />} />
              </Routes>
            </HashRouter>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
