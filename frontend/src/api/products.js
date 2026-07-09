import api from './axios';

export const getProducts = async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
};

export const getProduct = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

const toFormData = (data) => {
    const fd = new FormData();
    for (const key of Object.keys(data)) {
        const val = data[key];
        if (val === null || val === undefined || val === '') continue;
        fd.append(key, val);
    }
    return fd;
};

export const createProduct = async (data) => {
    const response = await api.post('/products', toFormData(data));
    return response.data;
};

export const updateProduct = async (id, data) => {
    const response = await api.post(`/products/${id}`, toFormData(data));
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};
