import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [editing, setEditing]       = useState(null);
    const [form, setForm]             = useState({ name: '', parent_id: '' });
    const [error, setError]           = useState(null);
    const [saving, setSaving]         = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', parent_id: '' });
        setError(null);
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setForm({ name: cat.name, parent_id: cat.parent_id ?? '' });
        setError(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (editing) {
                await updateCategory(editing.id, form);
            } else {
                await createCategory(form);
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
        try {
            await deleteCategory(id);
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-inner">
            <div className="admin-page-header">
                <div>
                    <h1>Categories</h1>
                    <p>Organize your products into categories.</p>
                </div>
                <button className="admin-btn-add" onClick={openCreate}>+ Add Category</button>
            </div>

            {loading ? (
                <div className="admin-loading">Loading categories...</div>
            ) : categories.length === 0 ? (
                <div className="admin-empty">No categories yet.</div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Parent</th>
                                <th>Sub-categories</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id} className="admin-table-row">
                                    <td className="admin-order-id">{cat.id}</td>
                                    <td><strong>{cat.name}</strong></td>
                                    <td className="admin-order-date">{cat.slug}</td>
                                    <td>{cat.parent?.name ?? <span className="admin-tag">Top level</span>}</td>
                                    <td>{cat.children?.length ?? 0}</td>
                                    <td className="admin-order-actions" onClick={e => e.stopPropagation()}>
                                        <button className="admin-btn-edit" onClick={() => openEdit(cat)}>Edit</button>
                                        <button className="admin-btn-delete" onClick={() => handleDelete(cat.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-head">
                            <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        {error && <p className="admin-modal-error">{error}</p>}
                        <form className="admin-modal-form" onSubmit={handleSubmit}>
                            <div className="admin-mf-field">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    placeholder="e.g. Electronics"
                                    required
                                />
                            </div>
                            <div className="admin-mf-field">
                                <label>Parent category <span style={{color:'#9ca3af', fontWeight:400}}>(optional)</span></label>
                                <select
                                    value={form.parent_id}
                                    onChange={e => setForm({...form, parent_id: e.target.value})}
                                >
                                    <option value="">None (top level)</option>
                                    {categories
                                        .filter(c => c.id !== editing?.id)
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="admin-modal-btns">
                                <button type="button" className="admin-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="admin-btn-save" disabled={saving}>
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

export default AdminCategories;