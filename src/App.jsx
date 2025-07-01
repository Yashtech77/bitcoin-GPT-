import { SessionProvider } from "./context/SessionContext";
import { ChatProvider } from "./context/ChatContext";
import Chatinterface from "./component/Chatinterface";
import Navbar from "./component/Navbar";

function App() {
  return (
    <SessionProvider>
      <ChatProvider>
        <Navbar /> 
        <Chatinterface />
      </ChatProvider>
    </SessionProvider>
  );
}

export default App;
