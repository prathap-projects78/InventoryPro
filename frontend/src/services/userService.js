import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/auth");
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
