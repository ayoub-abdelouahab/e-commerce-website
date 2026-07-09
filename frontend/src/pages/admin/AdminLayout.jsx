import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Admin.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="admin-app">
            <aside className="admin-sidebar">
                <button className="admin-brand" type="button" onClick={() => navigate('/admin')}>
                    <span className="admin-brand-mark">M</span>
                    <span>MyShop Admin</span>
                </button>

                <nav className="admin-nav" aria-label="Admin navigation">
                    <NavLink to="/admin" end>Dashboard</NavLink>
                    <NavLink to="/admin/products">Products</NavLink>
                    <NavLink to="/admin/categories">Categories</NavLink>
                    <NavLink to="/admin/orders">Orders</NavLink>
                    <NavLink to="/admin/audit-logs">Audit Logs</NavLink>
                </nav>

                <button className="admin-store-link" type="button" onClick={() => navigate('/products')}>
                    View Store
                </button>
            </aside>

            <div className="admin-shell">
                <header className="admin-topbar">
                    <div>
                        <span className="admin-kicker">Control center</span>
                        <h1>Admin</h1>
                    </div>

                    <div className="admin-account">
                        <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                        <div className="admin-user">
                            <strong>{user?.name}</strong>
                            <span>{user?.role}</span>
                        </div>
                        <button className="admin-ghost-btn" type="button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
