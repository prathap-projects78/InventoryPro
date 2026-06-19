import api from "./api";

export const getUsers = async (search = "", role = "") => {
  const response = await api.get(`/auth?search=${search}&role=${role}`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/auth/${id}`);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const editUser = async (id, userData) => {
  const response = await api.put(`/auth/users/${id}`, userData);
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/auth/users/${id}/status`, { status });
  return response.data;
};

export const resetUserPassword = async (id, tempPassword) => {
  const response = await api.post(`/auth/users/${id}/reset-password`, { tempPassword });
  return response.data;
};

export const changePassword = async (newPassword) => {
  const response = await api.post("/auth/change-password", { newPassword });
  return response.data;
};
