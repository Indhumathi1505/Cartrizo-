import axios from "axios";

// Use Vite env variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
});

export default api;