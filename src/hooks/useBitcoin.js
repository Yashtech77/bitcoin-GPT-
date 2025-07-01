import { useContext, useState } from "react";
import { sendChatMessage } from "../api/chatApi";
import { ChatContext } from "../context/ChatContext";

export const useChat = () => {
  const { addMessage } = useContext(ChatContext);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    setLoading(true);
    try {
      const response = await sendChatMessage(text);
      addMessage({ type: "user", text });
      addMessage({ type: "bot", text: response.reply });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};
