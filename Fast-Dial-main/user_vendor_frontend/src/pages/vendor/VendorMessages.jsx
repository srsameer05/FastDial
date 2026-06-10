 import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../../components/VendorSidebar";
import Navbar from "../../components/VendorNavbar";
import io from "socket.io-client";
import contactImage from "../../assets/Workman.png";
import {
  fetchAdminsRequest,
  fetchCustomersRequest,
  fetchVendorProfileRequest,
  getChatRoomRequest,
  getCustomerChatRoomRequest,
  selectAdmin,
  selectCustomer,
  receiveMessage,
  receiveCustomerMessage,
  fetchChatHistoryRequest,
  fetchCustomerChatHistoryRequest,
} from "../../saga/features/vendor/vendorSlice";
import AdminAvatar from "./AdminAvatar";
import CustomerAvatar from "./CustomerAvatar";

const Messages = () => {
  const dispatch = useDispatch();
  const {
    vendor,
    chat,
    customerChat,
    admins,
    adminsLoading,
    adminsError,
    customers,
    customersLoading,
    customersError,
    isAuthenticated,
    profileLoading,
    profileError,
  } = useSelector((state) => state.vendor);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionError, setConnectionError] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [activeTab, setActiveTab] = useState("admin");
  const [isSwitching, setIsSwitching] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const adminSocketRef = useRef(null);
  const customerSocketRef = useRef(null);
  const [rooms, setRooms] = useState({ admin: {}, customer: {} });
  const switchTimeoutRef = useRef(null);

  const vendorId = vendor?.id || localStorage.getItem("vendorId");

  const parseSentAt = (sentAt) => {
    if (!sentAt) {
      console.warn("parseSentAt: sent_at is null or undefined, using current time");
      return new Date();
    }
    const date = new Date(sentAt);
    if (isNaN(date.getTime())) {
      console.warn("parseSentAt: Invalid sent_at format:", sentAt, "using current time");
      return new Date();
    }
    return date;
  };

 
  const chatRef = useRef(chat);
  const customerChatRef = useRef(customerChat);

  useEffect(() => {
    chatRef.current = chat;
    customerChatRef.current = customerChat;
  }, [chat, customerChat]);

  const initializeSocket = (type) => {
    const socketUrl = "http://localhost:3000";
    const socketRef = type === "admin" ? adminSocketRef : customerSocketRef;

    if (socketRef.current) {
      console.log(`Disconnecting previous ${type} socket`);
      socketRef.current.off("connect");
      socketRef.current.off("joinedRoom");
      socketRef.current.off("connect_error");
      socketRef.current.off("receiveMessage");
      socketRef.current.off("error");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    socketRef.current = io(socketUrl, {
      query: { token: localStorage.getItem("vendorToken") },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: "/socket.io",
    });

    socketRef.current.on("connect", () => {
      console.log(`${type} socket connected successfully`);
      setConnectionError((prev) => prev ? prev.replace(`${type} socket: Unable to connect`, "") : null);
    
      const currentChat = type === "admin" ? chatRef.current : customerChatRef.current;
      const roomId = currentChat.roomId;
      const recipientId = type === "admin" ? currentChat.adminId : currentChat.customerId;
      
      if (roomId && recipientId) {
        console.log(`Joining ${type} room_${roomId} via ${type} socket`);
        socketRef.current.emit("joinRoom", {
          chat_room_id: parseInt(roomId),
          vendor_id: parseInt(vendorId),
          [`${type}_id`]: parseInt(recipientId),
        });
      }
    });

    socketRef.current.on("joinedRoom", ({ chat_room_id }) => {
      console.log(`${type} socket: Successfully joined room_${chat_room_id}`);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error(`${type} socket connection failed:`, error.message);
      setConnectionError((prev) => `${prev || ""} ${type} socket: Unable to connect to chat server.`);
    });

    socketRef.current.on("receiveMessage", (data) => {
      console.log(`${type} socket: Received message:`, data);
      if (!data || !data.chat_room_id || !data.sender_id || !data.sender_type || !data.message || !data.sent_at) {
        console.error(`${type} socket: Invalid message data received:`, data);
        return;
      }
      
      const currentChat = type === "admin" ? chatRef.current : customerChatRef.current;
      const currentRoomId = currentChat.roomId;

      if (String(data.chat_room_id) === String(currentRoomId)) {
        dispatch(
          type === "admin"
            ? receiveMessage({
                chat_room_id: data.chat_room_id,
                sender_id: data.sender_id,
                sender_type: data.sender_type,
                message: data.message,
                sent_at: data.sent_at,
                message_id: data.message_id || `temp-${Date.now()}`,
              })
            : receiveCustomerMessage({
                chat_room_id: data.chat_room_id,
                sender_id: data.sender_id,
                sender_type: data.sender_type,
                message: data.message,
                sent_at: data.sent_at,
                message_id: data.message_id || `temp-${Date.now()}`,
              })
        );
      }
    });

    socketRef.current.on("error", ({ message }) => {
      console.error(`${type} socket error:`, message);
      setConnectionError((prev) => `${prev || ""} ${type} socket: ${message}`);
    });
  };

  useEffect(() => {
    if (!vendor && isAuthenticated) {
      const storedVendorId = localStorage.getItem("vendorId");
      if (storedVendorId) {
        console.log("Fetching vendor profile for ID:", storedVendorId);
        dispatch(fetchVendorProfileRequest(storedVendorId));
      } else {
        console.log("No stored vendorId, redirecting to login");
        setChatError("Please log in to access chat");
      }
    }
  }, [dispatch, vendor, isAuthenticated]);

  useEffect(() => {
    if (vendorId && isAuthenticated) {
      console.log("Fetching admins and customers for vendor:", vendorId);
      dispatch(fetchAdminsRequest());
      dispatch(fetchCustomersRequest());
    }
  }, [dispatch, vendorId, isAuthenticated]);

  useEffect(() => {
    if (!vendorId || !isAuthenticated) {
      console.log("No vendorId or not authenticated, skipping socket initialization");
      return;
    }

    initializeSocket("admin");
    initializeSocket("customer");

    return () => {
      if (adminSocketRef.current) {
        console.log("Disconnecting admin socket on cleanup");
        adminSocketRef.current.off("connect");
        adminSocketRef.current.off("joinedRoom");
        adminSocketRef.current.off("connect_error");
        adminSocketRef.current.off("receiveMessage");
        adminSocketRef.current.off("error");
        adminSocketRef.current.disconnect();
        adminSocketRef.current = null;
      }
      if (customerSocketRef.current) {
        console.log("Disconnecting customer socket on cleanup");
        customerSocketRef.current.off("connect");
        customerSocketRef.current.off("joinedRoom");
        customerSocketRef.current.off("connect_error");
        customerSocketRef.current.off("receiveMessage");
        customerSocketRef.current.off("error");
        customerSocketRef.current.disconnect();
        customerSocketRef.current = null;
      }
    };
  }, [vendorId, isAuthenticated]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat.messages, customerChat.messages]);

  useEffect(() => {
    if (chat.roomId && chat.adminId) {
      setRooms((prev) => ({
        ...prev,
        admin: { ...prev.admin, [chat.adminId]: chat.roomId },
      }));
      console.log("Fetching admin chat history for room:", chat.roomId);
      dispatch(fetchChatHistoryRequest({ roomId: chat.roomId }));
      if (adminSocketRef.current && adminSocketRef.current.connected) {
        console.log(`Joining admin room_${chat.roomId} via admin socket`);
        adminSocketRef.current.emit("joinRoom", {
          chat_room_id: parseInt(chat.roomId),
          vendor_id: parseInt(vendorId),
          admin_id: parseInt(chat.adminId),
        });
      }
    }
  }, [dispatch, chat.roomId, chat.adminId, vendorId]);

  useEffect(() => {
    if (customerChat.roomId && customerChat.customerId) {
      setRooms((prev) => ({
        ...prev,
        customer: { ...prev.customer, [customerChat.customerId]: customerChat.roomId },
      }));
      console.log("Fetching customer chat history for room:", customerChat.roomId);
      dispatch(fetchCustomerChatHistoryRequest({ roomId: customerChat.roomId }));
      if (customerSocketRef.current && customerSocketRef.current.connected) {
        console.log(`Joining customer room_${customerChat.roomId} via customer socket`);
        customerSocketRef.current.emit("joinRoom", {
          chat_room_id: parseInt(customerChat.roomId),
          vendor_id: parseInt(vendorId),
          customer_id: parseInt(customerChat.customerId),
        });
      }
    }
  }, [dispatch, customerChat.roomId, customerChat.customerId, vendorId]);

  const debounce = (func, delay) => {
    return (...args) => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
      switchTimeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  useEffect(() => {
    console.log("Admins fetched:", admins);
    console.log("Customers fetched:", customers);
  }, [admins, customers])

  const handleSelectAdmin = debounce((adminId) => {
    if (!vendorId) {
      console.log("No vendorId, cannot select admin");
      setChatError("Please log in to select a chat.");
      return;
    }
    if (chat.adminId === adminId) {
      console.log("Admin already selected:", adminId);
      return;
    }
    console.log("Selecting admin:", adminId);
    setIsSwitching(true);
    setChatError(null);
    setMobileChatOpen(true);

    // Leave previous room
    if (chat.roomId && adminSocketRef.current && adminSocketRef.current.connected) {
      console.log(`Leaving previous admin room_${chat.roomId} via admin socket`);
      adminSocketRef.current.emit("leaveRoom", { chat_room_id: parseInt(chat.roomId) });
    }

    // Reinitialize admin socket logic removed to prevent connection checking issues
    // initializeSocket("admin");

    dispatch(selectAdmin(adminId));
    dispatch(getChatRoomRequest({ vendorId, adminId }));
    setActiveTab("admin");
  }, 500);

  const handleSelectCustomer = debounce((customerId) => {
    if (!vendorId) {
      console.log("No vendorId, cannot select customer");
      setChatError("Please log in to select a chat.");
      return;
    }
    console.log("Selecting customer:", customerId);
    setIsSwitching(true);
    setChatError(null);
    setMobileChatOpen(true);

    // Leave previous room
    if (customerChat.roomId && customerSocketRef.current && customerSocketRef.current.connected) {
      console.log(`Leaving previous customer room_${customerChat.roomId} via customer socket`);
      customerSocketRef.current.emit("leaveRoom", { chat_room_id: parseInt(customerChat.roomId) });
    }

    // Reinitialize customer socket logic removed to prevent connection checking issues
    // initializeSocket("customer");

    dispatch(selectCustomer(customerId));
    dispatch(getCustomerChatRoomRequest({ vendor_id: vendorId, customer_id: customerId }));
    setActiveTab("customer");
  }, 500);

  const handleSendMessage = () => {
    if (activeTab === "admin" && !chat.roomId) {
      setChatError("Admin chat room not loaded. Please select an admin.");
      return;
    }
    if (activeTab === "customer" && !customerChat.roomId) {
      setChatError("Customer chat room not loaded. Please select a customer.");
      return;
    }
    if (messageText.trim() && vendorId) {
      console.log("Sending message:", messageText, "to room:", activeTab === "admin" ? chat.roomId : customerChat.roomId);
      const socket = activeTab === "admin" ? adminSocketRef.current : customerSocketRef.current;
      if (socket && socket.connected) {
        const sentAt = new Date().toISOString();
        const tempMessageId = `temp-${vendorId}-${Date.now()}`;
        const payload = activeTab === "admin" ? {
          chat_room_id: parseInt(chat.roomId),
          vendor_id: parseInt(vendorId),
          admin_id: parseInt(chat.adminId),
          sender_type: "vendor",
          sender_id: parseInt(vendorId),
          message: messageText,
          sent_at: sentAt,
          message_id: tempMessageId,
        } : {
          chat_room_id: parseInt(customerChat.roomId),
          vendor_id: parseInt(vendorId),
          customer_id: parseInt(customerChat.customerId),
          sender_type: "vendor",
          sender_id: parseInt(vendorId),
          message: messageText,
          sent_at: sentAt,
          message_id: tempMessageId,
        };
        console.log(`Sending message payload via ${activeTab} socket:`, payload);
        setSentMessages((prev) => [
          ...prev,
          {
            chat_room_id: payload.chat_room_id,
            sender_id: payload.sender_id,
            sender_type: payload.sender_type,
            message: payload.message,
            sent_at: payload.sent_at,
            message_id: payload.message_id,
          },
        ]);
        socket.emit("sendMessage", payload);
        if (activeTab === "admin") {
          dispatch(
            receiveMessage({
              chat_room_id: payload.chat_room_id,
              sender_id: payload.sender_id,
              sender_type: payload.sender_type,
              message: payload.message,
              sent_at: payload.sent_at,
              message_id: payload.message_id,
            })
          );
        } else {
          dispatch(
            receiveCustomerMessage({
              chat_room_id: payload.chat_room_id,
              sender_id: payload.sender_id,
              sender_type: payload.sender_type,
              message: payload.message,
              sent_at: payload.sent_at,
              message_id: payload.message_id,
            })
          );
        }
        setMessageText("");
      } else {
        console.log(`${activeTab} socket not connected`);
        setConnectionError(`Cannot send message: ${activeTab} chat server unavailable.`);
      }
    } else {
      console.log("Cannot send message: missing input or vendorId");
      setChatError("Please enter a message.");
    }
  };

  const adminList = admins.map((admin) => {
    const roomId = rooms.admin[admin.admin_id];
    const adminMessages = roomId
      ? chat.messages.filter((msg) => String(msg.chat_room_id || msg.room_id) === String(roomId))
      : [];
    const lastMessage = adminMessages.length > 0 ? adminMessages[adminMessages.length - 1] : null;
    return {
      ...admin,
      lastMessage: lastMessage ? lastMessage.message : "No messages yet",
      time: lastMessage ? new Date(lastMessage.sent_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }) : "",
    };
  });

  const customerList = customers.map((customer) => {
    const roomId = rooms.customer[customer.customer_id];
    const customerMessages = roomId
      ? customerChat.messages.filter((msg) => String(msg.chat_room_id || msg.room_id) === String(roomId))
      : [];
    const lastMessage = customerMessages.length > 0 ? customerMessages[customerMessages.length - 1] : null;
    return {
      ...customer,
      lastMessage: lastMessage ? lastMessage.message : "No messages yet",
      time: lastMessage ? new Date(lastMessage.sent_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }) : "",
    };
  });

  const filteredAdmins = adminList.filter((admin) =>
    admin.admin_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customerList.filter((customer) =>
    customer.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const messages = useMemo(() => {
    const roomId = activeTab === "admin" ? chat.roomId : customerChat.roomId;
    const messageArray = activeTab === "admin" ? chat.messages : customerChat.messages;
    let result = Array.isArray(messageArray)
      ? roomId
        ? messageArray.filter((msg) => String(msg.chat_room_id || msg.room_id) === String(roomId))
        : messageArray
      : [];

    if (activeTab === "customer") {
      const filteredMessages = [];
      const processedMessages = new Set();

      result.forEach((msg) => {
        if (msg.sender_type === "vendor" && !processedMessages.has(msg.message)) {
          const localMessage = sentMessages.find(
            (local) =>
              local.chat_room_id === msg.chat_room_id &&
              local.sender_id === msg.sender_id &&
              local.sender_type === msg.sender_type &&
              local.message === msg.message &&
              Math.abs(new Date(local.sent_at).getTime() - new Date(msg.sent_at).getTime()) < 6 * 60 * 60 * 1000
          );

          if (localMessage) {
            filteredMessages.push({
              ...msg,
              sent_at: localMessage.sent_at,
              message_id: localMessage.message_id,
              isLocal: true,
            });
            processedMessages.add(msg.message);
          } else {
            filteredMessages.push({ ...msg, isLocal: false });
            processedMessages.add(msg.message);
          }
        } else {
          filteredMessages.push({ ...msg, isLocal: false });
        }
      });

      result = filteredMessages;
    }

    console.log(`Filtered messages (activeTab: ${activeTab}, roomId: ${roomId}):`, result);
    return result;
  }, [activeTab, chat.roomId, chat.messages, customerChat.roomId, customerChat.messages, sentMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      console.log("Messages with timestamps:", messages.map((msg, index) => ({
        index,
        message: msg?.message || "undefined",
        sent_at: msg?.sent_at || "undefined",
        parsed: msg?.sent_at ? parseSentAt(msg.sent_at).toString() : "invalid",
        localTime: msg?.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }) : "invalid",
        room_id: msg?.chat_room_id || msg?.room_id,
        sender_type: msg?.sender_type || "unknown",
        message_id: msg?.message_id || "undefined",
        isLocal: msg?.isLocal || false,
        source: msg?.isLocal ? "local" : "server",
      })));
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (!chat.chatHistoryLoading && !customerChat.chatHistoryLoading) {
      setIsSwitching(false);
    }
  }, [chat.chatHistoryLoading, customerChat.chatHistoryLoading]);

  return (
    <>
      <Navbar />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col md:flex-row mx-4 md:mx-[40px] my-4 md:my-[40px] gap-2 slide-up">
          <div className={`w-full md:w-1/3 bg-white rounded-lg shadow-md p-4 flex flex-col ${mobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 px-4 rounded-t-lg ${
                  activeTab === "admin" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab("admin")}
              >
                Admins
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-t-lg ${
                  activeTab === "customer" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab("customer")}
              >
                Customers
              </button>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 mb-4 border rounded-lg"
            />
            <div className="flex-1 overflow-y-auto">
              {activeTab === "admin" ? (
                adminsLoading ? (
                  <p>Loading admins...</p>
                ) : adminsError ? (
                  <p className="text-red-500">{adminsError}</p>
                ) : filteredAdmins.length === 0 ? (
                  <p>No admins found</p>
                ) : (
                  filteredAdmins.map((admin) => (
                    <div
                      key={admin.admin_id}
                      onClick={() => handleSelectAdmin(admin.admin_id)}
                      className={`flex items-center p-2 mb-2 rounded-lg cursor-pointer ${
                        chat.adminId === admin.admin_id ? "bg-blue-100" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center bg-gray-200">
                        <AdminAvatar admin={admin} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{admin.admin_name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {admin.lastMessage}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">{admin.time}</p>
                    </div>
                  ))
                )
              ) : customersLoading ? (
                <p>Loading customers...</p>
              ) : customersError ? (
                <p className="text-red-500">{customersError}</p>
              ) : filteredCustomers.length === 0 ? (
                <p>No customers found</p>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.customer_id}
                    onClick={() => handleSelectCustomer(customer.customer_id)}
                    className={`flex items-center p-2 mb-2 rounded-lg cursor-pointer ${
                      customerChat.customerId === customer.customer_id ? "bg-blue-100" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center bg-gray-200">
                      <CustomerAvatar customer={customer} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{customer.customer_name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {customer.lastMessage}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">{customer.time}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className={`w-full md:flex-1 bg-white rounded-lg shadow-md flex flex-col ${mobileChatOpen ? 'flex' : 'hidden md:flex'}`}>
            {connectionError && (
              <div className="p-4 bg-red-100 text-red-700">{connectionError}</div>
            )}
            {chatError && (
              <div className="p-4 bg-red-100 text-red-700">{chatError}</div>
            )}
            {chat.chatHistoryError && (
              <div className="p-4 bg-red-100 text-red-700">{chat.chatHistoryError}</div>
            )}
            {customerChat.chatHistoryError && (
              <div className="p-4 bg-red-100 text-red-700">{customerChat.chatHistoryError}</div>
            )}
            {(activeTab === "admin" && chat.adminId && chat.roomId) || (activeTab === "customer" && customerChat.customerId && customerChat.roomId) ? (
              <>
                <div className="p-4 border-b flex items-center">
                  <button 
                    onClick={() => setMobileChatOpen(false)} 
                    className="md:hidden mr-4 text-blue-500 font-bold"
                  >
                    ←
                  </button>
                  <p className="font-semibold">
                    {activeTab === "admin"
                      ? admins.find((a) => a.admin_id === chat.adminId)?.admin_name || "Admin"
                      : customers.find((c) => c.customer_id === customerChat.customerId)?.customer_name || "Customer"}
                  </p>
                </div>
                <div
                  ref={chatContainerRef}
                  className="flex-1 p-4 overflow-y-auto"
                >
                  {isSwitching && (
                    <p>Loading chat history...</p>
                  )}
                  {!isSwitching && activeTab === "admin" && chat.chatHistoryLoading && (
                    <p>Loading admin chat history...</p>
                  )}
                  {!isSwitching && activeTab === "customer" && customerChat.chatHistoryLoading && (
                    <p>Loading customer chat history...</p>
                  )}
                  {!isSwitching && messages.length === 0 && !chat.chatHistoryLoading && !customerChat.chatHistoryLoading && (
                    <p>No messages yet</p>
                  )}
                  {!isSwitching && messages.length > 0 && (
                    messages.map((msg, index) => {
                      if (!msg || !msg.message || !msg.sender_type || !msg.sent_at) {
                        console.warn("Invalid message object at index:", index, msg);
                        return null;
                      }
                      return (
                        <div
                          key={msg.message_id || `msg-${index}`}
                          className={`mb-4 flex ${
                            msg.sender_type === "vendor" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              msg.sender_type === "vendor"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {new Date(msg.sent_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t">
                  <div className="flex">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 p-2 border rounded-l-lg"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-500 text-white rounded-r-lg"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">
                  {chatError || customerChat.chatHistoryError
                    ? "Error loading chat"
                    : `Select ${activeTab === "admin" ? "an admin" : "a customer"} to start chatting`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;