import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';
import { useToast } from '../components/Toast';
import { getShippingCost, getRegionLabel } from '../utils/shipping';
import wilayas from '../data/wilayas';
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const cart = location.state?.cart ?? [];

  const [form, setForm] = useState({
    customer_name: user?.name ?? '',
    phone: '',
    wilaya: '',
    commune: '',
    address_details: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = useMemo(() => getShippingCost(form.wilaya), [form.wilaya]);
  const regionLabel = useMemo(() => getRegionLabel(form.wilaya), [form.wilaya]);
  const grandTotal = cartTotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required.';
    if (!form.phone.trim()) errs.phone = 'Phone is required.';
    if (!form.wilaya) errs.wilaya = 'Select a wilaya.';
    if (!form.commune.trim()) errs.commune = 'Commune is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await createOrder({
        ...form,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      toast('Order placed successfully! Pay on delivery.');
      navigate('/orders');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not place order.';
      toast(msg, 'error');
      if (err.response?.data?.errors) {
        const fieldErrs = {};
        for (const field of Object.keys(err.response.data.errors)) {
          fieldErrs[field] = err.response.data.errors[field][0];
        }
        setErrors(fieldErrs);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="co-page">
        <nav className="nav">
          <div className="nav-left">
            <div className="logo">MyShop</div>
            <div className="nav-links">
              <button className="nav-link" onClick={() => navigate('/')}>Dashboard</button>
              <button className="nav-link" onClick={() => navigate('/products')}>Products</button>
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
        <div className="co-main">
          <div className="co-empty">
            <h2>Your cart is empty</h2>
            <p>Add some products first.</p>
            <button className="btn-back" onClick={() => navigate('/products')}>Browse Products</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <nav className="nav">
        <div className="nav-left">
          <div className="logo">MyShop</div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate('/')}>Dashboard</button>
            <button className="nav-link" onClick={() => navigate('/products')}>Products</button>
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

      <div className="co-main">
        <div className="co-header">
          <h1>Checkout</h1>
          <p>Cash on Delivery — pay when you receive your order.</p>
        </div>

        <div className="co-layout">
          <form className="co-form" onSubmit={handleSubmit} noValidate>
            <h3>Shipping details</h3>

            <label>
              Full name
              <input
                type="text"
                value={form.customer_name}
                onChange={e => update('customer_name', e.target.value)}
                className={errors.customer_name ? 'error' : ''}
              />
              {errors.customer_name && <span className="field-err">{errors.customer_name}</span>}
            </label>

            <label>
              Phone number
              <input
                type="tel"
                placeholder="05XX XX XX XX"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="field-err">{errors.phone}</span>}
            </label>

            <label>
              Wilaya (state)
              <select
                value={form.wilaya}
                onChange={e => update('wilaya', e.target.value)}
                className={errors.wilaya ? 'error' : ''}
              >
                <option value="">Select a wilaya</option>
                {wilayas.map(w => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
              {errors.wilaya && <span className="field-err">{errors.wilaya}</span>}
            </label>

            <label>
              Commune (district)
              <input
                type="text"
                value={form.commune}
                onChange={e => update('commune', e.target.value)}
                className={errors.commune ? 'error' : ''}
              />
              {errors.commune && <span className="field-err">{errors.commune}</span>}
            </label>

            <label>
              Address details
              <textarea
                rows={3}
                placeholder="Street, building, landmarks..."
                value={form.address_details}
                onChange={e => update('address_details', e.target.value)}
              />
            </label>

            <label>
              Order notes (optional)
              <textarea
                rows={2}
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
              />
            </label>

            <button type="submit" className="btn-place" disabled={submitting}>
              {submitting ? 'Placing order...' : `Place Order — ${grandTotal.toFixed(2)} DA`}
            </button>
          </form>

          <aside className="co-summary">
            <h3>Order summary</h3>
            <div className="co-items">
              {cart.map(item => (
                <div key={item.product_id} className="co-item">
                  <span className="co-item-name">{item.name}</span>
                  <span className="co-item-qty">x{item.quantity}</span>
                  <span className="co-item-price">{(item.price * item.quantity).toFixed(2)} DA</span>
                </div>
              ))}
            </div>
            <div className="co-totals">
              <div className="co-row"><span>Subtotal</span><span>{cartTotal.toFixed(2)} DA</span></div>
              <div className="co-row">
                <span>Shipping {regionLabel && `(${regionLabel})`}</span>
                <span>{shipping > 0 ? `${shipping} DA` : '—'}</span>
              </div>
              <div className="co-row co-grand"><span>Total</span><span>{grandTotal.toFixed(2)} DA</span></div>
            </div>
            <div className="co-payment-badge">Cash on Delivery</div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
