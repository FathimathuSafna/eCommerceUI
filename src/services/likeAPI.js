import { LIKE_INSTANCE } from "./axiosInstance";
import { USER_INSTANCE } from "./axiosInstance";

export const likeFood = async (data) => {
  try {
    console.log("idd....",data)
    const response = await LIKE_INSTANCE.post("/", data);
    return response.data;
  } catch (error) {
    console.error("Error during add like", error);
    throw error;
  }
};


export const fetchLikes = async (foodId) => {
  try {
    // If foodId exists, add it as a query parameter
    const response = await LIKE_INSTANCE.get(`/?foodId=${foodId || ""}`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching likes", error);
    throw error;
  }
};


export const removeLike = async(data) =>{
    try{
      console.log("remove data id",data)
        const response = await LIKE_INSTANCE.delete(`/${data}`)
        return response.data
    } catch (error){
        console.error("Error while removing the like");
        throw error
        
    }
}