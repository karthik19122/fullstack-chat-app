// src/lib/axios.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true,
});

// Function to handle file upload
export const uploadFile = (formData) => {
  return axiosInstance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Important for file uploads
    },
  });
};
