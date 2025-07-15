import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useChat } from "../context/ChatContext";

const RightNav = () => {
  const { youtubeLinks = [] } = useChat();
  const [selectedVideo, setSelectedVideo] = useState(null);

  const extractVideoId = (url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtube.com")) {
        return parsedUrl.searchParams.get("v");
      } else if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1);
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleOpenPopup = (video) => setSelectedVideo(video);
  const handleClosePopup = () => setSelectedVideo(null);

  return (
    <div className="w-64  rounded-md p-4 flex flex-col items-center relative border border-blue-300">
      <h2 className="text-2xl font-semibold bg-[#c7243b] text-white rounded-full w-full text-center py-2 px-4 cursor-pointer">
        Video
      </h2>

      <div className="space-y-6 mt-4 w-full overflow-y-auto max-h-[75vh]">
        {youtubeLinks.length > 0 ? (
          youtubeLinks.map((video, index) => {
            const videoId = extractVideoId(video.url);
            const thumbnailUrl = videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : "https://via.placeholder.com/640x360?text=No+Thumbnail";

            return (
              <div
                key={`${video.url}-${index}`}
                className="relative border border-black rounded-md overflow-hidden cursor-pointer w-full"
                onClick={() => handleOpenPopup(video)}
              >
                <img
                  src={thumbnailUrl}
                  alt={video.title || "Video thumbnail"}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Play className="text-white w-6 h-6" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-sm p-2">
                  {video.title}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-600 text-sm text-center mt-6">
            No videos available.
          </p>
        )}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-white/30 shadow-xl backdrop-blur-md bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-xl max-w-3xl w-full relative">
            <button
              onClick={handleClosePopup}
              className="absolute top-1 right-1 text-black font-bold hover:text-black text-xl"
            >
              ✕
            </button>
            <div className="relative w-full h-0 pb-[56.25%] mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${extractVideoId(
                  selectedVideo.url
                )}`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute rounded-md top-0 left-0 w-full h-full"
                title={selectedVideo.title}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightNav;
