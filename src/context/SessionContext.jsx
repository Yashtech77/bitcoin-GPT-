 
import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

const SessionContext = createContext();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(
    sessionStorage.getItem("currentSessionId") || null
  );

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/sessions`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Error fetching sessions", err);
      toast.error("Error fetching sessions");
    }
  };

  const createNewSession = async () => {
    try {
      const userId = parseInt(sessionStorage.getItem("user_id"), 10);
      if (!userId || isNaN(userId)) {
        toast.error("User not found");
        return null;
      }

      const res = await fetch(`${BASE_URL}/api/sessions/new`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Failed to create session");

      const data = await res.json();
      setSessions((prev) => [data, ...prev]);
      setCurrentSessionId(data.session_id);
      sessionStorage.setItem("currentSessionId", data.session_id);
      toast.success("New session created");
      return data.session_id;
    } catch (err) {
      console.error(err);
      toast.error("Failed to create new session");
      return null;
    }
  };

  const deleteSession = async (session_id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/sessions/${session_id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to delete session");

      setSessions((prev) => prev.filter((s) => s.session_id !== session_id));
      toast.success("Session deleted");
    } catch (err) {
      toast.error("Failed to delete session");
    }
  };

  const renameSession = async (session_id, newTitle) => {
    try {
      const res = await fetch(`${BASE_URL}/api/sessions/${session_id}/rename`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ newTitle }),
      });

      if (!res.ok) throw new Error("Failed to rename session");

      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === session_id ? { ...s, title: newTitle } : s
        )
      );

      toast.success("Session renamed");
    } catch (err) {
      toast.error("Failed to rename session");
    }
  };

  return (
    <SessionContext.Provider
      value={{
        sessions,
        setSessions,
        currentSessionId,
        setCurrentSessionId,
        fetchSessions,
        createNewSession,
        deleteSession,
        renameSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
