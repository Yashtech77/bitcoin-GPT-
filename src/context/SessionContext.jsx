// SessionContext.jsx
import { createContext, useContext, useState } from "react";

const SessionContext = createContext();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function SessionProvider({ children }) {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/sessions/`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setSessions([]);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        currentSessionId,
        setCurrentSessionId,
        sessions,
        setSessions,
        fetchSessions,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
