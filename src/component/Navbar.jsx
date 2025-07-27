import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login"; // Redirect to login
  };

  const handleFeedbackSubmit = async () => {
    try {
      const res = await fetch("/api/user/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });

      if (res.ok) {
        alert("Feedback submitted successfully");
        setFeedback("");
        setIsFeedbackOpen(false);
      } else {
        alert("Failed to submit feedback");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting feedback");
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
            John Doe
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
            <button
              onClick={() => {
                setIsFeedbackOpen(true);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Feedback
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Feedback Popup Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
