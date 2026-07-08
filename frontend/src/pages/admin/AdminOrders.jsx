import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, updateOrderPayment } from '../../api/orders';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentOptions = ['unpaid', 'paid', 'refunded'];

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setOrders(data.data ?? data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusUpdate = async (order, status) => {
        setSavingId(order.id);
        setError('');
        try {
            await updateOrderStatus(order.id, status);
            await loadOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update order.');
        } finally {
            setSavingId(null);
        }
    };

    const handlePaymentUpdate = async (order, payment_status) => {
        setSavingId(order.id);
        setError('');
        try {
            await updateOrderPayment(order.id, payment_status);
            await loadOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update order.');
        } finally {
            setSavingId(null);
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
                    <div className="admin-loading">Loading orders...</div>
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
                                    <th>Date</th>
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
                                        <td>${order.total}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                disabled={savingId === order.id}
                                                onChange={(event) => handleStatusUpdate(order, event.target.value)}
                                            >
                                                {statusOptions.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                value={order.payment_status}
                                                disabled={savingId === order.id}
                                                onChange={(event) => handlePaymentUpdate(order, event.target.value)}
                                            >
                                                {paymentOptions.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </section>
    );
};

export default AdminOrders;
