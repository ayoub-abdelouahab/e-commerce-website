import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { getFieldError, getFormErrors } from '../utils/errors';
import { required, email, validate } from '../utils/validation';
import '../styles/Auth.css';

const rules = {
    email: [required, email],
    password: [required],
};

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState({ email: '', password: '' });
    const [serverError, setServerError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form, rules);
        if (errs) { setFieldErrors(errs); return; }

        setServerError(null);
        setFieldErrors({});
        setLoading(true);

        try {
            await login(form);
            toast('Logged in successfully.');
            navigate('/');
        } catch (err) {
            setServerError(getFormErrors(err));
            const fieldErr = {};
            if (err?.response?.data?.errors) {
                for (const field of Object.keys(rules)) {
                    const msg = getFieldError(err, field);
                    if (msg) fieldErr[field] = msg;
                }
            }
            setFieldErrors(fieldErr);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page auth-page--login">
            <section className="auth-visual" aria-label="Store welcome">
                <div className="auth-brand">
                    <span className="auth-brand-mark">E</span>
                    <span>Elite Commerce</span>
                </div>

                <div className="auth-visual-copy">
                    <p className="auth-kicker">Welcome back</p>
                    <h1>Shop smarter from your personal dashboard.</h1>
                    <p>
                        Sign in to continue browsing products, manage your orders,
                        and keep your cart ready across every visit.
                    </p>
                </div>

                <div className="auth-stats">
                    <div>
                        <strong>24/7</strong>
                        <span>Order access</span>
                    </div>
                    <div>
                        <strong>Fast</strong>
                        <span>Checkout flow</span>
                    </div>
                </div>
            </section>

            <section className="auth-panel" aria-label="Login form">
                <div className="auth-card">
                    <div className="auth-header">
                        <p className="auth-eyebrow">Secure login</p>
                        <h2>Login</h2>
                        <p>Enter your details to access your account.</p>
                    </div>

                    {serverError && <p className="auth-error">{serverError}</p>}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                className={`auth-input${fieldErrors.email ? ' auth-input--error' : ''}`}
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                            {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                className={`auth-input${fieldErrors.password ? ' auth-input--error' : ''}`}
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                            {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
                        </div>

                        <button className="auth-btn" type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="auth-link">
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Login;
