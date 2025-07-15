// SessionContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const SessionContext = createContext();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function SessionProvider({ children }) {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(true); // NEW

  const fetchSessions = async () => {
    try {
      setSessionLoading(true);
      const res = await fetch(`${BASE_URL}/sessions/`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data);

      // Set latest session if available
      if (data.length > 0) {
        setCurrentSessionId(data[0].session_id);
      } else {
        setCurrentSessionId(null);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setCurrentSessionId(null);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        currentSessionId,
        setCurrentSessionId,
        sessions,
        setSessions,
        fetchSessions,
        sessionLoading, // NEW
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
