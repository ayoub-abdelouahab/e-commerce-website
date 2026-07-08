import api from './axios';

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getRecentOrders = async () => {
    const response = await api.get('/dashboard/orders');
    return response.data;
};

export const getTopCategories = async () => {
    const response = await api.get('/dashboard/categories');
    return response.data;
};