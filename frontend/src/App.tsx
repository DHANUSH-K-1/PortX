import { useState, useEffect } from 'react';
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import PortfolioBuilder from './portfolio_builder';
import { Loader2, LogOut } from 'lucide-react';

export default function App() {
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'landing' | 'login' | 'register' | 'app'>('landing');

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    setView('app');
                }
            }
        } catch (error) {
            console.error('Failed to check user session', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = () => {
        setView('app');
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setView('landing');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin w-10 h-10 text-purple-500" />
            </div>
        );
    }

    if (view === 'app') {
        return (
            <div className="relative">
                <PortfolioBuilder />
                <button
                    onClick={handleLogout}
                    className="fixed top-4 right-4 z-50 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors border border-red-500/30"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        );
    }

    if (view === 'register') {
        return (
            <Register
                onLoginSuccess={handleLoginSuccess}
                onSwitchToLogin={() => setView('login')}
            />
        );
    }

    if (view === 'login') {
        return (
            <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setView('register')}
            />
        );
    }

    return (
        <Landing
            onLoginClick={() => setView('login')}
            onRegisterClick={() => setView('register')}
        />
    );
}
