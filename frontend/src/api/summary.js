import { apiRequest } from "./client";

/**
 * Create a new summary or append a prompt to an existing video's summary history.
 */
export async function createSummary({ videoTitle, videoUrl, transcript, prompt, response, modelUsed }) {
  return apiRequest("/summary/create", {
    method: "POST",
    body: { videoTitle, videoUrl, transcript, prompt, response, modelUsed },
  });
}

/**
 * Get all video summaries for the currently authenticated user.
 */
export async function getUserSummaries() {
  return apiRequest("/summary/user-history", { method: "POST", body: {} });
}

/**
 * Get a specific video's full summary history by URL.
 */
export async function getVideoSummary(videoUrl) {
  return apiRequest("/summary/video", {
    method: "POST",
    body: { videoUrl },
  });
}

/**
 * Delete a single prompt/response entry from a video's summary array.
 */
export async function deleteOneSummary(videoId, summaryId) {
  return apiRequest(`/summary/${videoId}/${summaryId}`, { method: "DELETE" });
}

/**
 * Delete all summaries for a specific video.
 */
export async function deleteVideoSummary(videoId) {
  return apiRequest(`/summary/${videoId}`, { method: "DELETE" });
}

/**
 * Get dashboard statistics.
 */
export async function getDashboardStats() {
  return apiRequest("/summary/stats", { method: "GET" });
}
