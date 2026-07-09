import { useEffect, useState, useRef } from 'react';
import { getOrders, updateOrderStatus, updateOrderPayment } from '../../api/orders';
import { useToast } from '../../components/Toast';
import { TableSkeleton } from '../../components/Skeleton';

const statusOptions = ['pending', 'confirmed', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentOptions = ['unpaid', 'paid', 'refunded'];

const pillClass = (value) => `pill-${value}`;

const AdminOrders = () => {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');
    const [treatOrder, setTreatOrder] = useState(null);
    const [deliveryTime, setDeliveryTime] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null); // { type: 'status'|'payment', orderId }
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        let cancelled = false;
        const loadOrders = async () => {
            setLoading(true);
            try {
                const data = await getOrders();
                if (!cancelled) setOrders(data.data ?? data);
            } catch (err) {
                if (!cancelled) setError(err.response?.data?.message || 'Could not load orders.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadOrders();
        return () => { cancelled = true; };
    }, []);

    const handleStatusUpdate = async (order, status) => {
        setSavingId(order.id);
        setOpenDropdown(null);
        setError('');
        try {
            await updateOrderStatus(order.id, status);
            toast(`Order #${order.id} ${status}.`);
            const data = await getOrders();
            setOrders(data.data ?? data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update order.');
        } finally {
            setSavingId(null);
        }
    };

    const handlePaymentUpdate = async (order, payment_status) => {
        setSavingId(order.id);
        setOpenDropdown(null);
        setError('');
        try {
            await updateOrderPayment(order.id, payment_status);
            toast(`Order #${order.id} payment ${payment_status}.`);
            const data = await getOrders();
            setOrders(data.data ?? data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update order.');
        } finally {
            setSavingId(null);
        }
    };

    const defaultDeliveryTime = () => {
        const defaultTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        return defaultTime.toISOString().slice(0, 16);
    };

    const openTreat = (order) => {
        setDeliveryTime(defaultDeliveryTime());
        setTreatOrder(order);
    };

    const handleQuickConfirm = async (order) => {
        setSavingId(order.id);
        setError('');
        try {
            await updateOrderStatus(order.id, 'confirmed', defaultDeliveryTime());
            toast(`Order #${order.id} confirmed.`);
            const data = await getOrders();
            setOrders(data.data ?? data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not confirm order.');
        } finally {
            setSavingId(null);
        }
    };

    const handleQuickReject = async (order) => {
        setSavingId(order.id);
        setError('');
        try {
            await updateOrderStatus(order.id, 'rejected');
            toast(`Order #${order.id} rejected.`);
            const data = await getOrders();
            setOrders(data.data ?? data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not reject order.');
        } finally {
            setSavingId(null);
        }
    };

    const handleConfirm = async () => {
        if (!deliveryTime) { toast('Please set a delivery time.', 'error'); return; }
        setSavingId(treatOrder.id);
        setError('');
        try {
            await updateOrderStatus(treatOrder.id, 'confirmed', deliveryTime);
            toast(`Order #${treatOrder.id} confirmed.`);
            const data = await getOrders();
            setOrders(data.data ?? data);
            setTreatOrder(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not confirm order.');
        } finally {
            setSavingId(null);
        }
    };

    const handleReject = async () => {
        setSavingId(treatOrder.id);
        setError('');
        try {
            await updateOrderStatus(treatOrder.id, 'rejected');
            toast(`Order #${treatOrder.id} rejected.`);
            const data = await getOrders();
            setOrders(data.data ?? data);
            setTreatOrder(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not reject order.');
        } finally {
            setSavingId(null);
        }
    };

    const toggleDropdown = (type, orderId) => {
        if (openDropdown && openDropdown.type === type && openDropdown.orderId === orderId) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown({ type, orderId });
        }
    };

    return (
        <section className="admin-stack">
            <div className="admin-page-head">
                <div>
                    <span className="admin-kicker">Fulfillment</span>
                    <h2>Orders</h2>
                </div>
            </div>

            {error && <div className="admin-alert">{error}</div>}

            <section className="admin-panel">
                {loading ? (
                    <TableSkeleton rows={5} cols={6} />
                ) : orders.length === 0 ? (
                    <p className="admin-empty">No orders yet.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Delivery</th>
                                    <th>Address</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>#{String(order.id).padStart(4, '0')}</strong>
                                            <span>{order.items_count ?? 0} items</span>
                                        </td>
                                        <td>{order.user?.name || 'Customer'}</td>
                                        <td>{order.total} DA</td>
                                        <td className="td-pill">
                                            <div className="pill-wrap">
                                                <button
                                                    className={`pill ${pillClass(order.status)}`}
                                                    onClick={() => toggleDropdown('status', order.id)}
                                                    disabled={savingId === order.id}
                                                >
                                                    {order.status}
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 6 }}>
                                                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                                {openDropdown?.type === 'status' && openDropdown?.orderId === order.id && (
                                                    <div className="pill-dropdown" ref={dropdownRef}>
                                                        {statusOptions.filter(s => s !== order.status).map(s => (
                                                            <button
                                                                key={s}
                                                                className="pill-dropdown-item"
                                                                onClick={() => handleStatusUpdate(order, s)}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="td-pill">
                                            <div className="pill-wrap">
                                                <button
                                                    className={`pill ${pillClass(order.payment_status)}`}
                                                    onClick={() => toggleDropdown('payment', order.id)}
                                                    disabled={savingId === order.id}
                                                >
                                                    {order.payment_status}
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 6 }}>
                                                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                                {openDropdown?.type === 'payment' && openDropdown?.orderId === order.id && (
                                                    <div className="pill-dropdown" ref={dropdownRef}>
                                                        {paymentOptions.filter(s => s !== order.payment_status).map(s => (
                                                            <button
                                                                key={s}
                                                                className="pill-dropdown-item"
                                                                onClick={() => handlePaymentUpdate(order, s)}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {order.delivery_time
                                                ? new Date(order.delivery_time).toLocaleDateString()
                                                : '—'}
                                        </td>
                                        <td className="td-addr">
                                            {[order.wilaya, order.commune].filter(Boolean).join(', ') || '—'}
                                        </td>
                                        <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                                        <td className="admin-actions">
                                            {order.status === 'pending' ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickConfirm(order)}
                                                        disabled={savingId === order.id}
                                                    >
                                                        {savingId === order.id ? '…' : 'Confirm'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="danger"
                                                        onClick={() => handleQuickReject(order)}
                                                        disabled={savingId === order.id}
                                                    >
                                                        {savingId === order.id ? '…' : 'Reject'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openTreat(order)}
                                                        disabled={savingId === order.id}
                                                    >
                                                        Treat
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => openTreat(order)}
                                                    disabled={savingId === order.id}
                                                >
                                                    Treat
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ── Treat modal ── */}
            {treatOrder && (
                <div className="modal-overlay" onClick={() => setTreatOrder(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <h2>Treat Order #{String(treatOrder.id).padStart(4, '0')}</h2>
                            <button className="modal-close" onClick={() => setTreatOrder(null)}>&#10005;</button>
                        </div>
                        <div className="modal-body">
                            <p>Set delivery date & time, then accept or reject this order.</p>

                            <div className="admin-form" style={{ marginTop: 16 }}>
                                <label>
                                    Delivery date & time
                                    <input
                                        type="datetime-local"
                                        value={deliveryTime}
                                        onChange={e => setDeliveryTime(e.target.value)}
                                        style={{ marginTop: 4 }}
                                        required
                                    />
                                </label>
                            </div>

                            <div className="modal-btns" style={{ marginTop: 24, justifyContent: 'flex-end', gap: 8 }}>
                                <button className="btn-cancel" onClick={() => setTreatOrder(null)}>Cancel</button>
                                <button
                                    className="btn-delete"
                                    onClick={handleReject}
                                    disabled={savingId === treatOrder.id}
                                >
                                    {savingId === treatOrder.id ? 'Processing...' : 'Reject'}
                                </button>
                                <button
                                    className="btn-save"
                                    onClick={handleConfirm}
                                    disabled={savingId === treatOrder.id}
                                >
                                    {savingId === treatOrder.id ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminOrders;
