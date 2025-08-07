// import { createContext, useContext, useState, useEffect } from "react";
// import { useSession } from "./SessionContext";

// const ChatContext = createContext();
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// console.log("✅ BASE_URL in production:", BASE_URL);


// export function ChatProvider({ children }) {
//   const [messages, setMessages] = useState([]);
//   const [sessionId, setSessionId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [videoUrl, setVideoUrl] = useState(null);
//   const [youtubeLinks, setYoutubeLinks] = useState([]);

//   const {
//     currentSessionId,
//     setCurrentSessionId,
//     sessions,
//     setSessions,
//     fetchSessions,
//   } = useSession();

//   useEffect(() => {
//     if (!currentSessionId) {
//       setMessages([]);
//       setVideoUrl(null);
//       setYoutubeLinks([]);
//       return;
//     }

//     setLoading(true);
//     fetch(`${BASE_URL}/sessions/${currentSessionId}/`)
//       .then((res) => {
//         if (!res.ok) throw new Error(`Failed to fetch session: ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         if (Array.isArray(data.messages)) {
//           setMessages(data.messages);
//           setSessionId(currentSessionId);
//           setVideoUrl(data.video_url || null);
//           setYoutubeLinks(data.saved_videos || []);
//         } else {
//           if (data.reply) {
//             setMessages([{ role: "assistant", content: data.reply }]);
//           } else {
//             setMessages([]);
//           }
//           setVideoUrl(null);
//           setYoutubeLinks([]);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching session:", error);
//         setMessages([]);
//         setYoutubeLinks([]);
//       })
//       .finally(() => setLoading(false));
//   }, [currentSessionId]);

//   const sendMessage = async (userMessage) => {
//     setLoading(true);
//     try {
//       let sid = currentSessionId;

//       if (!sid) {
//         const newSessionRes = await fetch(`${BASE_URL}/sessions/new`, {
//           method: "POST",
//         });
//         if (!newSessionRes.ok) throw new Error("Failed to create new session");
//         const newSessionData = await newSessionRes.json();
//         sid = newSessionData.session_id;
//         setCurrentSessionId(sid);
//         setMessages([{ role: "user", content: userMessage }]);
//         setVideoUrl(null);
//         setYoutubeLinks([]);
//         await fetchSessions();
//       } else {
//         setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
//       }

//       const res = await fetch(`${BASE_URL}/api/chat/new-chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           session_id: sid,
//           message: { role: "user", content: userMessage },
//         }),
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(`API error: ${res.status} - ${errorText}`);
//       }

//       const data = await res.json();

//       if (Array.isArray(data.messages)) {
//         setMessages((prev) => [...prev, ...data.messages]);
//         setSessionId(sid);
//         setVideoUrl(data.video_url || null);

//         // ✅ Append new videos without replacing existing ones
//         setYoutubeLinks((prevLinks) => {
//           const newLinks = data.saved_videos || [];
//           const combined = [...prevLinks];
//           newLinks.forEach((video) => {
//             if (!combined.some((v) => v.url === video.url)) {
//               combined.push(video);
//             }
//           });
//           return combined;
//         });
//       } else if (data.reply) {
//         setMessages((prev) => [
//           ...prev,
//           { role: "assistant", content: data.reply },
//         ]);
//         setSessionId(sid);
//         setVideoUrl(data.video_url || null);

//         setYoutubeLinks((prevLinks) => {
//           const newLinks = data.youtube_links || [];
//           const combined = [...prevLinks];
//           newLinks.forEach((video) => {
//             if (!combined.some((v) => v.url === video.url)) {
//               combined.push(video);
//             }
//           });
//           return combined;
//         });
//       }

//       await fetchSessions();
//     } catch (err) {
//       console.error("Error sending message:", err);
//       alert("Failed to send message: " + err.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <ChatContext.Provider
//       value={{ messages, sendMessage, loading, videoUrl, youtubeLinks }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// }

// export function useChat() {
//   return useContext(ChatContext);
// }
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

  const {
    currentSessionId,
    setCurrentSessionId,
    fetchSessions,
    createNewSession,
  } = useSession();

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // Load messages whenever currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      setVideoUrl(null);
      setYoutubeLinks([]);
      return;
    }

    const loadSessionMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/sessions/${currentSessionId}`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error("Failed to fetch session details");

        const data = await res.json();

        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
          setSessionId(currentSessionId);
          setVideoUrl(data.video_url || null);
          setYoutubeLinks(data.saved_videos || []);
        } else {
          setMessages(
            data.reply ? [{ role: "assistant", content: data.reply }] : []
          );
          setVideoUrl(null);
          setYoutubeLinks([]);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setMessages([]);
        setYoutubeLinks([]);
      } finally {
        setLoading(false);
      }
    };

    loadSessionMessages();
  }, [currentSessionId]);

  const sendMessage = async (userMessage) => {
    setLoading(true);
    try {
      const userId = parseInt(sessionStorage.getItem("user_id"), 10);
      if (!userId || isNaN(userId)) {
        alert("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      let sid = currentSessionId;

      // If no session exists, create a new one
      if (!sid) {
        sid = await createNewSession();
        if (!sid) {
          setLoading(false);
          return;
        }

        sessionStorage.setItem("currentSessionId", sid);
        setMessages([{ role: "user", content: userMessage }]);
        setVideoUrl(null);
        setYoutubeLinks([]);
        await fetchSessions();
      } else {
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      }

      const res = await fetch(`${BASE_URL}/api/chat/new-chat`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: userId,
          session_id: sid,
          message: { role: "user", content: userMessage },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      setCurrentSessionId(sid);
      sessionStorage.setItem("currentSessionId", sid);
  


      if (Array.isArray(data.messages)) {
        setMessages((prev) => [...prev, ...data.messages]);
        setSessionId(sid);
        setVideoUrl(data.video_url || null);

        setYoutubeLinks((prevLinks) => {
          const newLinks = data.saved_videos || [];
          const combined = [...prevLinks];
          newLinks.forEach((video) => {
            if (!combined.some((v) => v.url === video.url)) {
              combined.push(video);
            }
          });
          return combined;
        });
      } else if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
        setSessionId(sid);
        setVideoUrl(data.video_url || null);

        setYoutubeLinks((prevLinks) => {
          const newLinks = data.youtube_links || [];
          const combined = [...prevLinks];
          newLinks.forEach((video) => {
            if (!combined.some((v) => v.url === video.url)) {
              combined.push(video);
            }
          });
          return combined;
        });
      }

      await fetchSessions();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message: " + err.message);
    } finally {
      setLoading(false);
    }
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
