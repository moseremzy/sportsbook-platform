import axios from "axios";
const base_url = process.env.VUE_APP_API_BASE_URL
import { useInteractiveStore } from "../stores/interactive";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: `${base_url}`, // your backend URL
});

// Response interceptor for global error handling
api.interceptors.response.use(
  response => response, // pass successful responses
  error => {

    const interactiveStore = useInteractiveStore();

    if (error.response) { // Backend returned an error (status 4xx or 5xx)
    
    if(error.response.data.message !== "Not logged in.") {
        
      interactiveStore.backend_message = error.response.data.message || "Server error occurred";

      interactiveStore.display_error_alert_box();
      
    }

    } else {  // Network error / no response
       
      interactiveStore.backend_message = error.response.data.message;

      interactiveStore.display_error_alert_box();

    }

    interactiveStore.toggle_loading_overlay(false)

    return Promise.reject(error); // still throw so store/main.js can optionally handle
 
  }

);

export default api;
