import { useState, useEffect, useRef } from "react";
import SideNav from "./SideNav";
import { useChat } from "../context/ChatContext";
import ReactMarkdown from "react-markdown";
import RightNav from "./RightNav";
import { Menu, PanelRight } from "lucide-react";
import { useSession } from "../context/SessionContext";

export default function Chatinterface() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, loading } = useChat();
  const { setCurrentSessionId } = useSession();
  const [showSideNav, setShowSideNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleSessionSelect = (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowSideNav(false); // hide SideNav on mobile
  };

  return (
    <div className="w-full h-[89vh] bg-blue-100 p-2 md:p-4">
      {/* Mobile Nav Toggles */}
      <div className="md:hidden flex justify-between items-center mb-2">
        <button onClick={() => setShowSideNav(true)}>
          <Menu className="text-red-700" />
        </button>
        <button onClick={() => setShowRightNav(true)}>
          <PanelRight className="text-red-700" />
        </button>
      </div>

      <div className="flex h-full gap-2 md:gap-4 md:flex-row flex-col">
        {/* Desktop SideNav */}
        <div className="hidden md:block w-[250px] h-[87vh] bg-white rounded-lg p-2">
          <SideNav openToggle={true} setOpenToggle={setShowSideNav} onSessionSelect={handleSessionSelect} />
        </div>

        {/* Mobile SideNav */}
        {showSideNav && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
            <div className="bg-white w-[250px] h-full p-2 overflow-y-auto">
              <SideNav openToggle={true} setOpenToggle={setShowSideNav} onSessionSelect={handleSessionSelect} />
            </div>
            <div className="flex-1" onClick={() => setShowSideNav(false)}></div>
          </div>
        )}

        {/* Main Chat Section */}
        <div className="flex flex-col bg-[#fdfdfd] p-4 rounded-lg justify-between flex-1 h-[89vh] overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-5">
            {messages.length === 0 && !loading ? (
              <div className="flex flex-col justify-center items-center h-full">
                <img src="/logo.png" className="w-40 h-40 md:w-52 md:h-52" />
                <h1 className="text-2xl md:text-4xl font-bold text-[#E22B2B] mt-4">
                  Bitcoin GPT
                </h1>
                <p className="text-md md:text-lg text-[#6e1c1c] text-center">
                  ( Where Curiosity Meets Bitcoin, Powered by AI )
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-md shadow p-1 mb-4 text-sm md:text-base ${
                    msg.role === "user"
                      ? "bg-red-50 border border-gray-400 w-full md:w-1/2 ml-auto"
                      : "bg-white ml-0 md:ml-4 md:mr-48"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-black m-3">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </span>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-2 ml-4 mb-2 animate-pulse">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <span className="ml-2 text-sm text-gray-500">Thinking...</span>
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          {/* Chat Input */}
          <form className="relative mt-2 w-full" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask Anything About bitcoin"
              className="w-full border rounded-full px-4 py-4 pr-12 text-sm focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              ref={inputRef}
              disabled={loading}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8"
              disabled={loading}
            >
              <img
                src="/send-message.jpg"
                alt="send"
                className="h-full w-full object-contain rounded-full"
              />
            </button>
          </form>
        </div>

        {/* Desktop RightNav */}
        <div className="hidden md:block w-[300px] bg-white rounded-lg p-4 h-[87vh] overflow-hidden">
          <RightNav />
        </div>

        {/* Mobile RightNav */}
        {showRightNav && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-[300px] h-full p-4 overflow-y-auto">
              <RightNav />
            </div>
            <div className="flex-1" onClick={() => setShowRightNav(false)}></div>
          </div>
        )}
      </div>
    </div>
  );
}
