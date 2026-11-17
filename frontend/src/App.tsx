import { useState, useEffect } from 'react';
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import PortfolioBuilder from './portfolio_builder';
import SearchPortfolios from './SearchPortfolios';
import { Loader2, LogOut } from 'lucide-react';

export default function App() {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [view, setView] = useState<'landing' | 'login' | 'register' | 'forgot-password' | 'app' | 'search'>('landing');

    useEffect(() => {
        const updateRoute = () => {
            const hash = window.location.hash;
            const path = window.location.pathname;
            if (hash === '#search' || path === '/search') {
                setView('search');
            } else if (hash === '#login') {
                setView('login');
            } else if (hash === '#register') {
                setView('register');
            }
        };

        updateRoute();
        window.addEventListener('hashchange', updateRoute);
        window.addEventListener('popstate', updateRoute);
        return () => {
            window.removeEventListener('hashchange', updateRoute);
            window.removeEventListener('popstate', updateRoute);
        };
    }, []);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    setCurrentUser(data.user);
                    // If user is already on search view via hash or path, don't override
                    const isSearch = window.location.hash === '#search' || window.location.pathname === '/search';
                    if (!isSearch) {
                        setView('app');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to check user session', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = () => {
        window.location.hash = '';
        checkUser();
        setView('app');
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setCurrentUser(null);
            window.location.hash = '';
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

    if (view === 'search') {
        return (
            <SearchPortfolios
                currentUser={currentUser}
                onBackToHome={() => {
                    if (window.location.hash === '#search') {
                        window.location.hash = '';
                    }
                    setView(currentUser ? 'app' : 'landing');
                }}
                onGoToDashboard={() => {
                    window.location.hash = '';
                    setView('app');
                }}
                onLoginClick={() => {
                    window.location.hash = '#login';
                    setView('login');
                }}
                onRegisterClick={() => {
                    window.location.hash = '#register';
                    setView('register');
                }}
            />
        );
    }

    if (view === 'app') {
        return (
            <div className="relative">
                <PortfolioBuilder onSearchClick={() => setView('search')} />
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

    if (view === 'forgot-password') {
        return (
            <ForgotPassword
                onBackToLogin={() => setView('login')}
            />
        );
    }

    if (view === 'login') {
        return (
            <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setView('register')}
                onForgotPassword={() => setView('forgot-password')}
            />
        );
    }

    return (
        <Landing
            onLoginClick={() => setView('login')}
            onRegisterClick={() => setView('register')}
            onSearchClick={() => {
                window.location.hash = '#search';
                setView('search');
            }}
        />
    );
}
