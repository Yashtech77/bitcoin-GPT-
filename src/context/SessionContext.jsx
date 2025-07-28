import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

const SessionContext = createContext();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // Fetch sessions
  const fetchSessions = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/sessions`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch sessions");

    const data = await res.json();
    console.log("Sessions API response:", data);

    // API returns { sessions: [...] }
    setSessions(data.sessions || []);
  } catch (err) {
    toast.error("Error fetching sessions");
  }
};

  // Create a new session
  const createNewSession = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/sessions/new`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to create session");

      const data = await res.json();
      setSessions((prev) => [data, ...prev]);
      setCurrentSessionId(data.session_id);
      toast.success("New session created");
    } catch (err) {
      toast.error("Failed to create new session");
    }
  };

  // Delete a session
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

   // Rename a session
const renameSession = async (session_id, newTitle) => {
  try {
    const res = await fetch(`${BASE_URL}/api/sessions/${session_id}/rename`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ newTitle }), // Use the correct field name
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
