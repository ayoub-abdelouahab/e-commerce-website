import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { getFieldError, getFormErrors } from '../utils/errors';
import { required, email, minLength, passwordMatch, validate } from '../utils/validation';
import '../styles/Auth.css';

const rules = {
    name: [required],
    email: [required, email],
    password: [required, minLength(8)],
    password_confirmation: [required, passwordMatch('password')],
};

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState({
        name: '', email: '', password: '', password_confirmation: '',
    });
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
            await register(form);
            toast('Account created successfully.');
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

                    {serverError && <p className="auth-error">{serverError}</p>}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label htmlFor="register-name">Name</label>
                            <input
                                id="register-name"
                                className={`auth-input${fieldErrors.name ? ' auth-input--error' : ''}`}
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                autoComplete="name"
                                required
                            />
                            {fieldErrors.name && <span className="auth-field-error">{fieldErrors.name}</span>}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-email">Email</label>
                            <input
                                id="register-email"
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
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                className={`auth-input${fieldErrors.password ? ' auth-input--error' : ''}`}
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                            />
                            {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-password-confirmation">
                                Confirm Password
                            </label>
                            <input
                                id="register-password-confirmation"
                                className={`auth-input${fieldErrors.password_confirmation ? ' auth-input--error' : ''}`}
                                type="password"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                required
                            />
                            {fieldErrors.password_confirmation && <span className="auth-field-error">{fieldErrors.password_confirmation}</span>}
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
