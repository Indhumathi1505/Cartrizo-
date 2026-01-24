// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://15.207.235.93:8080",
});

export default api;