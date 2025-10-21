import axios from "axios";

export const baseURL =
  import.meta.env.VITE_API_URL ||"https://ecommerceapi-judn.onrender.com";

const createAxiosInstance = (baseURL, defaultHeaders = {}) => {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders,
    },
    // withCredentials: true,
  });
};

// Function to setup interceptors
const setupInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.token = `${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        console.log("Unauthorized, logging out...");

        localStorage.clear();
        // window.location.href = "/";
        // redirect to login page
      }
      return Promise.reject(error);
    }
  );
};

export const USER_INSTANCE = createAxiosInstance(`${baseURL}/user/`);
setupInterceptors(USER_INSTANCE);

export const ADMIN_INSTANCE = createAxiosInstance(`${baseURL}/admin/`);
setupInterceptors(ADMIN_INSTANCE);

export const CART_INSTANCE = createAxiosInstance(`${baseURL}/cart/`);
setupInterceptors(CART_INSTANCE);

export const ORDER_INSTANCE = createAxiosInstance(`${baseURL}/order/`);
setupInterceptors(ORDER_INSTANCE);

export const LIKE_INSTANCE = createAxiosInstance(`${baseURL}/likes/`)
setupInterceptors(LIKE_INSTANCE)




