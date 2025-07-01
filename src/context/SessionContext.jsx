import { createContext, useContext, useState } from "react";

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  return (
    <SessionContext.Provider value={{ currentSessionId, setCurrentSessionId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
