import { useState, useEffect } from "react";
import SideNav from "./SideNav";
import { useChat } from "../context/ChatContext";
import ReactMarkdown from "react-markdown";
import RightNav from "./RightNav";

export default function Chatinterface() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, loading } = useChat();
  const [openToggle, setOpenToggle] = useState(true);

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  };

  return (
    <div className="w-full h-[89vh] bg-blue-100 p-4">
      <div className="flex h-full gap-4">
        {openToggle && (
          <div className="w-[250px] h-[87vh] bg-white rounded-lg p-2">
            <SideNav openToggle={openToggle} setOpenToggle={setOpenToggle} />
          </div>
        )}

        <div className="flex flex-col bg-[#fdfdfd] p-4 rounded-lg justify-between  flex-1 h-[89vh] overflow-hidden">
          <div className="flex-1 overflow-y-auto  custom-scrollbar pb-5">
            {messages.length === 0 && !loading ? (
              <div className="flex flex-col justify-center items-center h-full">
                <img src="/logo.png" className="w-52 h-52" />
                <h1 className="text-4xl font-bold text-[#E22B2B] mt-4">
                  Bitcoin GPT
                </h1>
                <p className="text-lg text-[#6e1c1c]">
                  ( Where Curiosity Meets Bitcoin, Powered by AI )
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-md shadow p-1 mb-4 ${
                    msg.role === "user"
                      ? "bg-red-50 border border-gray-400 w-1/2 ml-auto"
                      : "bg-white ml-4 mr-48"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-black text-xl m-3">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </span>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-center items-center">
                <span className="text-gray-500">Thinking...</span>
              </div>
            )}
          </div>

          <form className="relative mt-4 w-full" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask Anything About bitcoin"
              className="w-full border rounded-full px-4 py-4 pr-12 text-sm focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
                className="h-full shadow-xl/30 hover:shadow-xl/40 w-full object-contain rounded-full"
              />
            </button>
          </form>
        </div>

        <div className="w-[300px] bg-white rounded-lg p-4 h-[88vh] overflow-y-auto">
          <RightNav />
        </div>
      </div>
    </div>
  );
}
