import api from "./api";

export const getOrders = async () => {
  const response =
    await api.get("/purchase-orders");

  return response.data;
};

export const approveOrder =
  async (id) => {

  const response =
    await api.put(
      `/purchase-orders/${id}/approve`
    );

  return response.data;
};

export const deliverOrder =
  async (id) => {

  const response =
    await api.put(
      `/purchase-orders/${id}/deliver`
    );

  return response.data;
};

export const rejectOrder =
  async (id) => {

  const response =
    await api.put(
      `/purchase-orders/${id}/reject`
    );

  return response.data;
};

export const createOrder = async (order) => {
  const response = await api.post(
    "/purchase-orders",
    order
  );

  return response.data;
};