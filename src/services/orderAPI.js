import {ORDER_INSTANCE} from "./axiosInstance";



export const placeOrder = async (data) => {
  try {
    console.log("data of address", data);
    
    const response = await ORDER_INSTANCE.post("/", data);
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

export const handlePaymentFailure = async (data) => {
  try {
    const response = await ORDER_INSTANCE.post("/payment-failed", data);
    return response.data;
  } catch (error) {
    console.error("Error recording payment failure:", error);
    throw error;
  }
};

export const getOrder = async () => {
  try {
    const response = await ORDER_INSTANCE.get("/payment");
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

// Add this new function for payment verification
export const verifyPayment = async (paymentData) => {
  try {
    console.log("Verifying payment:", paymentData);
    
    const response = await ORDER_INSTANCE.post("/verify", paymentData);
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};


export const getUserOrders = async () => {
  try {
    const response = await ORDER_INSTANCE.get(`/`);
    console.log("user orders response:", response.data);
    return response.data;
    } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
    }
};


export const getAllOrders = async () => {
  try {
    const response = await ORDER_INSTANCE.get(`/getAll`);
    console.log("response of order",response.data)
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

export const updateOrder = async (id,data) => {
  try {
    const response = await ORDER_INSTANCE.put(`/${id}`,data)
    return response.data;
  }
    catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};