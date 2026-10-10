import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true
});

export async function startInterview(data) {
  try {
    let response;
    if (data instanceof FormData) {
      response = await api.post("/interview/start", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } else {
      response = await api.post("/interview/start", data);
    }
    return response.data;
  } catch (error) {
    console.error("Error starting interview:", error);
    throw error;
  }
}

export async function submitAnswer(interviewId, answer) {
  try {
    const response = await api.post(`/interview/${interviewId}/answer`, { answer });
    return response.data;
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
}

export async function getInterviewById(interviewId) {
  try {
    const response = await api.get(`/interview/${interviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching interview details:", error);
    throw error;
  }
}

export async function getInterviewHistory() {
  try {
    const response = await api.get("/interview/history");
    return response.data;
  } catch (error) {
    console.error("Error fetching interview history:", error);
    throw error;
  }
}
