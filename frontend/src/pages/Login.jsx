import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import '../styles/Auth.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(form);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
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

                    {error && <p className="auth-error">{error}</p>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                className="auth-input"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                className="auth-input"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
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
