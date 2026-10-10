import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchRandomRiddle = async () => {
  const response = await api.get('/riddles');
  const riddle = response.data?.[0]?.randomQuestion?.questionText;

  if (!riddle) {
    throw new Error('No riddle was returned by the server.');
  }

  return riddle;
};

const parseVerificationPayload = (payload) => {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }

  return payload;
};

export const submitRiddleVerification = async ({ riddle, image }) => {
  if (!riddle || !image) {
    throw new Error('A riddle and image are required to submit a guess.');
  }

  const formData = new FormData();
  formData.append('riddle', riddle);
  formData.append('image', image);

  const response = await api.post('/verify', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return parseVerificationPayload(response.data?.message ?? response.data);
};
