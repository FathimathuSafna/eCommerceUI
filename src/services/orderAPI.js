import {ORDER_INSTANCE} from "./axiosInstance";

export const placeOrder = async (data) => {
  try {
    const response = await ORDER_INSTANCE.post("/", data);
    return response.data;
    } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    const response = await ORDER_INSTANCE.get(`/`);
    return response.data;
    } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
    }
};


export const getAllOrders = async () => {
  try {
    const response = await ORDER_INSTANCE.get(`/getAll`);
    return response.data;
    }
    catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await ORDER_INSTANCE.delete(`/${id}`);
    return response.data;
  }
    catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  } 
};