import { CART_INSTANCE } from "./axiosInstance";

export const addToCart = async (data) => {
  try {
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
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

export const updateCartItem = async (id, data) => {
  try {
    const response = await CART_INSTANCE.put(`/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

// NEW: Sync function
export const syncCartWithDB = async (localCartItems) => {
  try {
    if (!localCartItems || localCartItems.length === 0) {
      return { success: true, data: [] };
    }

    const foodIds = localCartItems.map(item => item._id);
    const response = await CART_INSTANCE.post('/sync', { foodIds });
    
    return response.data;
  } catch (error) {
    console.error("Error syncing cart:", error);
    throw error;
  }
};