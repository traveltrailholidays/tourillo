import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default API;
