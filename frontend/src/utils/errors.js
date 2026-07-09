export const getFieldError = (err, field) => {
    if (!err?.response?.data?.errors) return null;
    const msgs = err.response.data.errors[field];
    return msgs ? msgs.join(', ') : null;
};

export const getFormErrors = (err) => {
    if (!err?.response?.data) return null;
    const { message, errors } = err.response.data;
    if (errors && typeof errors === 'object') {
        const list = Object.entries(errors)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join('\n');
        return list || message || 'Something went wrong.';
    }
    return message || 'Something went wrong.';
};
