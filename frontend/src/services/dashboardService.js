import api from "./api";

export const getDashboardStats =
  async () => {
    const response =
      await api.get("/dashboard");

    return response.data;
  };

export const getInventoryValue =
  async () => {
    const response =
      await api.get(
        "/dashboard/inventory-value"
      );

    return response.data;
  };

export const getLowStockProducts =
  async () => {

  const response =
    await api.get(
      "/dashboard/low-stock"
    );

  return response.data;
};