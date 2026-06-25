import api from './api.js';

export const getOrCreateRoom = () => api.get('/chat/room').then((r) => r.data.data);
export const getAllRooms      = () => api.get('/chat/rooms').then((r) => r.data.data);
export const getMessages      = (roomId) => api.get(`/chat/room/${roomId}/messages`).then((r) => r.data.data);
export const fetchOrderById   = (id) => api.get(`/orders/my-orders/${id}`).then((r) => r.data.data);
