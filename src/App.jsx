import { SessionProvider } from "./context/SessionContext";
import { ChatProvider } from "./context/ChatContext";
import Chatinterface from "./component/Chatinterface";
import Navbar from "./component/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <SessionProvider>
      <ChatProvider>
        <Navbar /> 
        <Chatinterface />
         <ToastContainer position="top-center" autoClose={3000} />
      </ChatProvider>
    </SessionProvider>

  );
}

export default App;
