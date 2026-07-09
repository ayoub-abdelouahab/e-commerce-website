import { useEffect, useState, useRef } from 'react';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import { useToast } from '../../components/Toast';
import { getFieldError, getFormErrors } from '../../utils/errors';
import { required, numeric, min, validate } from '../../utils/validation';
import { TableSkeleton } from '../../components/Skeleton';

const emptyForm = {
    name: '', description: '', image: null,
    compare_price: '', stock_qty: '', category_id: '', is_active: true,
};

const formRules = {
    name: [required],
    price: [required, numeric, min(0)],
    stock_qty: [required, numeric, min(0)],
};

const AdminProducts = () => {
    const toast = useToast();
    const fileRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [preview, setPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [price, setPrice] = useState('');

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts({ search, category_id: categoryId });
            setProducts(data.data ?? data);
        } catch (err) {
            setServerError(err.response?.data?.message || 'Could not load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        getCategories().then(data => { if (!cancelled) setCategories(data); }).catch(() => {});
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        let cancelled = false;
        loadProducts().then(() => { if (cancelled) return; }); // eslint-disable-line react-hooks/set-state-in-effect
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, categoryId]);

    const [drawerOpen, setDrawerOpen] = useState(false);

    const openDrawer = (product = null) => {
        if (product) {
            startEdit(product);
        } else {
            startCreate();
        }
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setEditing(null);
        setForm(emptyForm);
        setPrice('');
        setPreview(null);
        setFieldErrors({});
        setServerError('');
    };

    const startCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setPrice('');
        setFieldErrors({});
        setServerError('');
        setPreview(null);
    };

    const startEdit = (product) => {
        setEditing(product);
        setForm({
            name: product.name ?? '',
            description: product.description ?? '',
            image: null,
            compare_price: product.compare_price ?? '',
            stock_qty: product.stock_qty ?? '',
            category_id: product.category_id ?? '',
            is_active: Boolean(product.is_active),
        });
        setPrice(product.price ?? '');
        setPreview(product.image ? product.image : null);
        setFieldErrors({});
        setServerError('');
    };

    const updateField = (field, value) => {
        setForm({ ...form, [field]: value });
        if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: null });
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = { ...form, price };
        const errs = validate(data, formRules);
        if (errs) { setFieldErrors(errs); return; }

        setSaving(true);
        setServerError('');
        setFieldErrors({});

        try {
            if (editing) {
                await updateProduct(editing.id, data);
                toast('Product updated.');
            } else {
                await createProduct(data);
                toast('Product created.');
            }

            setEditing(null);
            setForm(emptyForm);
            setPrice('');
            setPreview(null);
            setDrawerOpen(false);
            await loadProducts();
        } catch (err) {
            setServerError(getFormErrors(err));
            const fe = {};
            if (err?.response?.data?.errors) {
                for (const field of Object.keys(formRules)) {
                    const msg = getFieldError(err, field);
                    if (msg) fe[field] = msg;
                }
            }
            setFieldErrors(fe);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product) => {
        if (!confirm(`Delete ${product.name}?`)) return;
        try {
            await deleteProduct(product.id);
            toast('Product deleted.');
            await loadProducts();
        } catch (err) {
            toast(err.response?.data?.message || 'Could not delete.', 'error');
        }
    };

    const imgUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `http://127.0.0.1:8000${path}`;
    };

    return (
        <section className="admin-stack">
            <div className="admin-page-head">
                <div>
                    <span className="admin-kicker">Catalog</span>
                    <h2>Products</h2>
                </div>
                <button className="admin-primary-btn" type="button" onClick={() => openDrawer()}>
                    + New Product
                </button>
            </div>

            <div className="admin-filters">
                <input
                    type="search"
                    placeholder="Search products"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
            </div>

            {serverError && !loading && <div className="admin-alert">{serverError}</div>}

            <section className="admin-panel" style={{ padding: 0 }}>
                {loading ? (
                    <TableSkeleton rows={5} cols={6} />
                ) : products.length === 0 ? (
                    <p className="admin-empty">No products found.</p>
                ) : (
                    <div className="admin-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 56 }}>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th style={{ width: 140 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            {imgUrl(product.image) ? (
                                                <img src={imgUrl(product.image)} alt={product.name} className="admin-thumb" />
                                            ) : (
                                                <span className="admin-thumb admin-thumb-empty">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <strong>{product.name}</strong>
                                            <span>{product.description || 'No description'}</span>
                                        </td>
                                        <td>{product.category?.name || 'Uncategorized'}</td>
                                        <td>{product.price} DA</td>
                                        <td>{product.stock_qty}</td>
                                        <td>
                                            <span className={`admin-pill ${product.is_active ? 'active' : 'inactive'}`}>
                                                {product.is_active ? 'active' : 'inactive'}
                                            </span>
                                        </td>
                                        <td className="admin-actions">
                                            <button className="admin-btn-edit" type="button" onClick={() => openDrawer(product)}>Edit</button>
                                            <button className="admin-btn-delete" type="button" onClick={() => handleDelete(product)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ── Slide-over drawer ── */}
            <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={closeDrawer} />
            <div className={`drawer${drawerOpen ? ' open' : ''}`}>
                <div className="drawer-head">
                    <h3>{editing ? 'Edit product' : 'New product'}</h3>
                    <button className="drawer-close" onClick={closeDrawer}>&#10005;</button>
                </div>
                <form className="drawer-body" onSubmit={handleSubmit} noValidate>
                    <div className="admin-form">
                        <label>
                            Name
                            <input
                                value={form.name}
                                onChange={(event) => updateField('name', event.target.value)}
                                className={fieldErrors.name ? 'error' : ''}
                                required
                            />
                            {fieldErrors.name && <span className="field-err">{fieldErrors.name}</span>}
                        </label>
                        <label>
                            Category
                            <select value={form.category_id} onChange={(event) => updateField('category_id', event.target.value)}>
                                <option value="">None</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Description
                            <textarea rows="4" value={form.description} onChange={(event) => updateField('description', event.target.value)} />
                        </label>
                        <label>
                            Image
                            <div
                                className={`drop-zone${dragOver ? ' drag-over' : ''}`}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileRef.current?.click()}
                            >
                                {preview ? (
                                    typeof preview === 'string' && preview.startsWith('/') ? (
                                        <img src={`http://127.0.0.1:8000${preview}`} alt="preview" className="drop-preview" />
                                    ) : (
                                        <img src={preview} alt="preview" className="drop-preview" />
                                    )
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
                        </label>
                        <div className="admin-form-row">
                            <label>
                                Price (DA)
                                <input
                                    type="number" min="0" step="0.01"
                                    value={price}
                                    onChange={(event) => { setPrice(event.target.value); if (fieldErrors.price) setFieldErrors({ ...fieldErrors, price: null }); }}
                                    className={fieldErrors.price ? 'error' : ''}
                                    required
                                />
                                {fieldErrors.price && <span className="field-err">{fieldErrors.price}</span>}
                            </label>
                            <label>
                                Compare (DA)
                                <input type="number" min="0" step="0.01" value={form.compare_price} onChange={(event) => updateField('compare_price', event.target.value)} />
                            </label>
                        </div>
                        <label>
                            Stock
                            <input
                                type="number" min="0"
                                value={form.stock_qty}
                                onChange={(event) => updateField('stock_qty', event.target.value)}
                                className={fieldErrors.stock_qty ? 'error' : ''}
                                required
                            />
                            {fieldErrors.stock_qty && <span className="field-err">{fieldErrors.stock_qty}</span>}
                        </label>
                        <label className="admin-check">
                            <input type="checkbox" checked={form.is_active} onChange={(event) => updateField('is_active', event.target.checked)} />
                            Active
                        </label>
                    </div>
                    <div className="drawer-foot">
                        <button type="button" className="btn-drawer-cancel" onClick={closeDrawer}>Cancel</button>
                        <button type="submit" className="btn-drawer-save" disabled={saving}>
                            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default AdminProducts;
