const API_BASE = 'http://127.0.0.1:5000/api';

export const api = {
    getPatients: async () => {
        const res = await fetch(`${API_BASE}/patients`);
        if (!res.ok) throw new Error('Failed to fetch patients');
        return res.json();
    },

    createPatient: async (patient: any) => {
        const res = await fetch(`${API_BASE}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient),
        });
        if (!res.ok) throw new Error('Failed to create patient');
        return res.json();
    },

    getTests: async () => {
        const res = await fetch(`${API_BASE}/tests`);
        if (!res.ok) throw new Error('Failed to fetch tests');
        return res.json();
    },

    getTestParameters: async (testId: number) => {
        const res = await fetch(`${API_BASE}/tests/${testId}/parameters`);
        if (!res.ok) throw new Error('Failed to fetch parameters');
        return res.json();
    },

    saveReport: async (reportData: any) => {
        const res = await fetch(`${API_BASE}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData),
        });
        if (!res.ok) throw new Error('Failed to save report');
        return res.json();
    },

    updateReport: async (id: number, reportData: any) => {
        const res = await fetch(`${API_BASE}/reports/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData),
        });
        if (!res.ok) throw new Error('Failed to update report');
        return res.json();
    },

    getReport: async (id: number) => {
        const res = await fetch(`${API_BASE}/reports/${id}`);
        if (!res.ok) throw new Error('Failed to fetch report');
        return res.json();
    },

    // Test Management
    createTest: async (testData: any) => {
        const res = await fetch(`${API_BASE}/tests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData),
        });
        if (!res.ok) throw new Error('Failed to create test');
        return res.json();
    },

    updateTest: async (id: number, testData: any) => {
        const res = await fetch(`${API_BASE}/tests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData),
        });
        if (!res.ok) throw new Error('Failed to update test');
        return res.json();
    },

    deleteTest: async (id: number) => {
        const res = await fetch(`${API_BASE}/tests/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete test');
        return res.json();
    },

    saveParameter: async (paramData: any) => {
        const url = paramData.id ? `${API_BASE}/parameters/${paramData.id}` : `${API_BASE}/parameters`;
        const method = paramData.id ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paramData),
        });
        if (!res.ok) throw new Error('Failed to save parameter');
        return res.json();
    },

    deleteParameter: async (id: number) => {
        const res = await fetch(`${API_BASE}/parameters/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete parameter');
        return res.json();
    },

    // Settings
    getSettings: async () => {
        const res = await fetch(`${API_BASE}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },

    saveSettings: async (settings: any) => {
        const res = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!res.ok) throw new Error('Failed to save settings');
        return res.json();
    },

    // Reports List
    getReports: async () => {
        const res = await fetch(`${API_BASE}/reports`);
        if (!res.ok) throw new Error('Failed to fetch reports');
        return res.json();
    },

    deleteReport: async (id: number) => {
        const res = await fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete report');
        return res.json();
    },

    getNextBillNumber: async () => {
        const res = await fetch(`${API_BASE}/next-bill-number`);
        if (!res.ok) throw new Error('Failed to fetch next bill number');
        return res.json();
    },

    // -- Auth & Users --
    login: async (credentials: any) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to login');
        }
        return res.json();
    },

    getUsers: async () => {
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    createUser: async (userData: any) => {
        const res = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to create user');
        }
        return res.json();
    },

    updateUser: async (id: number, userData: any) => {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    },

    deleteUser: async (id: number) => {
        const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete user');
        return res.json();
    },

    // -- Licensing --
    getLicenseStatus: async () => {
        const res = await fetch(`${API_BASE}/license-status`);
        if (!res.ok) throw new Error('Failed to fetch license status');
        return res.json();
    },

    activateLicense: async (key: string) => {
        const res = await fetch(`${API_BASE}/activate-license`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to activate license');
        }
        return res.json();
    },

    resetDatabase: async () => {
        const res = await fetch(`${API_BASE}/reset-database`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to reset database');
        return res.json();
    }
};
