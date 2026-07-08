import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';

const PrivateRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { isLoggedIn, isAdmin } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return isAdmin ? children : <Navigate to="/" />;
};

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
                <Route path="/products" element={
                    <PrivateRoute><ProductsPage /></PrivateRoute>
                } />
                <Route path="/orders" element={
                    <PrivateRoute><OrdersPage /></PrivateRoute>
                } />
                <Route path="/admin" element={
                    <AdminRoute><AdminLayout /></AdminRoute>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
