import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login, logout, register } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ On app load, check if token exists and fetch user
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getMe()
                .then(setUser)
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogin = async (data) => {
        const result = await login(data);
        setUser(result.user);
        return result;
    };

    const handleRegister = async (data) => {
        const result = await register(data);
        setUser(result.user);
        return result;
    };

    const handleLogout = async () => {
        await logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login: handleLogin,
            register: handleRegister,
            logout: handleLogout,
            isAdmin: user?.role === 'admin',
            isLoggedIn: !!user,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);