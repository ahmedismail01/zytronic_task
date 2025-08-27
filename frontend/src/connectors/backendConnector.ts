import request from "./request";
import config from "../config";

interface Response {
  success: boolean;
  data: any;
  errors: any[];
  message: string;
}
interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

class BackendConnector {
  async getProfile() {
    const token = localStorage.getItem("token");
    const requestConfig = {
      baseURL: config.BACKEND_BASE_URL,
      url: "/api/auth/profile",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return request
      .get(requestConfig)
      .then((res: Response) => res)
      .catch((err: any) => err);
  }

  async login(data: LoginData) {
    const requestConfig = {
      baseURL: config.BACKEND_BASE_URL,
      url: "/api/auth/login",
      data,
    };
    console.log(requestConfig);
    return request
      .post(requestConfig)
      .then((res: Response) => res)
      .catch((err: any) => err);
  }

  async register(data: RegisterData) {
    const requestConfig = {
      baseURL: config.BACKEND_BASE_URL,
      url: "/api/auth/register",
      data,
    };
    return request
      .post(requestConfig)
      .then((res: Response) => res)
      .catch((err: any) => err);
  }

  async getUsers() {
    const token = localStorage.getItem("token");

    const requestConfig = {
      baseURL: config.BACKEND_BASE_URL,
      url: "/api/auth/users",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return request
      .get(requestConfig)
      .then((res: Response) => res)
      .catch((err: any) => err);
  }

  async uploadImage(formData: FormData) {
    const token = localStorage.getItem("token");

    const requestConfig = {
      baseURL: config.BACKEND_BASE_URL,
      url: "/api/upload",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: formData,
    };
    return request
      .post(requestConfig)
      .then((res: Response) => res)
      .catch((err: any) => err);
  }
  async uploadVoice(formData: FormData) {
    const token = localStorage.getItem("token");

    const requestConfig = {
      baseURL: config.BACKEND_BASE_URL,
      url: "/api/upload/voice",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: formData,
    };
    return request
      .post(requestConfig)
      .then((res: Response) => res)
      .catch((err: any) => err);
  }
}

export default new BackendConnector();
