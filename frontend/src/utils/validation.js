export const required = (v) => (v != null && v !== '' ? null : 'This field is required.');

export const email = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email address.';

export const minLength = (min) => (v) =>
    v && v.length >= min ? null : `Minimum ${min} characters.`;

export const passwordMatch = (other) => (v, data) =>
    v === data[other] ? null : 'Passwords do not match.';

export const numeric = (v) =>
    v == null || v === '' || !isNaN(v) ? null : 'Must be a number.';

export const min = (minVal) => (v) =>
    v == null || v === '' || Number(v) >= minVal ? null : `Minimum value is ${minVal}.`;

export const validate = (data, rules) => {
    const errors = {};
    for (const [field, validators] of Object.entries(rules)) {
        for (const fn of [].concat(validators)) {
            const msg = fn(data[field], data);
            if (msg) {
                errors[field] = msg;
                break;
            }
        }
    }
    return Object.keys(errors).length > 0 ? errors : null;
};

export const validateField = (value, validators) => {
    for (const fn of [].concat(validators)) {
        const msg = fn(value);
        if (msg) return msg;
    }
    return null;
};
