import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders, updateOrderStatus, updateOrderPayment } from '../api/orders';
import '../styles/OrdersPage.css';

const statusColors = {
    pending:    { bg: '#fef3c7', color: '#92400e' },
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

    const [orders, setOrders]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [statusFilter, setStatusFilter]   = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [selected, setSelected]     = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders({
                status: statusFilter,
                payment_status: paymentFilter,
            });
            setOrders(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, paymentFilter]);

    const handleStatusChange = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            fetchOrders();
            if (selected?.id === id) {
                setSelected(prev => ({ ...prev, status }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePaymentChange = async (id, payment_status) => {
        try {
            await updateOrderPayment(id, payment_status);
            fetchOrders();
            if (selected?.id === id) {
                setSelected(prev => ({ ...prev, payment_status }));
            }
        } catch (err) {
            console.error(err);
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

            <div className="op-main">
                <div className="op-header">
                    <div>
                        <h1>{isAdmin ? 'Manage Orders' : 'My Orders'}</h1>
                        <p>{isAdmin ? 'View and update all customer orders.' : 'Track your order history.'}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="op-filters">
                    <select
                        className="op-select"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
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

                {/* Table */}
                {loading ? (
                    <div className="op-loading">Loading orders...</div>
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
                                {orders.map(order => (
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
                                        <td className="op-total">${order.total}</td>
                                        {isAdmin && (
                                            <td className="op-actions" onClick={e => e.stopPropagation()}>
                                                <select
                                                    className="op-action-select"
                                                    value={order.status}
                                                    onChange={e => handleStatusChange(order.id, e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <select
                                                    className="op-action-select"
                                                    value={order.payment_status}
                                                    onChange={e => handlePaymentChange(order.id, e.target.value)}
                                                >
                                                    <option value="unpaid">Unpaid</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order detail modal */}
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
                                <strong>${selected.subtotal}</strong>
                            </div>
                            <div className="od-row">
                                <span>Shipping</span>
                                <strong>${selected.shipping_cost}</strong>
                            </div>
                            <div className="od-row">
                                <span>Total</span>
                                <strong className="od-total">${selected.total}</strong>
                            </div>
                            {selected.notes && (
                                <div className="od-row">
                                    <span>Notes</span>
                                    <strong>{selected.notes}</strong>
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