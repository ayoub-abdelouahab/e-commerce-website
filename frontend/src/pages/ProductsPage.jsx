import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getCategories } from '../api/categories';
import { useToast } from '../components/Toast';
import { getFieldError, getFormErrors } from '../utils/errors';
import { required, numeric, min, validate } from '../utils/validation';
import { CardSkeleton } from '../components/Skeleton';
import '../styles/ProductsPage.css';

const formRules = {
    name: [required],
    price: [required, numeric, min(0)],
    stock_qty: [required, numeric, min(0)],
};

const emptyForm = {
    name: '', description: '', image: null,
    price: '', compare_price: '', stock_qty: '', category_id: '', is_active: true,
};

const ProductsPage = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const toast = useToast();
    const fileRef = useRef(null);

    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
    const [showModal, setShowModal]   = useState(false);
    const [editing, setEditing]       = useState(null);
    const [form, setForm]             = useState(emptyForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const cartData = cart.map(item => ({ product_id: item.product_id, name: item.name, price: item.price, quantity: item.quantity }));

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
        let cancelled = false;
        getCategories().then(data => { if (!cancelled) setCategories(data); });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetchProducts().then(() => { if (cancelled) return; }); // eslint-disable-line react-hooks/set-state-in-effect
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, categoryId]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFieldErrors({});
        setServerError(null);
        setPreview(null);
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setForm({
            name:          product.name,
            description:   product.description ?? '',
            image:         null,
            price:         product.price,
            compare_price: product.compare_price ?? '',
            stock_qty:     product.stock_qty,
            category_id:   product.category_id ?? '',
            is_active:     product.is_active,
        });
        setPreview(product.image ? product.image : null);
        setFieldErrors({});
        setServerError(null);
        setShowModal(true);
    };

    const handleImage = (file) => {
        if (!file) return;
        setForm({ ...form, image: file });
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleImage(e.dataTransfer.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form, formRules);
        if (errs) { setFieldErrors(errs); return; }

        setSaving(true);
        setServerError(null);
        setFieldErrors({});
        try {
            if (editing) {
                await updateProduct(editing.id, form);
                toast('Product updated.');
            } else {
                await createProduct(form);
                toast('Product created.');
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            setServerError(getFormErrors(err));
            const fieldErr = {};
            if (err?.response?.data?.errors) {
                for (const field of Object.keys(formRules)) {
                    const msg = getFieldError(err, field);
                    if (msg) fieldErr[field] = msg;
                }
            }
            setFieldErrors(fieldErr);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await deleteProduct(id);
            toast('Product deleted.');
            fetchProducts();
        } catch (err) {
            toast(err.response?.data?.message || 'Could not delete.', 'error');
        }
    };

    const updateField = (field, value) => {
        setForm({ ...form, [field]: value });
        if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: null });
    };

    const imgSrc = (product) => {
        if (!product.image) return null;
        return product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`;
    };

    // ── Cart ──
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
        setShowCart(true);
    };

    const updateQty = (productId, qty) => {
        if (qty < 1) {
            setCart(prev => prev.filter(item => item.product_id !== productId));
            return;
        }
        setCart(prev => prev.map(item =>
            item.product_id === productId ? { ...item, quantity: qty } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = cartTotal >= 5000 ? 0 : 500;
    const grandTotal = cartTotal + shipping;

    const goToCheckout = () => {
        if (cart.length === 0) return;
        navigate('/checkout', { state: { cart: cartData } });
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
                        <button className="nav-link" onClick={() => navigate('/categories')}>Categories</button>
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
                        onChange={e => {
                            const val = e.target.value;
                            setCategoryId(val);
                            setSearchParams(val ? { category: val } : {});
                        }}
                    >
                        <option value="">All categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="pp-grid">
                        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="pp-empty">No products found.</div>
                ) : (
                    <div className="pp-grid">
                        {products.map(product => (
                            <div className="pp-card" key={product.id}>
                                {imgSrc(product) && (
                                    <div className="pp-card-img">
                                        <img src={imgSrc(product)} alt={product.name} />
                                    </div>
                                )}
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
                                            <span className="pp-price">{product.price} DA</span>
                                            {product.compare_price && (
                                                <span className="pp-compare">{product.compare_price} DA</span>
                                            )}
                                        </div>
                                        <span className="pp-stock">
                                            {product.stock_qty > 0
                                                ? `${product.stock_qty} in stock`
                                                : 'Out of stock'}
                                        </span>
                                    </div>
                                </div>
                                <div className="pp-actions">
                                    {isAdmin ? (
                                        <>
                                            <button className="btn-edit" onClick={() => openEdit(product)}>Edit</button>
                                            <button className="btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                                        </>
                                    ) : product.stock_qty > 0 ? (
                                        <button className="btn-add-cart" onClick={() => addToCart(product)}>Add to Cart</button>
                                    ) : (
                                        <button className="btn-add-cart" disabled>Out of Stock</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Cart sidebar ── */}
            <div className={`cart-overlay${showCart ? ' open' : ''}`} onClick={() => setShowCart(false)} />
            <aside className={`cart-sidebar${showCart ? ' open' : ''}`}>
                <div className="cart-head">
                    <h3>Your Cart ({cart.length})</h3>
                    <button className="cart-close" onClick={() => setShowCart(false)}>&#10005;</button>
                </div>
                {cart.length === 0 ? (
                    <div className="cart-empty">Your cart is empty.</div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cart.map(item => (
                                <div key={item.product_id} className="cart-item">
                                    <div className="cart-item-info">
                                        <strong>{item.name}</strong>
                                        <span>{item.price} DA each</span>
                                    </div>
                                    <div className="cart-item-ctrl">
                                        <button className="cart-qty-btn" onClick={() => updateQty(item.product_id, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button className="cart-qty-btn" onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                                        <button className="cart-remove" onClick={() => removeFromCart(item.product_id)}>&#10005;</button>
                                    </div>
                                    <div className="cart-item-total">{(item.price * item.quantity).toFixed(2)} DA</div>
                                </div>
                            ))}
                        </div>
                        <div className="cart-summary">
                            <div className="cart-summary-row">
                                <span>Subtotal</span>
                                <span>{cartTotal.toFixed(2)} DA</span>
                            </div>
                            <div className="cart-summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Free' : `${shipping.toFixed(2)} DA`}</span>
                            </div>
                            {shipping > 0 && (
                                <div className="cart-free-note">Free shipping on orders over 5,000 DA</div>
                            )}
                            <div className="cart-summary-row cart-total-row">
                                <span>Total</span>
                                <span>{grandTotal.toFixed(2)} DA</span>
                            </div>
                            <button className="btn-place-order" onClick={goToCheckout}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </aside>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&#10005;</button>
                        </div>

                        {serverError && <p className="modal-error">{serverError}</p>}

                        <form className="modal-form" onSubmit={handleSubmit} noValidate>
                            <div className="mf-row">
                                <div className="mf-field">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => updateField('name', e.target.value)}
                                        className={fieldErrors.name ? 'error' : ''}
                                        required
                                    />
                                    {fieldErrors.name && <span className="field-err">{fieldErrors.name}</span>}
                                </div>
                                <div className="mf-field">
                                    <label>Category</label>
                                    <select
                                        value={form.category_id}
                                        onChange={e => updateField('category_id', e.target.value)}
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
                                    onChange={e => updateField('description', e.target.value)}
                                />
                            </div>

                            <div className="mf-field">
                                <label>Image</label>
                                <div
                                    className={`drop-zone${dragOver ? ' drag-over' : ''}`}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileRef.current?.click()}
                                >
                                    {preview ? (
                                        <img src={preview} alt="preview" className="drop-preview" />
                                    ) : (
                                        <p>Drag & drop an image here, or click to browse</p>
                                    )}
                                </div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                    style={{ display: 'none' }}
                                    onChange={e => handleImage(e.target.files[0])}
                                />
                            </div>

                            <div className="mf-row">
                                <div className="mf-field">
                                    <label>Price (DA)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.price}
                                        onChange={e => updateField('price', e.target.value)}
                                        className={fieldErrors.price ? 'error' : ''}
                                        required
                                    />
                                    {fieldErrors.price && <span className="field-err">{fieldErrors.price}</span>}
                                </div>
                                <div className="mf-field">
                                    <label>Compare price (DA)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.compare_price}
                                        onChange={e => updateField('compare_price', e.target.value)}
                                    />
                                </div>
                                <div className="mf-field">
                                    <label>Stock</label>
                                    <input
                                        type="number"
                                        value={form.stock_qty}
                                        onChange={e => updateField('stock_qty', e.target.value)}
                                        className={fieldErrors.stock_qty ? 'error' : ''}
                                        required
                                    />
                                    {fieldErrors.stock_qty && <span className="field-err">{fieldErrors.stock_qty}</span>}
                                </div>
                            </div>

                            <div className="mf-check">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={e => updateField('is_active', e.target.checked)}
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
