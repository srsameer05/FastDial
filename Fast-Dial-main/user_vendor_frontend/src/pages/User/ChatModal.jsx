import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";

export default function ChatModal({ chat, socket, onClose, onBack }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatError, setChatError] = useState(null);
  const chatContainerRef = useRef(null);
  const latestMessageRef = useRef(null);
  const hasJoinedRef = useRef(false);

  // Handle socket events
  useEffect(() => {
    if (socket && chat.chat_room_id && !hasJoinedRef.current) {
      console.log("ChatModal: Joining room_", chat.chat_room_id);
      socket.emit("joinRoom", {
        vendor_id: chat.id,
        customer_id: parseInt(chat.customer_id, 10),
      });
      hasJoinedRef.current = true;

      socket.on("receiveMessage", (data) => {
        console.log("Received message:", data);
        if (String(data.chat_room_id) === String(chat.chat_room_id)) {
          setMessages((prev) => [
            ...prev,
            {
              message_id: data.message_id || Date.now(),
              room_id: data.chat_room_id,
              sender_id: data.sender_id,
              sender_type: data.sender_type,
              message: data.message,
              sent_at: data.sent_at || new Date().toISOString(),
            },
          ]);
        }
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
        setChatError(error.message || "An error occurred in the chat.");
      });

      socket.on("joinedRoom", ({ chat_room_id }) => {
        console.log("ChatModal: Successfully joined room_", chat_room_id);
        setChatError(null);
      });

      return () => {
        socket.off("receiveMessage");
        socket.off("error");
        socket.off("joinedRoom");
      };
    }
  }, [socket, chat.chat_room_id, chat.id, chat.customer_id]);

  // Scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current && latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
      console.log("Scrolled to latest message");
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!chat.chat_room_id) {
      setChatError("Chat room not loaded. Please try again.");
      console.log("Send failed: No chat_room_id");
      return;
    }
    if (!messageInput.trim()) {
      setChatError("Please enter a message.");
      console.log("Send failed: Empty message");
      return;
    }
    if (!socket || !socket.connected) {
      setChatError("Cannot send message: chat server unavailable.");
      console.log("Send failed: Socket not connected");
      return;
    }
    if (!chat.customer_id) {
      setChatError("Please log in to send a message.");
      console.log("Send failed: No customer_id");
      return;
    }
    console.log("Sending message:", { message: messageInput, chat_room_id: chat.chat_room_id });
    socket.emit("sendMessage", {
      vendor_id: chat.id,
      customer_id: parseInt(chat.customer_id, 10),
      sender_type: "customer",
      sender_id: parseInt(chat.customer_id, 10),
      message: messageInput,
    });
    setMessageInput("");
  };

  const handleImageError = (e) => {
    console.warn("Image failed to load:", e.target.src);
    e.target.src = "/fallback-avatar.png";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 mr-2"
            aria-label="Back to vendors"
          >
            <FaArrowLeft />
          </button>
          <img
            src={chat.avatar || "https://placehold.co/40x40"}
            alt={`${chat.name}'s avatar`}
            className="w-10 h-10 rounded-full"
            onError={handleImageError}
          />
          <div>
            <h2 className="text-lg font-semibold">{chat.name}</h2>
            <p className="text-sm text-gray-500">{chat.role}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
      {chatError && (
        <p className="text-red-500 text-center mb-2">{chatError}</p>
      )}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E5DDD5]"
        ref={chatContainerRef}
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.message_id || index}
              className={`flex mb-2 ${
                msg.sender_type === "customer" ? "justify-end" : "justify-start"
              }`}
              ref={index === messages.length - 1 ? latestMessageRef : null}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                  msg.sender_type === "customer"
                    ? "bg-[#DCF8C6] text-[#1C2526]"
                    : "bg-white text-[#1C2526]"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.sent_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 flex items-center border-t">
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 p-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}