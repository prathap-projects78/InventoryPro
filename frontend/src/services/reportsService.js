import api from "./api";

export const getReportsData = async () => {
  const response = await api.get("/reports");
  return response.data;
};
