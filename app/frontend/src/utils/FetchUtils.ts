export const API_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:8080'
    : `${import.meta.env.VITE_API_URL}`;
