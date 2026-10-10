import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true
});

export async function generatePlan(data) {
  try {
    let response;
    if (data instanceof FormData) {
      response = await api.post("/plan/generate", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } else {
      response = await api.post("/plan/generate", data);
    }
    return response.data;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
}

export async function getUserPlans() {
  try {
    const response = await api.get("/plan/user");
    return response.data;
  } catch (error) {
    console.error("Error fetching user plans:", error);
    throw error;
  }
}

export async function getPlanById(planId) {
  try {
    const response = await api.get(`/plan/${planId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching plan by ID:", error);
    throw error;
  }
}

export async function toggleDayCompletion(planId, dayNumber) {
  try {
    const response = await api.patch(`/plan/${planId}/day/${dayNumber}/toggle`);
    return response.data;
  } catch (error) {
    console.error("Error toggling day status:", error);
    throw error;
  }
}
