// src/api/useChatApi.js
import { useState } from "react";
import axios from "axios";

const API_URL = "http://13.235.70.69:8000/chat/";

const useChatApi = () => {
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message, session_id = "") => {
    try {
      setLoading(true);
      const response = await axios.post(API_URL, {
        prompt: message,
        session_id,
      });
      return response.data;
    } catch (error) {
      console.error("API error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useChatApi;
