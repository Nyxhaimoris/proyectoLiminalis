import axios from "axios";

const publicRoutes = ["/login", "/register"];

const AxiosConfig = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});


// REQUEST
AxiosConfig.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE
AxiosConfig.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const isPublic = publicRoutes.some((r) =>
      original.url?.includes(r)
    );

    // banned user
    if (status === 403) {
      const msg = error.response?.data?.message;

      if (msg?.toLowerCase().includes("bloqueado")) {
        localStorage.removeItem("access_token");
        window.location.href = "/banned";
        return Promise.reject(error);
      }
    }

    if (isPublic || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const { data } = await AxiosConfig.post(
        "/refresh",
        {},
        { withCredentials: true }
      );

      localStorage.setItem("access_token", data.access_token);

      original.headers.Authorization = `Bearer ${data.access_token}`;

      return AxiosConfig(original);
    } catch (err) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(err);
    }
  }
);

export default AxiosConfig;