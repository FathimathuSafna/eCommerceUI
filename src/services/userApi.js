import { USER_INSTANCE } from "./axiosInstance.js";


export const signup = async (data) => {
  try {
    console.log(data)
    const response = await USER_INSTANCE.post("/", data);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error during signup:", error);
    throw error;
  }
}


export const login = async (data) => {
  try {
    console.log(data)
    const response = await USER_INSTANCE.post("/login", data);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

