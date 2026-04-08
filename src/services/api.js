import axios from "axios";

export const API_URL = "https://muellesvince-backend-production.up.railway.app";

const api = axios.create({
  baseURL: "https://muellesvince-backend-production.up.railway.app",
});

export default api;