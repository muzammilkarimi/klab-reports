import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    full_name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
    tier: 'FREE' | 'PRO';
    isPro: boolean;
    monthlyUsage: number;
    usageLimit: number;
    refreshLicense: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { api } from '../api/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tier, setTier] = useState<'FREE' | 'PRO'>('FREE');
    const [usage, setUsage] = useState({ monthlyUsage: 0, limit: 30 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const savedUser = localStorage.getItem('klab_user');
                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch (e) {
                        localStorage.removeItem('klab_user');
                    }
                }
                await refreshLicense();
            } catch (e) {
                console.error('Auth initialization error:', e);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const refreshLicense = async () => {
        try {
            const status = await api.getLicenseStatus();
            setTier(status.tier);
            setUsage({ monthlyUsage: status.monthlyUsage, limit: status.limit });
        } catch (e) {
            console.error('Failed to refresh license status', e);
        }
    };

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('klab_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('klab_user');
    };

    if (loading) return null; // Or a global spinner

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            isAuthenticated: !!user, 
            tier, 
            isPro: tier === 'PRO',
            monthlyUsage: usage.monthlyUsage,
            usageLimit: usage.limit,
            refreshLicense
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
