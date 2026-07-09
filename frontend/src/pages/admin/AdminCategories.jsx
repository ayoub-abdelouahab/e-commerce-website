import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { useToast } from '../../components/Toast';
import { getFormErrors } from '../../utils/errors';
import { required, validate } from '../../utils/validation';
import { TableSkeleton } from '../../components/Skeleton';

const formRules = { name: [required] };

const AdminCategories = () => {
    const toast = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [editing, setEditing]       = useState(null);
    const [form, setForm]             = useState({ name: '', parent_id: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [saving, setSaving]         = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const data = await getCategories();
                if (!cancelled) setCategories(data);
            } catch (err) {
                if (!cancelled) console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchCategories();
        return () => { cancelled = true; };
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', parent_id: '' });
        setFieldErrors({});
        setServerError(null);
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setForm({ name: cat.name, parent_id: cat.parent_id ?? '' });
        setFieldErrors({});
        setServerError(null);
        setShowModal(true);
    };

    const updateField = (field, value) => {
        setForm({ ...form, [field]: value });
        if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: null });
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
                await updateCategory(editing.id, form);
                toast('Category updated.');
            } else {
                await createCategory(form);
                toast('Category created.');
            }
            setShowModal(false);
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setServerError(getFormErrors(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
        try {
            await deleteCategory(id);
            toast('Category deleted.');
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            toast(err.response?.data?.message || 'Could not delete.', 'error');
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
                <TableSkeleton rows={4} cols={5} />
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
                        {serverError && <p className="admin-modal-error">{serverError}</p>}
                        <form className="admin-modal-form" onSubmit={handleSubmit} noValidate>
                            <div className="admin-mf-field">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    className={fieldErrors.name ? 'error' : ''}
                                    placeholder="e.g. Electronics"
                                    required
                                />
                                {fieldErrors.name && <span className="field-err">{fieldErrors.name}</span>}
                            </div>
                            <div className="admin-mf-field">
                                <label>Parent category <span style={{color:'#9ca3af', fontWeight:400}}>(optional)</span></label>
                                <select
                                    value={form.parent_id}
                                    onChange={e => updateField('parent_id', e.target.value)}
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
