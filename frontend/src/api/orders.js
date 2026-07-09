import api from './axios';

export const getOrders = async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
};

export const getOrder = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

export const createOrder = async (data) => {
    const response = await api.post('/orders', data);
    return response.data;
};

export const updateOrderStatus = async (id, status, deliveryTime) => {
    const payload = deliveryTime ? { status, delivery_time: deliveryTime } : { status };
    const response = await api.patch(`/orders/${id}/status`, payload);
    return response.data;
};

export const updateOrderPayment = async (id, payment_status) => {
    const response = await api.patch(`/orders/${id}/payment`, { payment_status });
    return response.data;
};
