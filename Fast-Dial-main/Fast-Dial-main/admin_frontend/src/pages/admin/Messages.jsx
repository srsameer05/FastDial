import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import SideNevbar from "../../components/SideNevBar";
import NavbarMain from "../../components/NevbarMain";
import { FaPaperPlane } from "react-icons/fa";
import io from "socket.io-client";
import {
  getVendorsRequest,
  selectVendor,
  getChatRoomRequest,
  receiveMessage,
  fetchChatHistoryRequest,
} from "../../saga/features/admin/adminSlice";
import VendorAvatar from "./VendorAvatar";

const Messages = () => {
  const dispatch = useDispatch();
  const { vendors, chat, user, isAuthenticated } = useSelector((state) => state.admin);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionError, setConnectionError] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [localMessages, setLocalMessages] = useState([]);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const maxRetries = 3;
  const chatContainerRef = useRef(null);
  const latestMessageRef = useRef(null);
  const socketRef = useRef(null);
  const [vendorRooms, setVendorRooms] = useState({});

  const adminId = user?.id || localStorage.getItem("adminId");

  useEffect(() => {
    console.log("adminId check:", {
      adminId,
      user,
      localStorage: {
        adminId: localStorage.getItem("adminId"),
        adminToken: localStorage.getItem("adminToken"),
        adminName: localStorage.getItem("adminName"),
      },
    });
  }, [adminId, user]);

  // Socket initialization
  useEffect(() => {
    if (!adminId) {
      console.log("No adminId, skipping socket initialization");
      return;
    }

    socketRef.current = io("https://fastdial.in", {
      query: { token: localStorage.getItem("adminToken") },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: "/socket.io",
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully");
      setConnectionError(null);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
      setConnectionError("Real-time chat unavailable. Please refresh the page.");
    });

    socketRef.current.on("receiveMessage", (data) => {
      console.log("Received message for room_", data.chat_room_id, ":", data);
      if (String(data.chat_room_id) == String(chat.roomId)) {
        dispatch(
          receiveMessage({
            room_id: data.chat_room_id, // Map to room_id for consistency
            sender_id: data.sender_id,
            sender_type: data.sender_type,
            message: data.message,
            sent_at: data.sent_at,
          })
        );
      }
    });

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket");
        socketRef.current.disconnect();
      }
    };
  }, [adminId, dispatch, chat.roomId]);

  // Join room when roomId changes
  useEffect(() => {
    if (socketRef.current && chat.roomId) {
      console.log(`Joining room_${chat.roomId}`);
      socketRef.current.emit("joinRoom", { chat_room_id: chat.roomId });
    }
  }, [chat.roomId]);

  useEffect(() => {
    if (isAuthenticated && adminId) {
      console.log("Fetching vendors");
      dispatch(getVendorsRequest());
    }
  }, [dispatch, isAuthenticated, adminId]);

  // Sync local messages with Redux
  useEffect(() => {
    console.log("Syncing local messages:", chat.messages);
    setLocalMessages(Array.isArray(chat.messages) ? chat.messages : []);
  }, [chat.messages]);

  // Scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current && latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
      console.log("Scrolled to latest message");
    }
  }, [localMessages]);

  // Handle chat room retries
  useEffect(() => {
    if (chat.error && retryCount < maxRetries) {
      setChatError(`Failed to load chat room: ${chat.error}. Retrying (${retryCount + 1}/${maxRetries})...`);
      const timer = setTimeout(() => {
        dispatch(getChatRoomRequest({ vendorId: chat.vendorId, adminId }));
        setRetryCount(retryCount + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (chat.error) {
      setChatError(`Failed to load chat room after ${maxRetries} attempts. Please select another vendor.`);
    } else {
      setChatError(null);
      setRetryCount(0);
    }
  }, [chat.error, retryCount, dispatch, chat.vendorId, adminId]);

  // Loading timeout
  useEffect(() => {
    if (chat.chatHistoryLoading) {
      const timer = setTimeout(() => {
        console.log("Loading timeout triggered");
        setLoadingTimeout(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [chat.chatHistoryLoading]);

  // Fetch chat history
  useEffect(() => {
    if (chat.roomId && chat.vendorId) {
      setVendorRooms((prev) => {
        const updated = { ...prev, [chat.vendorId]: chat.roomId };
        console.log("Updated vendorRooms:", updated);
        return updated;
      });
      console.log("Fetching chat history for room:", chat.roomId);
      dispatch(fetchChatHistoryRequest({ roomId: chat.roomId }));
    }
  }, [dispatch, chat.roomId, chat.vendorId]);

  const handleSelectVendor = (vendorId) => {
    if (!adminId) {
      console.log("No adminId, cannot select vendor");
      setChatError("Please log in to select a vendor.");
      return;
    }
    console.log("Selecting vendor:", vendorId);
    dispatch(selectVendor(vendorId));
    dispatch(getChatRoomRequest({ vendorId, adminId }));
    setRetryCount(0);
  };

  const handleSendMessage = () => {
    if (!chat.roomId) {
      setChatError("Chat room not loaded. Please select a vendor again.");
      console.log("Send failed: No roomId");
      return;
    }
    if (!messageInput.trim()) {
      setChatError("Please enter a message.");
      console.log("Send failed: Empty message");
      return;
    }
    if (!adminId) {
      setChatError("Please log in to send a message.");
      console.log("Send failed: No adminId");
      return;
    }
    console.log("Attempting to send message:", {
      message: messageInput,
      roomId: chat.roomId,
      adminId,
      socketConnected: socketRef.current?.connected,
    });
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendMessage", {
        chat_room_id: chat.roomId, // Match backend expectation
        sender_type: "admin",
        sender_id: adminId,
        message: messageInput,
      });
      console.log("Message emitted to socket");
      setMessageInput("");
    } else {
      console.log("Socket not connected");
      setConnectionError("Cannot send message: chat server unavailable.");
    }
  };

  const vendorList = vendors.map((vendor) => {
    const roomId = vendorRooms[vendor.vendor_id];
    const vendorMessages = roomId && Array.isArray(localMessages)
      ? localMessages.filter((msg) => String(msg.room_id) == String(roomId))
      : [];
    console.log("Vendor messages for", vendor.vendor_id, ":", vendorMessages);
    const lastMessage = vendorMessages.length > 0 ? vendorMessages[vendorMessages.length - 1] : null;
    return {
      ...vendor,
      lastMessage: lastMessage ? lastMessage.message : "No messages yet",
      time: lastMessage
        ? new Date(lastMessage.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
    };
  });

  const filteredVendors = vendorList.filter(
    (vendor) =>
      vendor.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.vendor_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = Array.isArray(localMessages)
    ? localMessages.filter((msg) => String(msg.room_id) == String(chat.roomId))
    : [];
  console.log("Filtered messages:", filteredMessages, "roomId:", chat.roomId, "raw messages:", localMessages);
  const selectedVendor = vendors.find((v) => v.vendor_id === chat.vendorId);

  useEffect(() => {
    console.log(filteredVendors)
  }, [filteredVendors])
  return (
    <>
      <NavbarMain />
      <div className="flex h-screen">
        <SideNevbar />
        <div className="flex-1 flex mx-[40px] my-[40px] h-[80%] gap-2">
          <div className="w-1/3 bg-white border-r flex flex-col h-full shadow-md rounded-l-lg">
            <div className="p-3 relative border-b">
              <input
                type="text"
                placeholder="Search Vendor"
                className="w-full p-2 pl-10 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-5 top-5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.vendor_id}
                  className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${chat.vendorId === vendor.vendor_id ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                  onClick={() => handleSelectVendor(vendor.vendor_id)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                      <VendorAvatar vendor={vendor} />
                    </div>
                    <span className="absolute bottom-0 right-3 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {vendor.vendor_name}
                      </h3>
                      <span className="text-xs text-gray-500">{vendor.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{vendor.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-2/3 flex flex-col h-full bg-white shadow-md rounded-r-lg">
            {connectionError && (
              <div className="p-4 bg-red-100 text-red-700">{connectionError}</div>
            )}
            {chatError && (
              <div className="p-4 bg-red-100 text-red-700">{chatError}</div>
            )}
            {chat.chatHistoryError && (
              <div className="p-4 bg-red-100 text-red-700">{chat.chatHistoryError}</div>
            )}

            {chat.vendorId ? (
              <>
                <div className="bg-white border-b p-3 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                    <VendorAvatar vendor={selectedVendor} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">
                      {vendors.find((v) => v.vendor_id === chat.vendorId)?.vendor_name || "Vendor"}
                    </h3>
                    <span className="text-[#25D366] text-xs">Online</span>
                  </div>
                </div>

                <div
                  className="flex-1 p-4 space-y-4 overflow-y-auto chat-container bg-[#E5DDD5]"
                  ref={chatContainerRef}
                >
                  {chat.chatHistoryLoading && !loadingTimeout && (
                    <div className="text-gray-500 text-center">Loading chat history...</div>
                  )}
                  {(loadingTimeout || (!chat.chatHistoryLoading && filteredMessages.length === 0)) && (
                    <div className="text-gray-500 text-center">
                      {loadingTimeout ? "Loading timed out, please try again" : "No messages yet"}
                    </div>
                  )}
                  {!chat.chatHistoryLoading && filteredMessages.length > 0 && (
                    filteredMessages.map((msg, index) => (
                      <div
                        key={msg.message_id || index}
                        className={`flex mb-2 ${msg.sender_type === "admin" ? "justify-end" : "justify-start"
                          }`}
                        ref={index === filteredMessages.length - 1 ? latestMessageRef : null}
                      >
                        <div
                          className={`relative max-w-[70%] p-3 rounded-lg shadow-sm ${msg.sender_type === "admin" ? "message-admin" : "message-vendor"
                            }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <div className="text-xs text-gray-500 mt-1 text-right">
                            <span>
                              {new Date(msg.sent_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-white p-3 flex items-center border-t sticky bottom-0 z-10">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    className="ml-2 p-2 bg-[#25D366] text-white rounded-full hover:bg-[#20B858] transition-colors"
                    onClick={handleSendMessage}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#E5DDD5]">
                <p className="text-gray-500 text-lg">Select a vendor to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .message-admin {
          background-color: #DCF8C6;
          color: #1C2526;
          border-radius: 12px 12px 0 12px;
          margin-left: auto;
          margin-right: 8px;
        }
        .message-vendor {
          background-color: white;
          color: #1C2526;
          border-radius: 12px 12px 12px 0;
          margin-left: 8px;
          margin-right: auto;
        }
        .chat-container::-webkit-scrollbar {
          display: none;
        }
        .chat-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Messages;
//end//