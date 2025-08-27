import axios, { AxiosRequestConfig } from "axios";

class Request {
  async request(config: AxiosRequestConfig) {
    try {
      const response = await axios(config);
      return response?.data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return error?.response?.data || error?.response || error;
    }
  }

  post = (config: AxiosRequestConfig) => {
    return this.request({ ...config, method: "POST" });
  };

  get = (config: AxiosRequestConfig) => {
    return this.request({ ...config, method: "GET" });
  };

  put = (config: AxiosRequestConfig) => {
    return this.request({ ...config, method: "PUT" });
  };

  patch = (config: AxiosRequestConfig) => {
    return this.request({ ...config, method: "PATCH" });
  };
}

export default new Request();
