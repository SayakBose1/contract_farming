import axios from "axios";

// Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5005";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ---------------------------------------------------------
// REQUEST INTERCEPTOR
// ---------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------
// RESPONSE INTERCEPTOR
// ---------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------
// AUTH API
// ---------------------------------------------------------
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.post("/auth/change-password", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),

  signupStep1: (data) => api.post("/auth/signup", data),
  signupStep2: (userId, data) =>
    api.post(`/auth/signup/details/${userId}`, data),
};

// ---------------------------------------------------------
// USERS API
// ---------------------------------------------------------
export const usersAPI = {
  getDashboard: () => api.get("/users/dashboard"),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  uploadSignature: (data) => api.post("/users/upload-signature", data),
  getNotifications: () => api.get("/users/notifications"),
  getActivity: (params) => api.get("/users/activity", { params }),
  getStats: () => api.get("/users/stats"),
};

// ---------------------------------------------------------
// FARMS API
// ---------------------------------------------------------
export const farmsAPI = {
  getFarms: (params) => api.get("/farms", { params }),
  getFarm: (id) => api.get(`/farms/${id}`),
  createFarm: (data) => api.post("/farms", data),
  updateFarm: (id, data) => api.put(`/farms/${id}`, data),
  deleteFarm: (id) => api.delete(`/farms/${id}`),
  addCrop: (farmId, data) => api.post(`/farms/${farmId}/crops`, data),
  updateCrop: (farmId, cropId, data) =>
    api.put(`/farms/${farmId}/crops/${cropId}`, data),
  addHistory: (farmId, data) => api.post(`/farms/${farmId}/history`, data),
};

// ---------------------------------------------------------
// COMMODITIES API
// ---------------------------------------------------------
export const commoditiesAPI = {
  getCommodities: () => api.get("/commodities"),
  getVarieties: (commodityId) =>
    api.get(`/commodities/${commodityId}/varieties`),
};

// ---------------------------------------------------------
// MASTER DATA API  (backend routes/master_routes.py)
// ---------------------------------------------------------
export const masterAPI = {
  getEducationLevels: () => api.get("/master/education"),
};

// ---------------------------------------------------------
// LOCATIONS API (what frontend pages expect)
// ---------------------------------------------------------
export const locationsAPI = {
  getDivisions: () => api.get("/locations/divisions"),
  getDistricts: (divisionId) =>
    api.get(`/locations/divisions/${divisionId}/districts`),
  getTehsils: (districtId) =>
    api.get(`/locations/districts/${districtId}/tehsils`),
  getBlocks: (districtId) =>
    api.get(`/locations/districts/${districtId}/blocks`),
};

// ---------------------------------------------------------
// CONTRACTS API
// ---------------------------------------------------------
export const contractsAPI = {
  getContracts: (params) => api.get("/contracts", { params }),
  getAvailableContracts: (params) =>
    api.get("/trader/contracts/available", { params }),
  getContract: (id) => api.get(`/contracts/${id}`),
  getFormData: () => api.get("/contracts/form-data"),
  createContract: (data) => api.post("/contracts", data),
  updateContract: (id, data) => api.put(`/contracts/${id}`, data),
  acceptContract: (id) => api.post(`/contracts/${id}/accept`),
  negotiateContract: (id, data) => api.post(`/contracts/${id}/negotiate`, data),
  signContract: (id, data) => api.post(`/contracts/${id}/sign`, data),
  disputeContract: (id, data) => api.post(`/contracts/${id}/dispute`, data),
  cancelContract: (id) => api.delete(`/contracts/${id}`),
  showInterest: (id) => api.post(`/trader/contracts/${id}/interest`),
  acceptTrader: (id, traderId) =>
    api.post(`/trader/contracts/${id}/accept-trader/${traderId}`),
};

// ---------------------------------------------------------
// UPLOAD API
// ---------------------------------------------------------
export const uploadAPI = {
  uploadSingle: (file, folder) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);
    return api.post("/upload/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadMultiple: (files, folder) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (folder) formData.append("folder", folder);

    return api.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadFarmMedia: (farmId, files, descriptions) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (descriptions)
      descriptions.forEach((desc) => formData.append("descriptions", desc));

    return api.post(`/upload/farm-media/${farmId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadContractMedia: (contractId, files, descriptions) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (descriptions)
      descriptions.forEach((d) => formData.append("descriptions", d));

    return api.post(`/upload/contract-media/${contractId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteFile: (publicId) =>
    api.delete(`/upload/${encodeURIComponent(publicId)}`),
};

// ---------------------------------------------------------
// ADMIN API
// ---------------------------------------------------------
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deactivateUser: (id) => api.delete(`/admin/users/${id}`),
  getContracts: (params) => api.get("/admin/contracts", { params }),
  approveContract: (id, data) =>
    api.put(`/admin/contracts/${id}/approve`, data),
  resolveDispute: (id, data) =>
    api.put(`/admin/contracts/${id}/resolve-dispute`, data),
  deleteContract: (id) => api.delete(`/admin/contracts/${id}`),
  getReports: (params) => api.get("/admin/reports", { params }),
};

export default api;
