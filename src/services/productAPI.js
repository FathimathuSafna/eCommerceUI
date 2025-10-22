import { PRODUCT_INSTANCE } from "./axiosInstance";

export const getFoodItemById = async (id) =>{
    try {
        console.log("id are passing ",id)
        const response = await PRODUCT_INSTANCE.get(`/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching cart items:", error);
        throw error;
      }
}

