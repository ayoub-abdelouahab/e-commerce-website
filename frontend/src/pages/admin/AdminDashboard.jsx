import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getRecentOrders, getTopCategories } from '../../api/dashboard';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [statsData, ordersData, categoriesData] = await Promise.all([
                    getDashboardStats(),
                    getRecentOrders(),
                    getTopCategories(),
                ]);

                setStats(statsData);
                setOrders(ordersData);
                setCategories(categoriesData);
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return <div className="admin-loading">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="admin-alert">{error}</div>;
    }

    const statCards = [
        ['Total revenue', `$${stats?.total_revenue ?? '0.00'}`, 'Paid orders'],
        ['Total orders', stats?.total_orders ?? 0, 'All time'],
        ['Products', stats?.total_products ?? 0, 'Catalog items'],
        ['Customers', stats?.total_customers ?? 0, 'Registered users'],
    ];

    return (
        <section className="admin-stack">
            <div className="admin-hero">
                <div>
                    <span className="admin-kicker">Today</span>
                    <h2>Store overview</h2>
                    <p>Track the numbers that matter and jump into daily admin work.</p>
                </div>
                <div className="admin-hero-metrics">
                    <div>
                        <strong>{stats?.today_orders ?? 0}</strong>
                        <span>Orders</span>
                    </div>
                    <div>
                        <strong>${stats?.today_revenue ?? '0.00'}</strong>
                        <span>Revenue</span>
                    </div>
                </div>
            </div>

            <div className="admin-stats-grid">
                {statCards.map(([label, value, note]) => (
                    <article className="admin-stat-card" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                        <small>{note}</small>
                    </article>
                ))}
            </div>

            <div className="admin-two-col">
                <section className="admin-panel">
                    <div className="admin-panel-head">
                        <h3>Recent orders</h3>
                        <Link to="/admin/orders">View all</Link>
                    </div>

                    {orders.length === 0 ? (
                        <p className="admin-empty">No orders yet.</p>
                    ) : (
                        <div className="admin-list">
                            {orders.map((order) => (
                                <div className="admin-list-row" key={order.id}>
                                    <div>
                                        <strong>{order.ref}</strong>
                                        <span>{order.customer || 'Customer'} - {order.date}</span>
                                    </div>
                                    <span className={`admin-pill ${order.payment_status}`}>{order.payment_status}</span>
                                    <strong>{order.total}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="admin-panel">
                    <div className="admin-panel-head">
                        <h3>Top categories</h3>
                        <Link to="/admin/categories">Manage</Link>
                    </div>

                    {categories.length === 0 ? (
                        <p className="admin-empty">No categories yet.</p>
                    ) : (
                        <div className="admin-category-list">
                            {categories.map((category) => (
                                <div className="admin-category-row" key={category.name}>
                                    <div>
                                        <strong>{category.name}</strong>
                                        <span>{category.count} products</span>
                                    </div>
                                    <div className="admin-progress">
                                        <span style={{ width: `${category.percentage}%` }} />
                                    </div>
                                    <small>{category.percentage}%</small>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
};

export default AdminDashboard;
