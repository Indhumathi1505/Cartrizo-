import api from "./api";

export const getAllCars = () => api.get("/api/cars/all");

export const addCar = (formData) => api.post("/api/cars/add", formData);