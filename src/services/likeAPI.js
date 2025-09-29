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


// likesApi.js
export const fetchLikes = async (foodId) => {
  try {
    let url = "/";
    if (foodId) {
      url += `?foodId=${foodId}`;
    }
    const response = await LIKE_INSTANCE.get(url);
    return response.data.data; // backend sends { msg, data }
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