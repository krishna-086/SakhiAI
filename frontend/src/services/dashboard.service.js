import api from "./api";

export const getDashboardStats =
  async () => {
    const response = await api.get(
      "/api/stats"
    );

    return response.data;
  };

export const getRecentScreenings =
  async () => {
    const response = await api.get(
      "/api/screenings"
    );

    return response.data;
  };

export const getAlerts =
  async () => {
    const response = await api.get(
      "/api/alerts"
    );

    return response.data;
  };