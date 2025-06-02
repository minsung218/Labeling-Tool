import axios from "axios";

// Axios 인스턴스 : 백엔드 서버와 통신을 위함
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // http://localhost:8000
  timeout: 5000,
});

export default api;