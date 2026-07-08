import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getCategories } from '../api/categories';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [showModal, setShowModal]   = useState(false);
    const [editing, setEditing]       = useState(null);
    const [form, setForm]             = useState({
        name: '', description: '', price: '',
        compare_price: '', stock_qty: '', category_id: '', is_active: true,
    });
    const [error, setError]   = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts({ search, category_id: categoryId });
            setProducts(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategories().then(data => setCategories(data));
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [search, categoryId]);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', price: '', compare_price: '', stock_qty: '', category_id: '', is_active: true });
        setError(null);
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setForm({
            name:          product.name,
            description:   product.description ?? '',
            price:         product.price,
            compare_price: product.compare_price ?? '',
            stock_qty:     product.stock_qty,
            category_id:   product.category_id ?? '',
            is_active:     product.is_active,
        });
        setError(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (editing) {
                await updateProduct(editing.id, form);
            } else {
                await createProduct(form);
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await deleteProduct(id);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="pp-page">
            <nav className="nav">
                <div className="nav-left">
                    <div className="logo">MyShop</div>
                    <div className="nav-links">
                        <button className="nav-link" onClick={() => navigate('/')}>Dashboard</button>
                        <button className="nav-link active" onClick={() => navigate('/products')}>Products</button>
                        <button className="nav-link" onClick={() => navigate('/orders')}>Orders</button>
                        <button className="nav-link" onClick={() => navigate(isAdmin ? '/admin/categories' : '/products')}>Categories</button>
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

            <div className="pp-main">
                <div className="pp-header">
                    <div>
                        <h1>{isAdmin ? 'Manage Products' : 'Browse Products'}</h1>
                        <p>{isAdmin ? 'Add, edit or remove products from your store.' : "Find what you're looking for."}</p>
                    </div>
                    {isAdmin && (
                        <button className="btn-add" onClick={openCreate}>+ Add Product</button>
                    )}
                </div>

                <div className="pp-filters">
                    <input
                        className="pp-search"
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="pp-select"
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                    >
                        <option value="">All categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="pp-loading">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="pp-empty">No products found.</div>
                ) : (
                    <div className="pp-grid">
                        {products.map(product => (
                            <div className="pp-card" key={product.id}>
                                <div className="pp-card-body">
                                    <div className="pp-card-top">
                                        <span className="pp-category">
                                            {product.category?.name ?? 'Uncategorized'}
                                        </span>
                                        {!product.is_active && (
                                            <span className="pp-inactive">Inactive</span>
                                        )}
                                    </div>
                                    <h3 className="pp-name">{product.name}</h3>
                                    <p className="pp-desc">{product.description ?? '—'}</p>
                                    <div className="pp-footer">
                                        <div className="pp-prices">
                                            <span className="pp-price">${product.price}</span>
                                            {product.compare_price && (
                                                <span className="pp-compare">${product.compare_price}</span>
                                            )}
                                        </div>
                                        <span className="pp-stock">
                                            {product.stock_qty > 0
                                                ? `${product.stock_qty} in stock`
                                                : 'Out of stock'}
                                        </span>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="pp-actions">
                                        <button className="btn-edit" onClick={() => openEdit(product)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {error && <p className="modal-error">{error}</p>}

                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="mf-row">
                                <div className="mf-field">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({...form, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mf-field">
                                    <label>Category</label>
                                    <select
                                        value={form.category_id}
                                        onChange={e => setForm({...form, category_id: e.target.value})}
                                    >
                                        <option value="">None</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mf-field">
                                <label>Description</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                />
                            </div>

                            <div className="mf-row">
                                <div className="mf-field">
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.price}
                                        onChange={e => setForm({...form, price: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mf-field">
                                    <label>Compare price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.compare_price}
                                        onChange={e => setForm({...form, compare_price: e.target.value})}
                                    />
                                </div>
                                <div className="mf-field">
                                    <label>Stock</label>
                                    <input
                                        type="number"
                                        value={form.stock_qty}
                                        onChange={e => setForm({...form, stock_qty: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mf-check">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={e => setForm({...form, is_active: e.target.checked})}
                                />
                                <label htmlFor="is_active">Active (visible to customers)</label>
                            </div>

                            <div className="modal-btns">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;