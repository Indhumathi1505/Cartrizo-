// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://43.205.137.109:8080",
});

export default api;
