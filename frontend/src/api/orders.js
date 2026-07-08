import api from './axios';

export const getOrders = async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
};

export const getOrder = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
};

export const updateOrderPayment = async (id, payment_status) => {
    const response = await api.patch(`/orders/${id}/payment`, { payment_status });
    return response.data;
};