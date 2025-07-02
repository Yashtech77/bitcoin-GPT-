import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "./SessionContext";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [youtubeLinks, setYoutubeLinks] = useState([]);

  const { currentSessionId, setCurrentSessionId } = useSession();

  useEffect(() => {
    console.log("Fetching details for:", currentSessionId);
    if (!currentSessionId) {
      setMessages([]);
      setVideoUrl(null);
      setYoutubeLinks([]);
      return;
    }

    setLoading(true);
    fetch(`http://13.235.70.69:8000/sessions/${currentSessionId}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch session: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data for session:", currentSessionId, data);
        if (Array.isArray(data)) {
          setMessages(data);
          setSessionId(currentSessionId);
          setVideoUrl(null);
          setYoutubeLinks([]);
        } else if (Array.isArray(data.history)) {
          setMessages(data.history);
          setSessionId(currentSessionId);
          setVideoUrl(data.video_url || null);
          setYoutubeLinks(data.youtube_links || []);
        } else {
          console.error("Invalid data format received:", data);
          setMessages([]);
          setYoutubeLinks([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching session:", error);
        setMessages([]);
        setYoutubeLinks([]);
      })
      .finally(() => setLoading(false));
  }, [currentSessionId]);

  const sendMessage = async (userMessage) => {
    setLoading(true);
    try {
      let sid = currentSessionId;
      let isNewSession = false;

      if (!sid) {
        const newSessionRes = await fetch("http://13.235.70.69:8000/sessions/new", { method: "POST" });
        if (!newSessionRes.ok) throw new Error("Failed to create new session");
        const newSessionData = await newSessionRes.json();
        sid = newSessionData.session_id;
        setCurrentSessionId(sid);
        isNewSession = true;

        // ✅ Clear old data when new session starts
        setMessages([]);
        setVideoUrl(null);
        setYoutubeLinks([]);
      }

      const res = await fetch("http://13.235.70.69:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sid,
          message: { role: "user", content: userMessage },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setMessages(data);
        setSessionId(sid);
        setVideoUrl(null);
        setYoutubeLinks([]);
      } else if (Array.isArray(data.history)) {
        setMessages(data.history);
        setSessionId(data.session_id);
        setVideoUrl(data.video_url || null);
        setYoutubeLinks(data.youtube_links || []);
      } else {
        console.error("Invalid response data:", data);
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message: " + err.message);
    }
    setLoading(false);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, loading, videoUrl, youtubeLinks }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
