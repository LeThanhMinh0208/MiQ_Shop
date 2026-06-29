import api from './api.js';
import axios from 'axios';

// Direct-to-Cloudinary upload (same pattern as CollectionManagement)
export const uploadImageToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset    = import.meta.env.VITE_CLOUDINARY_PRESET;
  if (!cloudName || !preset) throw new Error('Chưa cấu hình Cloudinary trong .env');
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, form);
  return { url: res.data.secure_url, publicId: res.data.public_id };
};

export const submitTradeIn = async (body) => {
  const { data } = await api.post('/trade-ins', body);
  return data.data;
};

export const getTradeIns = async () => {
  const { data } = await api.get('/trade-ins');
  return data.data || [];
};

export const updateTradeIn = async (id, body) => {
  const { data } = await api.patch(`/trade-ins/${id}`, body);
  return data.data;
};

export const deleteTradeIn = async (id) => {
  const { data } = await api.delete(`/trade-ins/${id}`);
  return data.data;
};
