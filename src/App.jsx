import { Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import { ChatProvider } from "./context/ChatContext";
import Chatinterface from "./component/Chatinterface";
import Navbar from "./component/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Auth from "./pages/Auth";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const login = !!user;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            login ? (
              <SessionProvider>
                <ChatProvider>
                  <Navbar />
                  <Chatinterface />
                  <ToastContainer position="top-center" autoClose={3000} />
                </ChatProvider>
              </SessionProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
      </Routes>
    </>
  );
}

export default App;
