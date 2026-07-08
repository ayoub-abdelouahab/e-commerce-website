import { useEffect, useState } from 'react';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../api/products';
import { getCategories } from '../../api/categories';

const emptyForm = {
    name: '',
    description: '',
    price: '',
    compare_price: '',
    stock_qty: '',
    category_id: '',
    is_active: true,
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts({ search, category_id: categoryId });
            setProducts(data.data ?? data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategories().then(setCategories).catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        loadProducts();
    }, [search, categoryId]);

    const startCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setError('');
    };

    const startEdit = (product) => {
        setEditing(product);
        setForm({
            name: product.name ?? '',
            description: product.description ?? '',
            price: product.price ?? '',
            compare_price: product.compare_price ?? '',
            stock_qty: product.stock_qty ?? '',
            category_id: product.category_id ?? '',
            is_active: Boolean(product.is_active),
        });
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (editing) {
                await updateProduct(editing.id, form);
            } else {
                await createProduct(form);
            }

            setEditing(null);
            setForm(emptyForm);
            await loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save product.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product) => {
        if (!confirm(`Delete ${product.name}?`)) return;

        try {
            await deleteProduct(product.id);
            await loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not delete product.');
        }
    };

    return (
        <section className="admin-grid-page">
            <div className="admin-stack">
                <div className="admin-page-head">
                    <div>
                        <span className="admin-kicker">Catalog</span>
                        <h2>Products</h2>
                    </div>
                    <button className="admin-primary-btn" type="button" onClick={startCreate}>
                        New Product
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

                {error && <div className="admin-alert">{error}</div>}

                <section className="admin-panel">
                    {loading ? (
                        <div className="admin-loading">Loading products...</div>
                    ) : products.length === 0 ? (
                        <p className="admin-empty">No products found.</p>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <strong>{product.name}</strong>
                                                <span>{product.description || 'No description'}</span>
                                            </td>
                                            <td>{product.category?.name || 'Uncategorized'}</td>
                                            <td>${product.price}</td>
                                            <td>{product.stock_qty}</td>
                                            <td>
                                                <span className={`admin-pill ${product.is_active ? 'paid' : 'unpaid'}`}>
                                                    {product.is_active ? 'active' : 'inactive'}
                                                </span>
                                            </td>
                                            <td className="admin-actions">
                                                <button type="button" onClick={() => startEdit(product)}>Edit</button>
                                                <button type="button" className="danger" onClick={() => handleDelete(product)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            <aside className="admin-form-panel">
                <h3>{editing ? 'Edit product' : 'Create product'}</h3>
                <form className="admin-form" onSubmit={handleSubmit}>
                    <label>
                        Name
                        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                    </label>
                    <label>
                        Category
                        <select value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })}>
                            <option value="">None</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Description
                        <textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                    </label>
                    <div className="admin-form-row">
                        <label>
                            Price
                            <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
                        </label>
                        <label>
                            Compare
                            <input type="number" min="0" step="0.01" value={form.compare_price} onChange={(event) => setForm({ ...form, compare_price: event.target.value })} />
                        </label>
                    </div>
                    <label>
                        Stock
                        <input type="number" min="0" value={form.stock_qty} onChange={(event) => setForm({ ...form, stock_qty: event.target.value })} required />
                    </label>
                    <label className="admin-check">
                        <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
                        Active
                    </label>
                    <div className="admin-form-actions">
                        {editing && <button type="button" onClick={startCreate}>Cancel</button>}
                        <button className="admin-primary-btn" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </aside>
        </section>
    );
};

export default AdminProducts;
