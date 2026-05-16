import axios from "axios";

const API = "http://localhost:8000";

export const adminLogin = (data) =>
  axios.post(`${API}/admin/login`, data);

export const fetchSessions = () =>
  axios.get(`${API}/admin/sessions`);

export const fetchSessionDetails = (id) =>
  axios.get(`${API}/admin/session/${id}`);

export const fetchStats = () =>
  axios.get(`${API}/admin/stats`);