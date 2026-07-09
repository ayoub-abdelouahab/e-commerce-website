import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getRecentOrders, getTopCategories } from '../api/dashboard';
import { Skeleton, CardSkeleton, ListSkeleton } from '../components/Skeleton';
import '../styles/Products.css';

const Products = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats]           = useState(null);
    const [orders, setOrders]         = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
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
                if (!cancelled) console.error('Failed to load dashboard data', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="db">
                <nav className="nav">
                    <div className="nav-left">
                        <div className="logo">MyShop</div>
                        <div className="nav-links">
                            <button className="nav-link active">Dashboard</button>
                            <button className="nav-link">Products</button>
                            <button className="nav-link">Orders</button>
                            <button className="nav-link">Categories</button>
                        </div>
                    </div>
                    <div className="nav-right">
                        <div className="avatar"><Skeleton width={34} height={34} borderRadius={17} /></div>
                        <div className="user-info">
                            <Skeleton height={13} width={80} />
                            <Skeleton height={11} width={50} style={{ marginTop: 3 }} />
                        </div>
                    </div>
                </nav>
                <div className="main">
                    <div className="banner skeleton-banner">
                        <div>
                            <Skeleton height={22} width="60%" />
                            <Skeleton height={14} width="40%" style={{ marginTop: 8 }} />
                        </div>
                        <div className="banner-stats">
                            <div className="bstat"><Skeleton height={20} width={50} /><Skeleton height={11} width={60} style={{ marginTop: 4 }} /></div>
                            <div className="bstat"><Skeleton height={20} width={50} /><Skeleton height={11} width={60} style={{ marginTop: 4 }} /></div>
                        </div>
                    </div>
                    <div className="stats">
                        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                    <div className="row2">
                        <div className="panel"><ListSkeleton rows={3} /></div>
                        <div className="panel"><ListSkeleton rows={3} /></div>
                    </div>
                </div>
            </div>
        );
    }

    const catColors = ['#0f766e', '#a855f7', '#f97316', '#ef4444', '#3b82f6'];
    const catBgs    = ['#f0fdf9', '#fdf4ff', '#fff7ed', '#fef2f2', '#eff6ff'];

    const getCategoryEmoji = (name) => {
        if (!name) return '📦';
        const map = {
            clothes: '👕', cloths: '👕', 'vêtements': '👕', vetements: '👕', fashion: '👕', mode: '👕',
            electronics: '💻', 'électronique': '💻', electronique: '💻', tech: '💻', gadgets: '💻',
            'cosmétique': '💄', cosmitique: '💄', beauty: '💄', 'beauté': '💄', makeup: '💄', soins: '💄',
            gifts: '🎁', 'cadeaux': '🎁',
            food: '🍔', alimentation: '🍔', nourriture: '🍔', snacks: '🍔', boissons: '🍔',
            home: '🏠', maison: '🏠', deco: '🏠', 'décoration': '🏠', furniture: '🏠', meubles: '🏠',
            books: '📚', livres: '📚', librairie: '📚',
            music: '🎵', musique: '🎵',
            sports: '⚽', sport: '⚽', fitness: '⚽',
            travel: '✈️', voyage: '✈️', voyages: '✈️',
            art: '🎨', 'artisanat': '🎨',
            movies: '🍿', films: '🍿', cinéma: '🍿', cinema: '🍿',
            flowers: '🌸', fleurs: '🌸', jardin: '🌸', garden: '🌸',
            tools: '🔧', outils: '🔧', bricolage: '🔧',
            jewelry: '💍', bijoux: '💍', accessoires: '💍',
            phones: '📱', téléphones: '📱', telephones: '📱', smartphone: '📱',
            shoes: '👟', chaussures: '👟', sneakers: '👟',
            baby: '🍼', bébé: '🍼', bebe: '🍼', enfants: '🍼', kids: '🍼',
            pets: '🐾', animaux: '🐾', 'animalerie': '🐾',
        };
        const key = name.toLowerCase().trim();
        return map[key] || '📦';
    };

    return (
        <div className="db">
            <nav className="nav">
                <div className="nav-left">
                    <div className="logo">MyShop</div>
                </div>
                <div className="nav-links desktop-only">
                    <button className="nav-link active" onClick={() => navigate('/')}>Dashboard</button>
                    <button className="nav-link" onClick={() => navigate('/products')}>Products</button>
                    <button className="nav-link" onClick={() => navigate('/orders')}>Orders</button>
                    <button className="nav-link" onClick={() => navigate('/categories')}>Categories</button>
                    {isAdmin && <button className="nav-link" onClick={() => navigate('/admin')}>Admin</button>}
                </div>
                <button className="hamburger mobile-only" type="button" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Toggle menu">
                    <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
                </button>
                <div className="nav-right desktop-only">
                    <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
            </nav>
            {mobileMenuOpen && (
                <div className="mobile-menu">
                    <button className="nav-link active" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>Dashboard</button>
                    <button className="nav-link" onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}>Products</button>
                    <button className="nav-link" onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}>Orders</button>
                    <button className="nav-link" onClick={() => { navigate('/categories'); setMobileMenuOpen(false); }}>Categories</button>
                    {isAdmin && <button className="nav-link" onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}>Admin</button>}
                    <div className="mobile-menu-footer">
                        <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                        <button className="logout-btn" onClick={logout}>Logout</button>
                    </div>
                </div>
            )}

            <div className="main">
                <div className="banner">
                    <div className="banner-text">
                        <h1>Welcome back, {user?.name} 👋</h1>
                        <p>Here's what's happening in your store today.</p>
                        <span className="role-badge">{user?.role}</span>
                    </div>
                    <div className="banner-stats">
                        <div className="bstat">
                            <strong>{stats?.today_orders ?? 0}</strong>
                            <span>Orders today</span>
                        </div>
                        <div className="bstat">
                            <strong>{stats?.today_revenue ?? '0.00'} DA</strong>
                            <span>Revenue today</span>
                        </div>
                    </div>
                </div>

                <div className="stats">
                    <div className="stat">
                        <div className="stat-label">Total revenue</div>
                        <div className="stat-val">{stats?.total_revenue ?? '0.00'} DA</div>
                        <div className="stat-sub">All time</div>
                    </div>
                    <div className="stat">
                        <div className="stat-label">Total orders</div>
                        <div className="stat-val">{stats?.total_orders ?? 0}</div>
                        <div className="stat-sub">All time</div>
                    </div>
                    <div className="stat">
                        <div className="stat-label">Products</div>
                        <div className="stat-val">{stats?.total_products ?? 0}</div>
                        <div className="stat-sub">In store</div>
                    </div>
                    <div className="stat">
                        <div className="stat-label">Customers</div>
                        <div className="stat-val">{stats?.total_customers ?? 0}</div>
                        <div className="stat-sub">Registered</div>
                    </div>
                </div>

                <div className="row2">
                    <div className="panel">
                        <div className="panel-head">
                            <h3>Recent orders</h3>
                            <button className="see-all">See all →</button>
                        </div>
                        {orders.length === 0 ? (
                            <p className="empty">No orders yet.</p>
                        ) : (
                            orders.map(order => (
                                <div className="order-row" key={order.id}>
                                    <div>
                                        <div className="order-id">{order.ref}</div>
                                        <div className="order-date">{order.date}</div>
                                    </div>
                                    <span className={`pill ${order.status}`}>
                                        {order.status}
                                    </span>
                                    <div className="order-amt">{order.total}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="panel">
                        <div className="panel-head">
                            <h3>Top categories</h3>
                        </div>
                        <div className="cats">
                            {categories.length === 0 ? (
                                <p className="empty">No categories yet.</p>
                            ) : (
                                categories.map((cat, index) => (
                                    <div className="cat-row" key={index}>
                                        <div className="cat-icon" style={{background: catBgs[index] ?? '#f3f4f6'}}>
                                            {getCategoryEmoji(cat.name)}
                                        </div>
                                        <div className="cat-name">{cat.name}</div>
                                        <div className="cat-bar-wrap">
                                            <div className="cat-bar" style={{
                                                width: `${cat.percentage}%`,
                                                background: catColors[index] ?? '#0f766e'
                                            }}></div>
                                        </div>
                                        <div className="cat-count">{cat.percentage}%</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
