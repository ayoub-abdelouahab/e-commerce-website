import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';

// ✅ Protect routes that require login
const PrivateRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/login" />;
};

// ✅ Redirect logged-in users away from login/register
const GuestRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return !isLoggedIn ? children : <Navigate to="/" />;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={
                    <GuestRoute><Login /></GuestRoute>
                } />
                <Route path="/register" element={
                    <GuestRoute><Register /></GuestRoute>
                } />
                <Route path="/" element={
                    <PrivateRoute><Products /></PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default App;