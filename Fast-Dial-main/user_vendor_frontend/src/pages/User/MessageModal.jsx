 import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import hold from '../../assets/profile.png'
import {
  getVendorsRequest,
  restoreUser,
  getCustomerDataRequest,
  selectVendor,
  receiveMessage,
  fetchChatHistoryRequest,
  getVendorsForChatRequest,
} from "../../saga/features/customer/customerSlice";

export default function MessageModal({ open, onClose }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionError, setConnectionError] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [chatError, setChatError] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const maxRetries = 3;
  const socketRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const chatContainerRef = useRef(null);
  const latestMessageRef = useRef(null);
  const isSendingRef = useRef(false);

  const dispatch = useDispatch();
  const { 
    vendors,
    vendorsLoading,
    vendorsError,
    vendorsForChat,
    vendorsForChatLoading,
    vendorsForChatError,
    user,
    token,
    customerLoading,
    customerError,
    chat 
  } = useSelector((state) => state.customer);

 const SOCKET_URL = "http://localhost:3000";

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setConnectionError(null);
      setChatError(null);
      setSelectedChat(null);
      setSearchQuery("");
      setRetryCount(0);
      hasJoinedRef.current = false;
      setSocketConnected(false);
    }
  }, [open]);

  // Restore user on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log("MessageModal: Initial state:", {
      storedToken,
      reduxUser: user,
      reduxToken: token,
    });
    if (storedToken && !user?.customer_id && !customerLoading) {
      try {
        const decoded = jwtDecode(storedToken);
        console.log("MessageModal: Decoded token:", decoded);
        if (decoded?.customer_id) {
          console.log("MessageModal: Restoring user with customer_id:", decoded.customer_id);
          dispatch(restoreUser({ user: { customer_id: decoded.customer_id, mobile: decoded.mobile }, token: storedToken }));
          dispatch(getCustomerDataRequest({ customer_id: decoded.customer_id }));
        } else {
          console.warn("MessageModal: No customer_id in token");
          setConnectionError("Invalid token. Please log in again.");
        }
      } catch (error) {
        console.error("MessageModal: Error decoding token:", error.message);
        setConnectionError("Invalid token. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("customer_id");
      }
    } else if (!storedToken && open) {
      console.warn("MessageModal: No token found");
      setConnectionError("Please log in to start chatting.");
    }
  }, [dispatch, user?.customer_id, customerLoading, open]);

  // Initialize socket connection
  useEffect(() => {
    const storedToken = localStorage.getItem("token") || token;
    let customerId = user?.customer_id;
    if (storedToken && !customerId) {
      try {
        const decoded = jwtDecode(storedToken);
        customerId = decoded?.customer_id;
      } catch (error) {
        console.error("Socket init: Error decoding token:", error.message);
        setConnectionError("Invalid token. Please log in again.");
        return;
      }
    }
    console.log("Socket init:", { customerId, reduxToken: token, storedToken, open });

    if (storedToken && customerId && open && !socketRef.current) {
      console.log("Attempting socket connection to:", SOCKET_URL);
      socketRef.current = io(SOCKET_URL, {
        query: { token: storedToken },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        path: "/socket.io",
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected successfully, ID:", socketRef.current.id);
        setSocketConnected(true);
        setConnectionError(null);
        if (selectedChat?.id && selectedChat?.customer_id) {
          socketRef.current.emit("joinRoom", {
            vendor_id: selectedChat.id,
            customer_id: customerId,
          });
        }
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message, error);
        setSocketConnected(false);
        setConnectionError("Real-time chat unavailable. Please refresh the page.");
      });

      socketRef.current.on("error", (error) => {
        console.error("Socket error:", error);
        setChatError(error.message || "An error occurred in the chat.");
      });

      socketRef.current.on("joinedRoom", ({ chat_room_id }) => {
        console.log(`Successfully joined room_${chat_room_id}`);
        setConnectionError(null);
        hasJoinedRef.current = true;
        setRetryCount(0);
        setSelectedChat((prev) =>
          prev ? { ...prev, chat_room_id } : prev
        );
        dispatch(fetchChatHistoryRequest({ roomId: chat_room_id }));
      });

      socketRef.current.on("receiveMessage", (data) => {
        console.log("Received message:", {
          data,
          currentRoomId: chat.roomId,
          selectedChatRoomId: selectedChat?.chat_room_id,
          matches: String(data.chat_room_id) === String(chat.roomId),
        });
        if (!data || !data.chat_room_id || !data.sender_id || !data.sender_type || !data.message || !data.sent_at) {
          console.error("Invalid message data received:", data);
          return;
        }
        dispatch(
          receiveMessage({
            room_id: data.chat_room_id,
            sender_id: data.sender_id,
            sender_type: data.sender_type,
            message: data.message,
            sent_at: data.sent_at,
            message_id: data.message_id,
          })
        );
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setSocketConnected(false);
        setConnectionError("Chat disconnected. Attempting to reconnect...");
      });

      return () => {
        if (socketRef.current) {
          console.log("Disconnecting socket");
          socketRef.current.off("receiveMessage");
          socketRef.current.off("error");
          socketRef.current.off("joinedRoom");
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } else if (open) {
      console.warn("Socket init: No token or customer_id available");
      setConnectionError("Please log in to start chatting.");
    }
  }, [user?.customer_id, token, open, dispatch, selectedChat?.id, selectedChat?.customer_id, chat.roomId]);

  // Fetch vendors and customer data
  useEffect(() => {
    if (open) {
      console.log("MessageModal opened, Redux state:", { user, token, chat });
      console.log("LocalStorage:", {
        token: localStorage.getItem("token"),
        customer_id: localStorage.getItem("customer_id"),
      });
      if (!vendorsForChat.length && !vendorsForChatLoading && user?.customer_id) {
        console.log("Dispatching getVendorsForChatRequest");
        dispatch(getVendorsForChatRequest());
      }
      if (!user?.customer_id && !customerLoading) {
        console.log("Fetching customer data");
        setIsLoadingCustomer(true);
        const storedToken = localStorage.getItem("token") || token;
        if (storedToken) {
          try {
            const decoded = jwtDecode(storedToken);
            if (decoded?.customer_id) {
              console.log("Customer ID from token:", decoded.customer_id);
              dispatch(restoreUser({ user: { customer_id: decoded.customer_id, mobile: decoded.mobile }, token: storedToken }));
              dispatch(getCustomerDataRequest({ customer_id: decoded.customer_id }));
            } else {
              console.error("No customer_id in token");
              setConnectionError("Invalid token. Please log in again.");
            }
          } catch (error) {
            console.error("Error decoding token:", error.message);
            setConnectionError("Invalid token. Please log in again.");
          }
        } else {
          console.error("No token found");
          setConnectionError("Please log in again to start chatting.");
        }
      }
    }
    if (!customerLoading) {
      setIsLoadingCustomer(false);
    }
  }, [open, dispatch, vendorsForChat.length, vendorsForChatLoading, user, token, customerLoading]);

  // Scroll to latest message
  useEffect(() => {
    console.log("Messages updated:", chat.messages);
    console.log("Current chat room_id:", chat.roomId);
    const filteredMessages = Array.isArray(chat.messages)
      ? chat.messages.filter((msg) => {
          const matches = String(msg.room_id) === String(chat.roomId);
          console.log("Filtering message:", {
            message: msg.message,
            msgRoomId: msg.room_id,
            selectedRoomId: chat.roomId,
            msgRoomIdType: typeof msg.room_id,
            selectedRoomIdType: typeof chat.roomId,
            messageId: msg.message_id,
            matches,
          });
          return matches;
        })
      : [];
    console.log("filteredMessages:", filteredMessages);
    if (chatContainerRef.current && latestMessageRef.current && filteredMessages.length > 0) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
      console.log("Scrolled to latest message");
    }
  }, [chat.messages, chat.roomId]);

  // Loading timeout for chat history
  useEffect(() => {
    if (chat.chatHistoryLoading) {
      const timer = setTimeout(() => {
        console.log("Chat history loading timeout triggered");
        setLoadingTimeout(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [chat.chatHistoryLoading]);

  const filteredVendors = vendorsForChat.filter((vendor) =>
    vendor.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectVendor = (vendor) => {
    const storedToken = localStorage.getItem("token") || token;
    let customerId = user?.customer_id;

    if (storedToken && !customerId) {
      try {
        const decoded = jwtDecode(storedToken);
        customerId = decoded?.customer_id;
      } catch (error) {
        console.error("handleSelectVendor: Error decoding token:", error.message);
        setConnectionError("Invalid token. Please log in again.");
        return;
      }
    }

    console.log("handleSelectVendor:", { socket: !!socketRef.current, socketConnected, customerId, customerLoading });

    // Disconnect the previous socket connection if it exists
    if (socketRef.current) {
      console.log("Disconnecting previous socket connection");
      socketRef.current.off("receiveMessage");
      socketRef.current.off("error");
      socketRef.current.off("joinedRoom");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
      hasJoinedRef.current = false;
    }

    if (customerId && storedToken && !customerLoading) {
      // Create new socket connection
      console.log("Attempting new socket connection to:", SOCKET_URL);
      socketRef.current = io(SOCKET_URL, {
        query: { token: storedToken },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        path: "/socket.io",
      });

      // Set up socket event listeners
      socketRef.current.on("connect", () => {
        console.log("Socket connected successfully, ID:", socketRef.current.id);
        setSocketConnected(true);
        setConnectionError(null);
        const joinRoomPayload = {
          vendor_id: vendor.vendor_id,
          customer_id: customerId,
        };
        console.log("Joining room with payload:", joinRoomPayload);
        socketRef.current.emit("joinRoom", joinRoomPayload);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message, error);
        setSocketConnected(false);
        setConnectionError("Real-time chat unavailable. Please refresh the page.");
      });

      socketRef.current.on("error", (error) => {
        console.error("Socket error:", error);
        setChatError(error.message || "An error occurred in the chat.");
      });

      socketRef.current.on("joinedRoom", ({ chat_room_id }) => {
        console.log(`Successfully joined room_${chat_room_id}`);
        setConnectionError(null);
        hasJoinedRef.current = true;
        setRetryCount(0);
        setSelectedChat((prev) =>
          prev ? { ...prev, chat_room_id } : prev
        );
        dispatch(fetchChatHistoryRequest({ roomId: chat_room_id }));
      });

      socketRef.current.on("receiveMessage", (data) => {
        console.log("Received message:", {
          data,
          currentRoomId: chat.roomId,
          selectedChatRoomId: selectedChat?.chat_room_id,
          matches: String(data.chat_room_id) === String(chat.roomId),
        });
        if (!data || !data.chat_room_id || !data.sender_id || !data.sender_type || !data.message || !data.sent_at) {
          console.error("Invalid message data received:", data);
          return;
        }
        dispatch(
          receiveMessage({
            room_id: data.chat_room_id,
            sender_id: data.sender_id,
            sender_type: data.sender_type,
            message: data.message,
            sent_at: data.sent_at,
            message_id: data.message_id,
          })
        );
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setSocketConnected(false);
        setConnectionError("Chat disconnected. Attempting to reconnect...");
      });

      // Retry logic
      const joinRoomPayload = {
        vendor_id: vendor.vendor_id,
        customer_id: customerId,
      };
      const retryInterval = setInterval(() => {
        if (!hasJoinedRef.current && retryCount < maxRetries) {
          console.log(`Retrying joinRoom (${retryCount + 1}/${maxRetries})`);
          socketRef.current.emit("joinRoom", joinRoomPayload);
          setRetryCount((prev) => prev + 1);
        } else if (!hasJoinedRef.current) {
          console.warn("Max retries reached for joinRoom");
          setConnectionError("Failed to join chat room. Please try again.");
          clearInterval(retryInterval);
        }
      }, 2000);

      dispatch(selectVendor(vendor.vendor_id));
      setSelectedChat({
        id: vendor.vendor_id,
        name: vendor.vendor_name,
        role: vendor.service_category || "Vendor",
        avatar: vendor.avatar || hold,
        chat_room_id: null,
        customer_id: customerId,
      });

      return () => clearInterval(retryInterval);
    } else {
      console.error("Cannot join room: Socket, customer_id, or token missing", {
        socket: !!socketRef.current,
        socketConnected,
        customerId,
        storedToken,
        customerLoading,
      });
      setConnectionError("Unable to start chat. Please ensure you are logged in and try again.");
    }
  };

  const handleSendMessage = () => {
    if (isSendingRef.current) {
      console.log("Send aborted: Already sending");
      return;
    }
    if (!chat.roomId) {
      setChatError("Chat room not loaded. Please try again.");
      console.log("Send failed: No chat.roomId");
      return;
    }
    if (!messageInput.trim()) {
      setChatError("Please enter a message.");
      console.log("Send failed: Empty message");
      return;
    }
    if (!socketRef.current || !socketConnected) {
      setChatError("Cannot send message: chat server unavailable.");
      console.log("Send failed: Socket not connected");
      return;
    }
    if (!selectedChat.customer_id) {
      setChatError("Please log in to send a message.");
      console.log("Send failed: No customer_id");
      return;
    }
    isSendingRef.current = true;
    const tempMessageId = `temp-${Date.now()}`;
    const messageData = {
      vendor_id: selectedChat.id,
      customer_id: parseInt(selectedChat.customer_id, 10),
      sender_type: "customer",
      sender_id: parseInt(selectedChat.customer_id, 10),
      message: messageInput,
      chat_room_id: chat.roomId,
    };
    console.log("Sending message:", messageData);
    dispatch(
      receiveMessage({
        room_id: chat.roomId,
        sender_id: parseInt(selectedChat.customer_id, 10),
        sender_type: "customer",
        message: messageInput,
        sent_at: new Date().toISOString(),
        message_id: tempMessageId,
      })
    );
    socketRef.current.emit("sendMessage", messageData);
    setMessageInput("");
    setChatError(null);
    setTimeout(() => {
      isSendingRef.current = false;
    }, 500);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageError = (e) => {
    console.warn("Image failed to load:", e.target.src);
    e.target.src = hold;
  };

  const handleBack = () => {
    setSelectedChat(null);
    setChatError(null);
    setRetryCount(0);
    hasJoinedRef.current = false;
    dispatch(selectVendor(null));
  };

  const filteredMessages = Array.isArray(chat.messages)
    ? chat.messages.filter((msg) => {
        const matches = String(msg.room_id) === String(chat.roomId);
        console.log("Filtering message:", {
          message: msg.message,
          msgRoomId: msg.room_id,
          selectedRoomId: chat.roomId,
          msgRoomIdType: typeof msg.room_id,
          selectedRoomIdType: typeof chat.roomId,
          messageId: msg.message_id,
          matches,
        });
        return matches;
      })
    : [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleBackdropClick}
        >
          <div className="bg-white w-[90%] max-w-[690px] p-5 rounded-lg shadow-lg h-[60vh] flex flex-col">
            {!selectedChat ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Messages</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
                <label htmlFor="search" className="sr-only">
                  Search by name
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 border rounded-md mb-4"
                />
                <h3 className="text-blue-600 text-lg font-semibold mb-2">Vendors</h3>
                {connectionError && (
                  <p className="text-red-500 text-center mb-2">{connectionError}</p>
                )}
                {isLoadingCustomer || customerLoading ? (
                  <p className="text-gray-500 text-center">Loading user data...</p>
                ) : customerError ? (
                  <p className="text-red-500 text-center">Error: {customerError}</p>
                ) : null}
                {vendorsForChatLoading && (
                  <p className="text-gray-500 text-center">Loading vendors...</p>
                )}
                {vendorsForChatError && (
                  <p className="text-red-500 text-center">
                    Error loading vendors: {vendorsForChatError}. Please try again.
                  </p>
                )}
                {!vendorsForChatLoading && !vendorsForChatError && filteredVendors.length === 0 && (
                  <p className="text-gray-500 text-center">No vendors found</p>
                )}
                <div className="overflow-y-auto max-h-[300px]">
                  {filteredVendors.length > 0 ? (
                    filteredVendors.map((vendor) => (
                      <div
                        key={vendor.vendor_id}
                        onClick={() => handleSelectVendor(vendor)}
                        className={`flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-100 ${
                          !user?.customer_id || vendorsForChatError ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={vendor.avatar || hold}
                            alt={`${vendor.vendor_name}'s avatar`}
                            className="w-10 h-10 rounded-full"
                            onError={handleImageError}
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{vendor.vendor_name}</p>
                            <p className="text-sm text-gray-500">{vendor.service_category || "Vendor"}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{vendor.last_message_time || "No messages"}</span>
                      </div>
                    ))
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBack}
                      className="text-gray-500 hover:text-gray-700 mr-2"
                      aria-label="Back to vendors"
                    >
                      <FaArrowLeft />
                    </button>
                    <img
                      src={selectedChat.avatar || hold}
                      alt={`${selectedChat.name}'s avatar`}
                      className="w-10 h-10 rounded-full"
                      onError={handleImageError}
                    />
                    <div>
                      <h2 className="text-lg font-semibold">{selectedChat.name}</h2>
                      <p className="text-sm text-gray-500">{selectedChat.role}</p>
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
                {connectionError && (
                  <p className="text-red-500 text-center mb-2">{connectionError}</p>
                )}
                {chat.chatHistoryError && (
                  <p className="text-red-500 text-center mb-2">{chat.chatHistoryError}</p>
                )}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E5DDD5]"
                  ref={chatContainerRef}
                >
                  {chat.chatHistoryLoading && !loadingTimeout && (
                    <p className="text-gray-500 text-center">Loading chat history...</p>
                  )}
                  {(loadingTimeout || (!chat.chatHistoryLoading && filteredMessages.length === 0)) && (
                    <p className="text-gray-500 text-center">
                      {loadingTimeout ? "Loading timed out, please try again" : "No messages yet"}
                    </p>
                  )}
                  {!chat.chatHistoryLoading && filteredMessages.length > 0 && (
                    filteredMessages.map((msg, index) => (
                      <div
                        key={msg.message_id || `msg-${msg.sent_at}-${index}`}
                        className={`flex mb-2 ${
                          msg.sender_type === "customer" ? "justify-end" : "justify-start"
                        }`}
                        ref={index === filteredMessages.length - 1 ? latestMessageRef : null}
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
                            {(() => {
                              const utcDate = new Date(msg.sent_at);
                              const istOffset = 5.5 * 60 * 60 * 1000;
                              const istDate = new Date(utcDate.getTime() + istOffset);
                              return istDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                            })()}
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
            )}
          </div>
        </div>
      )}
    </>
  );
}