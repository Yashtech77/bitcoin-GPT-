import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "./SessionContext";

const ChatContext = createContext();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [youtubeLinks, setYoutubeLinks] = useState([]);

  const { currentSessionId, setCurrentSessionId } = useSession();

  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      setVideoUrl(null);
      setYoutubeLinks([]);
      return;
    }

    setLoading(true);
    fetch(`${BASE_URL}/sessions/${currentSessionId}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch session: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
          setSessionId(currentSessionId);
          setVideoUrl(data.video_url || null);
          setYoutubeLinks(data.saved_videos || []);
        } else {
          if (data.reply) {
            setMessages([{ role: "assistant", content: data.reply }]);
          } else {
            setMessages([]);
          }
          setVideoUrl(null);
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

      if (!sid) {
        // Create new session
        const newSessionRes = await fetch(`${BASE_URL}/sessions/new`, {
          method: "POST",
        });
        if (!newSessionRes.ok) throw new Error("Failed to create new session");
        const newSessionData = await newSessionRes.json();
        sid = newSessionData.session_id;
        setCurrentSessionId(sid);

        // Show user's first message immediately
        setMessages([{ role: "user", content: userMessage }]);
        setVideoUrl(null);
        setYoutubeLinks([]);
      } else {
        // Append user message to ongoing session
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      }

      const res = await fetch(`${BASE_URL}/chat/`, {
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

      if (Array.isArray(data.messages)) {
        setMessages((prev) => [...prev, ...data.messages]);
        setSessionId(sid);
        setVideoUrl(data.video_url || null);

        setYoutubeLinks((prevLinks) => {
          const newLinks = data.saved_videos || [];
          const allLinks = [...prevLinks];
          newLinks.forEach((link) => {
            if (!allLinks.some((existing) => existing.url === link.url)) {
              allLinks.push(link);
            }
          });
          return allLinks;
        });
      } else if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
        setSessionId(sid);
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
    <ChatContext.Provider
      value={{ messages, sendMessage, loading, videoUrl, youtubeLinks }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
