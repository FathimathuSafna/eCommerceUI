import { CART_INSTANCE } from "./axiosInstance";

export const addToCart = async (data) => {
  try {
    console.log("response",data)
    const response = await CART_INSTANCE.post(`/${data}`);
    return response.data;
    } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const getCartItems = async () => {
  try {
    const response = await CART_INSTANCE.get(`/`);
    console.log("response cart",response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw error;
  }
};

export const removeFromCart = async (id) => {
  try {
    const response = await CART_INSTANCE.delete(`/remove/${id}`);
    return response.data;
  }
    catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};