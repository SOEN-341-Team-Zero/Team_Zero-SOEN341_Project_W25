import wretch from "wretch";
import { API_URL } from "./FetchUtils";

export function activitySubmit(status: "Online" | "Away" | "Offline") {
  wretch(`${API_URL}/api/home/activity`)
    .auth(`Bearer ${localStorage.getItem("jwt-token")}`)
    .post({ Activity: status })
    .res(() => {})
    .catch((error) => {
      console.error("Error submitting activity:", error);
    });
}
