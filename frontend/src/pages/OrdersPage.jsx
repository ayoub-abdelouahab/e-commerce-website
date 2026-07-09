import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders, updateOrderStatus } from '../api/orders';
import { useToast } from '../components/Toast';
import { TableSkeleton } from '../components/Skeleton';
import '../styles/OrdersPage.css';

const statusColors = {
    pending:    { bg: '#fef3c7', color: '#92400e' },
    confirmed:  { bg: '#d1fae5', color: '#065f46' },
    rejected:   { bg: '#fee2e2', color: '#991b1b' },
    processing: { bg: '#dbeafe', color: '#1e40af' },
    shipped:    { bg: '#ede9fe', color: '#5b21b6' },
    delivered:  { bg: '#d1fae5', color: '#065f46' },
    cancelled:  { bg: '#fee2e2', color: '#991b1b' },
};

const paymentColors = {
    unpaid:   { bg: '#fee2e2', color: '#991b1b' },
    paid:     { bg: '#d1fae5', color: '#065f46' },
    refunded: { bg: '#fef3c7', color: '#92400e' },
};

const OrdersPage = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [orders, setOrders]               = useState([]);
    const [loading, setLoading]             = useState(true);
    const [statusFilter, setStatusFilter]   = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [selected, setSelected]           = useState(null);
    const [openMenuId, setOpenMenuId]       = useState(null);
    const [savingId, setSavingId]           = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await getOrders({
                    status: statusFilter,
                    payment_status: paymentFilter,
                });
                if (!cancelled) setOrders(data.data);
            } catch (err) {
                if (!cancelled) console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchOrders();
        return () => { cancelled = true; };
    }, [statusFilter, paymentFilter]);

    const refresh = async () => {
        const data = await getOrders({ status: statusFilter, payment_status: paymentFilter });
        setOrders(data.data ?? data);
    };

    const defaultDeliveryTime = () => {
        const t = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        return t.toISOString().slice(0, 16);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const toggleMenu = (orderId) => {
        setOpenMenuId(prev => (prev === orderId ? null : orderId));
    };

    // Apply any status chosen from the Treat dropdown
    const handleTreat = async (order, status) => {
        setOpenMenuId(null);
        setSavingId(order.id);
        try {
            const payload = status === 'confirmed' ? defaultDeliveryTime() : undefined;
            await updateOrderStatus(order.id, status, payload);
            toast(`Order #${order.id} ${status}.`);
            await refresh();
        } catch (err) {
            toast(err.response?.data?.message || 'Could not update order.', 'error');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="op-page">
            <nav className="nav">
                <div className="nav-left">
                    <div className="logo">MyShop</div>
                    <div className="nav-links">
                        <button className="nav-link" onClick={() => navigate('/')}>Dashboard</button>
                        <button className="nav-link" onClick={() => navigate('/products')}>Products</button>
                        <button className="nav-link active" onClick={() => navigate('/orders')}>Orders</button>
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

            <div className="op-main">
                <div className="op-header">
                    <div>
                        <h1>{isAdmin ? 'Manage Orders' : 'My Orders'}</h1>
                        <p>{isAdmin ? 'View and update all customer orders.' : 'Track your order history.'}</p>
                    </div>
                </div>

                <div className="op-filters">
                    <select
                        className="op-select"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        className="op-select"
                        value={paymentFilter}
                        onChange={e => setPaymentFilter(e.target.value)}
                    >
                        <option value="">All payments</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                {loading ? (
                    <TableSkeleton rows={5} cols={isAdmin ? 7 : 5} />
                ) : orders.length === 0 ? (
                    <div className="op-empty">No orders found.</div>
                ) : (
                    <div className="op-table-wrap">
                        <table className="op-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    {isAdmin && <th>Customer</th>}
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Total</th>
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, idx) => {
                                    const isLast = idx === orders.length - 1;
                                    return (
                                    <tr key={order.id} onClick={() => setSelected(order)} className="op-row">
                                        <td className="op-id">
                                            #ORD-{String(order.id).padStart(4, '0')}
                                        </td>
                                        {isAdmin && (
                                            <td className="op-customer">{order.user?.name ?? '—'}</td>
                                        )}
                                        <td className="op-date">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <span className="op-pill" style={statusColors[order.status]}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="op-pill" style={paymentColors[order.payment_status]}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="op-total">{order.total} DA</td>
                                        {isAdmin && (
                                            <td className="op-actions" onClick={e => e.stopPropagation()}>
                                                <div className="op-menu" ref={openMenuId === order.id ? menuRef : null}>
                                                    <button
                                                        className="op-treat-btn"
                                                        onClick={() => toggleMenu(order.id)}
                                                        disabled={savingId === order.id}
                                                        aria-label="Treat order"
                                                    >
                                                        Treat
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="6 9 12 15 18 9" />
                                                        </svg>
                                                    </button>

                                                    {openMenuId === order.id && (
                                                        <div className={`op-dropdown${isLast ? ' op-drop-up' : ''}`}>
                                                            <button
                                                                className="op-drop-item op-drop-confirm"
                                                                onClick={() => handleTreat(order, 'confirmed')}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                                Confirm
                                                            </button>
                                                            <button
                                                                className="op-drop-item op-drop-reject"
                                                                onClick={() => handleTreat(order, 'rejected')}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                                Reject
                                                            </button>
                                                            <button
                                                                className="op-drop-item op-drop-process"
                                                                onClick={() => handleTreat(order, 'processing')}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                                                                Processing
                                                            </button>
                                                            <button
                                                                className="op-drop-item op-drop-view"
                                                                onClick={() => { setOpenMenuId(null); setSelected(order); }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                                                View Details
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <h2>#ORD-{String(selected.id).padStart(4, '0')}</h2>
                            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="od-grid">
                            <div className="od-row">
                                <span>Customer</span>
                                <strong>{selected.user?.name ?? '—'}</strong>
                            </div>
                            <div className="od-row">
                                <span>Date</span>
                                <strong>{new Date(selected.created_at).toLocaleDateString()}</strong>
                            </div>
                            <div className="od-row">
                                <span>Status</span>
                                <span className="op-pill" style={statusColors[selected.status]}>
                                    {selected.status}
                                </span>
                            </div>
                            <div className="od-row">
                                <span>Payment</span>
                                <span className="op-pill" style={paymentColors[selected.payment_status]}>
                                    {selected.payment_status}
                                </span>
                            </div>
                            <div className="od-row">
                                <span>Subtotal</span>
                                <strong>{selected.subtotal} DA</strong>
                            </div>
                            <div className="od-row">
                                <span>Shipping</span>
                                <strong>{selected.shipping_cost} DA</strong>
                            </div>
                            <div className="od-row">
                                <span>Total</span>
                                <strong className="od-total">{selected.total} DA</strong>
                            </div>
                            {selected.delivery_time && (
                                <div className="od-row">
                                    <span>Delivery by</span>
                                    <strong>{new Date(selected.delivery_time).toLocaleString()}</strong>
                                </div>
                            )}
                            {selected.notes && (
                                <div className="od-row">
                                    <span>Notes</span>
                                    <strong>{selected.notes}</strong>
                                </div>
                            )}
                            {selected.items?.length > 0 && (
                                <div className="od-items">
                                    <span>Items</span>
                                    <div className="od-items-list">
                                        {selected.items.map((item, i) => (
                                            <div key={i} className="od-item">
                                                <span>{item.product?.name ?? 'Product #'+item.product_id}</span>
                                                <span>{item.quantity} x {item.unit_price} DA</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
