import api from "./api";

export const getProducts = async () => {
  const response =
    await api.get("/products");

  return response.data;
};

export const createProduct = async (product) => {
  const response = await api.post(
    "/products",
    product
  );

  return response.data;
};

export const deleteProduct = async (id) => {
  await api.delete(
    `/products/${id}`
  );
};

export const updateProduct = async (
  id,
  product
) => {

  const response =
    await api.put(
      `/products/${id}`,
      product
    );

  return response.data;
};