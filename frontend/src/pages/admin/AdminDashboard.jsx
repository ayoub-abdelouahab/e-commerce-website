import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getRecentOrders, getTopCategories } from '../../api/dashboard';
import { CardSkeleton, ListSkeleton } from '../../components/Skeleton';

const Icon = ({ name }) => {
    const common = {
        width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
    };
    switch (name) {
        case 'revenue':
            return (<svg {...common}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
        case 'orders':
            return (<svg {...common}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>);
        case 'products':
            return (<svg {...common}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>);
        case 'customers':
            return (<svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
        case 'clock':
            return (<svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
        default:
            return null;
    }
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        const loadDashboard = async () => {
            try {
                const [statsData, ordersData, categoriesData] = await Promise.all([
                    getDashboardStats(),
                    getRecentOrders(),
                    getTopCategories(),
                ]);
                if (cancelled) return;
                setStats(statsData);
                setOrders(ordersData);
                setCategories(categoriesData);
            } catch (err) {
                if (cancelled) setError(err.response?.data?.message || 'Could not load dashboard data.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadDashboard();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <section className="admin-stack">
                <div className="admin-hero">
                    <div>
                        <span className="admin-kicker">Loading...</span>
                        <h2>Store overview</h2>
                    </div>
                </div>
                <div className="admin-stats-grid">
                    {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
                <div className="admin-two-col">
                    <div className="admin-panel"><ListSkeleton rows={4} /></div>
                    <div className="admin-panel"><ListSkeleton rows={4} /></div>
                </div>
            </section>
        );
    }

    if (error) {
        return <div className="admin-alert">{error}</div>;
    }

    const statCards = [
        { label: 'Total revenue', value: `${stats?.total_revenue ?? '0.00'} DA`, note: 'From paid orders', icon: 'revenue', accent: 'teal' },
        { label: 'Total orders', value: stats?.total_orders ?? 0, note: 'All time', icon: 'orders', accent: 'blue' },
        { label: 'Products', value: stats?.total_products ?? 0, note: 'In catalog', icon: 'products', accent: 'violet' },
        { label: 'Customers', value: stats?.total_customers ?? 0, note: 'Registered users', icon: 'customers', accent: 'amber' },
    ];

    const categoryColors = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];

    return (
        <section className="admin-stack">
            <div className="admin-hero">
                <div className="admin-hero-text">
                    <span className="admin-kicker">Today</span>
                    <h2>Welcome back 👋</h2>
                    <p>Here's what's happening in your store today.</p>
                </div>
                <div className="admin-hero-metrics">
                    <div>
                        <span className="admin-hero-metric-icon"><Icon name="orders" /></span>
                        <strong>{stats?.today_orders ?? 0}</strong>
                        <span>Orders today</span>
                    </div>
                    <div>
                        <span className="admin-hero-metric-icon"><Icon name="revenue" /></span>
                        <strong>{stats?.today_revenue ?? '0.00'} DA</strong>
                        <span>Revenue today</span>
                    </div>
                </div>
            </div>

            <div className="admin-stats-grid">
                {statCards.map((card) => (
                    <article className={`admin-stat-card accent-${card.accent}`} key={card.label}>
                        <div className="admin-stat-icon"><Icon name={card.icon} /></div>
                        <div className="admin-stat-body">
                            <span>{card.label}</span>
                            <strong>{card.value}</strong>
                            <small>{card.note}</small>
                        </div>
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
                                    <span className="admin-avatar">
                                        {(order.customer || 'C').charAt(0).toUpperCase()}
                                    </span>
                                    <div className="admin-list-info">
                                        <strong>{order.ref}</strong>
                                        <span>{order.customer || 'Customer'} · {order.date}</span>
                                    </div>
                                    <span className={`admin-pill ${order.payment_status}`}>{order.payment_status}</span>
                                    <strong className="admin-list-total">{order.total}</strong>
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
                            {categories.map((category, i) => (
                                <div className="admin-category-row" key={category.name}>
                                    <div className="admin-category-dot" style={{ background: categoryColors[i % categoryColors.length] }} />
                                    <div className="admin-category-info">
                                        <div className="admin-category-top">
                                            <strong>{category.name}</strong>
                                            <small>{category.percentage}%</small>
                                        </div>
                                        <div className="admin-progress">
                                            <span style={{
                                                width: `${category.percentage}%`,
                                                background: categoryColors[i % categoryColors.length],
                                            }} />
                                        </div>
                                        <span className="admin-category-count">{category.count} products</span>
                                    </div>
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
