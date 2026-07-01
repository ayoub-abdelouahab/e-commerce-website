import api from './axios';

export const register = async (data) => {
    const response = await api.post('/register', data);
    localStorage.setItem('token', response.data.token);
    return response.data;
};

export const login = async (data) => {
    const response = await api.post('/login', data);
    localStorage.setItem('token', response.data.token);
    return response.data;
};

export const logout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
};

export const getMe = async () => {
    const response = await api.get('/me');
    return response.data;
};