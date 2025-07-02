import { useEffect, useState } from "react";
import { ListCollapse, Trash2, Pencil, Check, X } from "lucide-react";
import { useSession } from "../context/SessionContext";
import { useChat } from "../context/ChatContext"; // ✅ Get messages
import { toast } from "react-toastify";
import { createPortal } from "react-dom";

function Portal({ children }) {
  return createPortal(children, document.body);
}

const SideNav = ({ openToggle, setOpenToggle }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const { setCurrentSessionId } = useSession();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const { messages } = useChat(); // ✅ Get current chat messages

  const handleToggle = () => setOpenToggle((prev) => !prev);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://bitcoingpt.techjardemo.in/api/sessions/");
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setSessions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // ✅ Only allow new chat if previous one is not empty
  const handleNewChat = async () => {
    // if (messages.length === 0) {
    //   toast.warn("Please send a message before starting a new chat.");
    //   return;
    // }
    if (messages.length === 0) {
  toast.warn("Please send a message before starting a new chat.", {
    className: "bg-[#E22B2B] border border-[#E22B2B] text-[#E22B2B] font-medium rounded-lg shadow-md",
    bodyClassName: "text-sm",
    progressClassName: "bg-[#E22B2B]",
    icon: "",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  return;
}

    setLoading(true);
    try {
      const res = await fetch("https://bitcoingpt.techjardemo.in/api/sessions/new", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to create new chat session.");
      const newSession = await res.json();
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.session_id);
    } catch (err) {
      toast.error("Failed to create new chat session.");
    }
    setLoading(false);
  };

  const handleDeleteSession = async (session_id) => {
    setLoading(true);
    try {
      await fetch(`https://bitcoingpt.techjardemo.in/api/sessions/${session_id}`, {
        method: "DELETE",
      });
      setSessions((prev) => prev.filter((s) => s.session_id !== session_id));
    } catch (err) {
      alert("Failed to delete chat session.");
    }
    setLoading(false);
  };

  const handleRenameSession = async (session_id) => {
    if (!renameValue.trim()) return;
    setLoading(true);
    try {
      await fetch(`https://bitcoingpt.techjardemo.in/api/sessions/${session_id}/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue }),
      });
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === session_id ? { ...s, title: renameValue } : s
        )
      );
      setRenamingId(null);
      setRenameValue("");
    } catch (err) {
      alert("Failed to rename chat session.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!openToggle) {
    return (
      <div className="p-2">
        <button
          onClick={handleToggle}
          className={`text-[#6e1c1c] hover:bg-[#f9f3e7] p-2 rounded-md transition cursor-pointer ${
            !openToggle && "absolute top-36 z-50"
          }`}
          title="Expand"
        >
          <ListCollapse className="-rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[85vh] bg-[#ffffff] p-4 flex flex-col justify-start transition-all duration-300">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold bg-[#E22B2B] text-white rounded-full w-full text-center py-2 px-4 cursor-pointer">
            Chat History
          </h2>
        </div>

        {/* Chat List */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar gap-3 flex flex-col">
            {loading ? (
              <span className="text-[#6e1c1c] text-sm">Loading...</span>
            ) : sessions.length === 0 ? (
              <span className="text-[#6e1c1c] text-sm">No sessions found</span>
            ) : (
              sessions.map((session, idx) => (
                <div
                  key={session.session_id || idx}
                  className="relative group bg-white text-[#6e1c1c] hover:bg-[#E22B2B] hover:text-white rounded-full px-2 py-2 flex justify-between items-center cursor-pointer"
                  onClick={() => {
                    setCurrentSessionId(session.session_id);
                  }}
                >
                  {/* Rename input OR title */}
                  {renamingId === session.session_id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        className="text-sm text-[#6e1c1c] border border-yellow-400 focus:outline-none focus:border-yellow-500 rounded-full px-2 py-0.5 bg-transparent"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSession(session.session_id);
                          if (e.key === "Escape") {
                            setRenamingId(null);
                            setRenameValue("");
                          }
                        }}
                        autoFocus
                        disabled={loading}
                      />
                      <button onClick={() => handleRenameSession(session.session_id)}>
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setRenamingId(null);
                          setRenameValue("");
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm truncate max-w-[160px]">
                        {session.title || "No Title"}
                      </span>

                      <div
                        className="relative ml-2 group-hover:opacity-100 opacity-0 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDropdownPosition({
                            left: rect.right - 128,
                            top: rect.bottom + 8,
                          });
                          setOpenDropdownId((prev) =>
                            prev === session.session_id ? null : session.session_id
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 cursor-pointer"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="19" cy="12" r="1.5" />
                        </svg>

                        {openDropdownId === session.session_id && (
                          <Portal>
                            <div
                              style={{
                                position: "fixed",
                                left: dropdownPosition.left,
                                top: dropdownPosition.top,
                                width: "8rem",
                                zIndex: 9999,
                              }}
                              className="bg-white text-black rounded-md shadow-lg"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                onClick={() => {
                                  setRenamingId(session.session_id);
                                  setRenameValue(session.title || "");
                                  setOpenDropdownId(null);
                                }}
                              >
                                <Pencil size={14} /> Rename
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                                onClick={() => {
                                  handleDeleteSession(session.session_id);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </Portal>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-[#6e1c1c]/20 pt-4">
        <button
          className="w-full bg-[#E22B2B] shadow-xl/30 hover:shadow-xl/40 text-white rounded-full py-2 text-sm"
          onClick={handleNewChat}
          disabled={loading}
        >
          + New Chat
        </button>
      </div>
    </div>
  );
};

export default SideNav;
