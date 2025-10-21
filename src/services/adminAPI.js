import { ADMIN_INSTANCE } from "./axiosInstance"; 


export const adminLogin = async (data) => {
  try {
    console.log(data)
    const response = await ADMIN_INSTANCE.post("/login", data);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error during admin login:", error);
    throw error;
  } 
}

export const addRestaurants = async (data) => {
  try {
    const response = await ADMIN_INSTANCE.post("/restaurants", data);
    return response.data;
  } catch (error) {
    console.error("Error adding restaurant:", error);
    throw error;
  }
};

export const getAllRestaurants = async () => {
  try {
    const response = await ADMIN_INSTANCE.get("/restaurants");
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};

export const updateRestaurant = async (id, data) => {
  try {
    const response = await ADMIN_INSTANCE.put(`/restaurants/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw error;
  }
};
export const deleteRestaurant = async (id) => {
  try {
    const response = await ADMIN_INSTANCE.delete(`/restaurants/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    throw error;
  }
};

export const addFoodItem = async (data) => {
  try {
    const response = await ADMIN_INSTANCE.post("/food", data);
    return response.data;
  } catch (error) {
    console.error("Error adding food item:", error);
    throw error;
  }
};

export const getAllFoodItems = async (data) => {
  try {
    console.log("during data before fetching",data );
    const response = await ADMIN_INSTANCE.get("/food");
    console.log("response get all",response.data)
    console.log("during data", response.data);
    return response.data;
  } catch (error) {
    console.error("Error during fetching food items");
    throw error;
  }
};

export const updateFoodItem = async (id, data) => {
  try {
    const response = await ADMIN_INSTANCE.put(`/food/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating food item:", error);
    throw error;
  }
};
export const deleteFoodItem = async (id) => {
  try {
    const response = await ADMIN_INSTANCE.delete(`/food/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting food item:", error);
    throw error;
  }
};
