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

export const getAllUsers = async () => {
  try {
    const response = await USER_INSTANCE.get("/");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export const updateUser = async (id,data) =>{
  try{
    console.log("id is...",id)
    const response = await USER_INSTANCE.put(`/${id}`,data)
    return response.data
  } catch (error){
    console.error("Error by updating user:",error);
    throw error
    
  }
}

export const deleteUser = async (id) => {
  try {
    const response = await USER_INSTANCE.delete(`/${id}`);
    return response.data;
  }
  catch (error) {   
    console.error("Error deleting user:", error);
    throw error;
  }
}

export const getMyProfile = async () => {
  try {
    const response = await USER_INSTANCE.get(`/getUser`);
    console.log("user details",response.data)
    return response.data;
  }
  catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
}

export const getAllRestaurantsDetails = async ()=>{
  try{
    const response = await USER_INSTANCE.get("/restaurants")
    return response.data
  } catch(error){
    console.error("Error fetching restaurants:", error);
    throw error;
  }
}




