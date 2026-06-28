import api from './api.js';

export const getCollections = async (showAll = false) => {
  const { data } = await api.get('/collections', { params: showAll ? { showAll: 'true' } : {} });
  return data.data || [];
};

export const getCollectionBySlug = async (slug) => {
  const { data } = await api.get(`/collections/${slug}`);
  return data.data;
};

export const createCollection = async (body) => {
  const { data } = await api.post('/collections', body);
  return data.data;
};

export const updateCollection = async (id, body) => {
  const { data } = await api.put(`/collections/${id}`, body);
  return data.data;
};

export const deleteCollection = async (id) => {
  const { data } = await api.delete(`/collections/${id}`);
  return data.data;
};

export const addSlide = async (id, slide) => {
  const { data } = await api.post(`/collections/${id}/slides`, slide);
  return data.data;
};

export const removeSlide = async (id, slideId) => {
  const { data } = await api.delete(`/collections/${id}/slides/${slideId}`);
  return data.data;
};

export const addModelPhoto = async (id, photo) => {
  const { data } = await api.post(`/collections/${id}/model-photos`, photo);
  return data.data;
};

export const removeModelPhoto = async (id, photoId) => {
  const { data } = await api.delete(`/collections/${id}/model-photos/${photoId}`);
  return data.data;
};
