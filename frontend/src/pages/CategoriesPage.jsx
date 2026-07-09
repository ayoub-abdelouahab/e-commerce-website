import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../api/categories';
import { CardSkeleton } from '../components/Skeleton';
import '../styles/CategoriesPage.css';

const bgColors = ['#f0fdf9','#fdf4ff','#fff7ed','#fef2f2','#eff6ff','#faf5ff','#f0f9ff','#fefce8','#ecfdf5','#fef9c3','#fce7f3','#dbeafe'];

const categoryEmojis = {
    clothes: '👕', cloths: '👕', 'vêtements': '👕', 'vetements': '👕', fashion: '👕', mode: '👕',
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

const getCategoryEmoji = (name) => {
    if (!name) return '📦';
    const key = name.toLowerCase().trim();
    return categoryEmojis[key] || '📦';
};

const CategoriesPage = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getCategories().then((data) => {
            if (!cancelled) setCategories(data);
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="cp-page">
            <nav className="nav">
                <div className="nav-left">
                    <div className="logo">MyShop</div>
                    <div className="nav-links">
                        <button className="nav-link" onClick={() => navigate('/')}>Dashboard</button>
                        <button className="nav-link" onClick={() => navigate('/products')}>Products</button>
                        <button className="nav-link" onClick={() => navigate('/orders')}>Orders</button>
                        <button className="nav-link active">Categories</button>
                        {isAdmin && <button className="nav-link" onClick={() => navigate('/admin')}>Admin</button>}
                    </div>
                </div>
                <div className="nav-right">
                    <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
            </nav>

            <div className="cp-main">
                <div className="cp-header">
                    <h1>Categories</h1>
                    <p>Browse our product categories.</p>
                </div>

                {loading ? (
                    <div className="cp-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="cp-empty">No categories available.</div>
                ) : (
                    <div className="cp-grid">
                        {categories.map((cat, i) => (
                            <div key={cat.id} className="cp-card" onClick={() => navigate(`/products?category=${cat.id}`)} style={{ cursor: 'pointer' }}>
                                <div className="cp-card-icon" style={{ background: bgColors[i % bgColors.length] }}>
                                    {getCategoryEmoji(cat.name)}
                                </div>
                                <h3>{cat.name}</h3>
                                {cat.children?.length > 0 && (
                                    <div className="cp-subs">
                                        {cat.children.map((child) => (
                                            <span key={child.id} className="cp-sub" onClick={e => { e.stopPropagation(); navigate(`/products?category=${child.id}`); }}>{child.name}</span>
                                        ))}
                                    </div>
                                )}
                                {cat.products_count !== undefined && (
                                    <span className="cp-count">{cat.products_count} products</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;
