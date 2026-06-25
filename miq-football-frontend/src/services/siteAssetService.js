import api from './api.js';

export const getSiteAssets = async (prefix) => {
  const params = prefix ? { prefix } : {};
  const { data } = await api.get('/site-assets', { params });
  return data.data || [];
};

export const getSiteAsset = async (key) => {
  const { data } = await api.get('/site-assets', { params: { key } });
  return data.data || null;
};

export const upsertSiteAsset = async ({ key, name, imageUrl, imagePublicId, metadata }) => {
  const { data } = await api.put('/site-assets', { key, name, imageUrl, imagePublicId, metadata });
  return data.data;
};

export const deleteSiteAsset = async (key) => {
  const { data } = await api.delete('/site-assets', { data: { key } });
  return data.data;
};
