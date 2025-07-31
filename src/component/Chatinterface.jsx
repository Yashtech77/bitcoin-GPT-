
import { useState, useEffect, useRef } from "react";
import SideNav from "./SideNav";
import { useChat } from "../context/ChatContext";
import { useSession } from "../context/SessionContext";
import RightNav from "./RightNav";
import { Menu, PanelRight, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function Chatinterface() {
  const [input, setInput] = useState("");
  const {
    messages,
    sendMessage,
    loading,
    sessionLoading,
    videoUrl,
    youtubeLinks,
  } = useChat();
  
  const { currentSessionId, setCurrentSessionId } = useSession();
  const [hasUsedSession, setHasUsedSession] = useState(false);

  const [showSideNav, setShowSideNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ Automatically create a new session after login if none exists
const createNewSession = async () => {
  try {
    const token = localStorage.getItem("token"); // 🔐 Get token from local storage

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sessions/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ Set token in headers
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();

    setCurrentSessionId(data.session_id || data.id); // Adjust based on your backend response
  } catch (err) {
    console.error("Error creating session:", err);
  }
};



const hasCreatedRef = useRef(false); // 🛡 Prevent double call

useEffect(() => {
  if (!currentSessionId && !hasCreatedRef.current) {
    hasCreatedRef.current = true; // ✅ Lock once
    createNewSession();
  }
}, []);

  useEffect(() => {
    if (currentSessionId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
    inputRef.current?.focus();
    setHasUsedSession(true); // mark the session as used

  };

  const handleSessionSelect = (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowSideNav(false);
  };

  const isInputDisabled = loading || sessionLoading || !currentSessionId;

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
        <SideNav
  openToggle={true}
  setOpenToggle={setShowSideNav}
  onSessionSelect={handleSessionSelect}
  hasUsedSession={hasUsedSession}              // ✅ pass state
  setHasUsedSession={setHasUsedSession}        // ✅ pass setter
/>

        </div>

        {/* Mobile SideNav */}
        {showSideNav && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
            <div className="bg-white w-[250px] h-full p-2 overflow-y-auto">
            <SideNav
  openToggle={true}
  setOpenToggle={setShowSideNav}
  onSessionSelect={handleSessionSelect}
  hasUsedSession={hasUsedSession}              // ✅ pass state
  setHasUsedSession={setHasUsedSession}        // ✅ pass setter
/>

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
                <h1 className="text-2xl md:text-4xl font-bold text-[orange] mt-4">
                  Bitcoin GPT
                </h1>
                <p className="text-md md:text-lg text-[#1f2630] text-center">
                  ( Where Curiosity Meets Bitcoin, Powered by AI )
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isAssistant = msg.role === "assistant";
                return (
                  <div
                    key={idx}
                    className={`relative rounded-md p-1 mb-4 text-sm md:text-base ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`${
                        isAssistant
                          ? "bg-[#f5f5f5] text-black"
                          : "bg-red-50 border border-gray-400 text-black"
                      } rounded-xl shadow px-4 py-2 inline-block max-w-[80%] break-words text-left`}
                    >
                      <ReactMarkdown
                        children={msg.content.trim()}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-lg font-semibold mt-4 mb-2" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-md font-semibold mt-3 mb-1" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="mb-2 leading-relaxed" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-6 space-y-1 text-left" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-6 space-y-1 text-left" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="text-sm md:text-base" {...props} />
                          ),
                          code({ node, inline, className, children, ...props }) {
                            return !inline ? (
                              <pre className="bg-gray-900 text-white p-3 rounded-md overflow-x-auto text-sm">
                                <code className={className} {...props}>{children}</code>
                              </pre>
                            ) : (
                              <code className="bg-gray-200 text-sm rounded px-1 py-0.5">
                                {children}
                              </code>
                            );
                          },
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-gray-400 pl-4 italic text-gray-600"
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              className="text-blue-600 underline hover:text-blue-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                        }}
                      />
                    </div>
                  </div>
                );
              })
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
            <textarea
  placeholder={
    sessionLoading
      ? "Creating session..."
      : "Ask Anything About bitcoin"
  }
  className="w-full border rounded-xl px-4 py-4 pr-12 text-sm focus:outline-none disabled:bg-gray-100 resize-none"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  ref={inputRef}
  disabled={isInputDisabled}
  rows={1}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isInputDisabled) handleSend(e);
    }
  }}
/>

            {sessionLoading && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8"
              disabled={isInputDisabled || input.trim() === ""}
            >
              <Send color="orange" />
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
