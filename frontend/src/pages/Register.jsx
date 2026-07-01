import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import '../styles/Auth.css';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
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
            await register(form);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page auth-page--register">
            <section className="auth-visual" aria-label="Store benefits">
                <div className="auth-brand">
                    <span className="auth-brand-mark">E</span>
                    <span>Elite Commerce</span>
                </div>

                <div className="auth-visual-copy">
                    <p className="auth-kicker">Create account</p>
                    <h1>Build your shopping profile in seconds.</h1>
                    <p>
                        Save your favorite products, track orders, and move through
                        checkout with a smoother buying experience.
                    </p>
                </div>

                <div className="auth-benefits">
                    <span>Saved carts</span>
                    <span>Order history</span>
                    <span>Personal offers</span>
                </div>
            </section>

            <section className="auth-panel" aria-label="Registration form">
                <div className="auth-card">
                    <div className="auth-header">
                        <p className="auth-eyebrow">Join us</p>
                        <h2>Register</h2>
                        <p>Create your account to start shopping.</p>
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="register-name">Name</label>
                            <input
                                id="register-name"
                                className="auth-input"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-email">Email</label>
                            <input
                                id="register-email"
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
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                className="auth-input"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-password-confirmation">
                                Confirm Password
                            </label>
                            <input
                                id="register-password-confirmation"
                                className="auth-input"
                                type="password"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <button className="auth-btn" type="submit" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <p className="auth-link">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Register;
