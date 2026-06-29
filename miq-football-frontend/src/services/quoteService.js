import api from './api.js';

export const submitQuote = async (body) => {
  const { data } = await api.post('/quotes', body);
  return data.data;
};

export const getQuotes = async () => {
  const { data } = await api.get('/quotes');
  return data.data || [];
};

export const updateQuoteStatus = async (id, status) => {
  const { data } = await api.patch(`/quotes/${id}/status`, { status });
  return data.data;
};

export const deleteQuote = async (id) => {
  const { data } = await api.delete(`/quotes/${id}`);
  return data.data;
};
