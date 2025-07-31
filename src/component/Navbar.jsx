import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.name) setUserName(parsed.name);
      } catch (err) {
        console.error("Error parsing user object", err);
      }
    }
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const handleFeedbackSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      let userId = sessionStorage.getItem("userId");
      let sessionId = sessionStorage.getItem("sessionId");

      if (!userId) {
        const user = localStorage.getItem("user");
        if (user) {
          try {
            const parsed = JSON.parse(user);
            userId = parsed.id || 0;
          } catch (err) {
            console.error("Error parsing user object", err);
          }
        }
      }

      const payload = {
        userId: userId ? parseInt(userId) : 0,
        session_id: sessionId || "00000000-0000-0000-0000-000000000000",
        feedback: feedback,
      };

      console.log("Submitting feedback with payload:", payload);

      const res = await fetch(`${BASE_URL}/api/user/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Feedback submitted successfully");
        console.log("Feedback API response:", data);
        setFeedback("");
        setIsFeedbackOpen(false);
      } else {
        toast.error(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting feedback");
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-400 to-yellow-400 h-16 flex items-center justify-between px-2 relative">
      <div className="flex items-center">
        <img
          src="/logo.png"
          alt="Bitcoin Logo"
          className="w-16 h-16 md:w-28 md:h-28"
        />
        <h1 className="text-[#1f2630] text-2xl md:text-4xl font-bold">
          Bitcoin GPT
        </h1>
      </div>

      {/* User Icon */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <FaUserCircle className="text-[#1f2630] text-3xl" />
          <span className="text-[#1f2630] font-medium hidden sm:block">
            {userName}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
            <button
              onClick={() => {
                setIsFeedbackOpen(true);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:rounded-lg"
            >
              Feedback
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Feedback Popup Modal */}
      {isFeedbackOpen && (
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-50">

          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Submit Feedback</h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="Write your feedback..."
              rows="4"
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-4 py-2 rounded bg-orange-400 text-white hover:bg-orange-500"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
