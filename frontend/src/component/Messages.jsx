/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect, useRef } from "react"
import { X, Search, Send, MessageCircle } from "lucide-react"
import api from "../utils/api"
import { useSocket } from '../SocketContext'

export default function Messages({ onClose, reloadConversations, conversations }) {
  const [selectedConv, setSelectedConversation] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null) // <-- for new chat
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userId, setUserId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const messagesEndRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const socket = useSocket()
  // Add refs for latest selectedConv and selectedUser
  const selectedConvRef = useRef(selectedConv);
  const selectedUserRef = useRef(selectedUser);
  const messagesContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const prevMessagesLength = useRef(messages.length);
  const [hasMore, setHasMore] = useState(true); // If there are more messages to load
  const [loadingMore, setLoadingMore] = useState(false);
  const [oldestMessageId, setOldestMessageId] = useState(null); // Track the oldest message loaded

  // Defensive fallback for conversations
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  // Defensive fallback for messages
  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    loadUserData()
    loadConversations()
  }, [])

  useEffect(() => {
    selectedConvRef.current = selectedConv;
    selectedUserRef.current = selectedUser;
  }, [selectedConv, selectedUser]);

  useEffect(() => {
    if (!socket) return;
    // Remove previous listeners to avoid duplicates
    socket.off("newMessage");
    socket.off("typing");
    socket.off("status");

    socket.on("newMessage", (message) => {
      if (
        selectedConvRef.current &&
        (message.conversation === selectedConvRef.current._id || message.conversation?._id === selectedConvRef.current._id)
      ) {
        setMessages((prev) => [...prev, message]);
      } else {
        // Show notification for new message if not in this conversation
        if (window.Notification && Notification.permission === "granted") {
          new Notification("New message", { body: message.content });
        }
      }
      reloadConversations();
    });
    socket.on("typing", (data) => {
      const conv = selectedConvRef.current;
      const user = selectedUserRef.current;
      let convId = conv?._id;
      let otherId = conv ? conv.otherParticipant?._id : user?._id;
      if (
        data &&
        data.conversationId === convId &&
        data.userId === otherId
      ) {
        setIsTyping(true);
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => setIsTyping(false), 1000);
        setTypingTimeout(timeout);
      }
    });
    socket.on("status", (data) => {
      // Also update selectedConv/selectedUser if open
      if (selectedConvRef.current && selectedConvRef.current.otherParticipant && selectedConvRef.current.otherParticipant._id === data.userId) {
        setSelectedConversation({
          ...selectedConvRef.current,
          otherParticipant: {
            ...selectedConvRef.current.otherParticipant,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen || selectedConvRef.current.otherParticipant.lastSeen,
          }
        });
      }
      if (selectedUserRef.current && selectedUserRef.current._id === data.userId) {
        setSelectedUser({
          ...selectedUserRef.current,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen || selectedUserRef.current.lastSeen,
        });
      }
      reloadConversations();
    });
  }, [socket, typingTimeout]);

  useEffect(() => {
    if (selectedConv) {
      const otherParticipant = getOtherParticipant(selectedConv.participants, userId)
      loadMessages(otherParticipant?._id)
      setSelectedUser(null)
    } else if (selectedUser) {
      loadMessages(selectedUser._id)
    }
  }, [selectedConv, selectedUser])

  // Remove setTimeout and just scroll directly
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Use a single useEffect for scrolling
  useEffect(() => {
    if (
      autoScroll &&
      messagesEndRef.current &&
      messages.length > prevMessagesLength.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages, autoScroll]);

  const loadUserData = () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserId(payload.userId)
        setCurrentUser({
          id: payload.userId,
          name: payload.name,
          username: payload.username,
          email: payload.email,
        })
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }
  }

  const loadConversations = async () => {
    try {
      const response = await api.get("/api/messages/conversations")
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }

const loadMessages = async (id, beforeId = null, append = false) => {
  try {
    const token = localStorage.getItem("token");
    let url;

    if (selectedConv && selectedConv.otherParticipant?._id) {
      url = `/api/messages/user/${selectedConv.otherParticipant._id}`;
    } else if (selectedUser && selectedUser._id) {
      url = `/api/messages/user/${selectedUser._id}`;
    } else if (id) {
      url = `/api/messages/user/${id}`;
    } else {
      setMessages([]);
      return;
    }

    if (beforeId) {
      url += `?before=${beforeId}`;
    }

    const response = await api.get(url);

    const newMessages = response.data || [];
    if (append) {
      setMessages((prev) => [...newMessages, ...prev]);
    } else {
      setMessages(newMessages);
    }

    setHasMore(newMessages.length > 0);
    if (newMessages.length > 0) {
      setOldestMessageId(newMessages[0]._id);
    }
    reloadConversations();
  } catch (error) {
    console.error("Error loading messages:", error);
    setMessages([]);
    setHasMore(false);
  }
};


  const sendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      const token = localStorage.getItem("token")
      let payload
      if (selectedConv) {
        payload = { conversationId: selectedConv._id, content: newMessage }
      } else if (selectedUser) {
        payload = { receiverId: selectedUser._id, content: newMessage }
      } else {
        alert("Please select a user to chat with.")
        return
      }
      const response = await api.post("/api/messages", payload)
      setMessages([...messages, response.data])
      setNewMessage("")
      // Emit via Socket.IO for live update
      if (socket) {
        socket.emit("sendMessage", response.data)
      }
      reloadConversations()
      if (!selectedConv && selectedUser) {
        await loadConversations()
        const token = localStorage.getItem("token")
        const updatedConvs = await api.get("/api/messages/conversations")
        const newConv = updatedConvs.data.find(conv =>
          conv.otherParticipant && conv.otherParticipant._id === selectedUser._id
        )
        if (newConv) {
          setSelectedConversation(newConv)
          setSelectedUser(null)
        }
      }
      reloadConversations()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const getOtherParticipant = (participants, userId) => {
    if (!participants || !Array.isArray(participants)) return null
    return participants.find((p) => String(p._id || p.id || p) !== String(userId)) || null
  }

  // Display name logic: prefer username if name is generic or missing
  const getDisplayName = (user) => {
    if (!user || typeof user !== "object" || Object.keys(user).length === 0) return "Unknown User";
    const name = user.name?.trim();
    const username = user.username?.trim();
    const email = user.email;
    if (name && name !== "user" && !name.includes("@")) return name;
    if (username) return `@${username}`;
    if (email) return email.split("@")[0];
    return "Unknown User";
  };

  // Helper to ensure a conversation exists and return its _id
  const ensureConversationId = async (otherUserId) => {
    // If selectedConv exists, return its _id
    if (selectedConv && selectedConv._id) return selectedConv._id;
    // If selectedUser exists, try to find or create a conversation
    if (selectedUser && selectedUser._id) {
      // Try to find conversation in conversations list
      const existing = conversations.find(
        conv => conv.otherParticipant && conv.otherParticipant._id === selectedUser._id
      );
      if (existing) return existing._id;
      // Otherwise, create a new conversation by sending a dummy typing event to backend
      // (or you could send a special API call to create the conversation)
      try {
        const token = localStorage.getItem("token");
        // Create conversation by sending a blank message (not ideal, but works for now)
        const response = await api.post("/api/messages", { receiverId: selectedUser._id, content: "" });
        // Reload conversations
        await loadConversations();
        // Find the new conversation
        const updated = conversations.find(
          conv => conv.otherParticipant && conv.otherParticipant._id === selectedUser._id
        );
        if (updated) return updated._id;
      } catch (err) {
        // Ignore errors
      }
    }
    return null;
  };

  const handleTyping = async (e) => {
    setNewMessage(e.target.value);
    let convId = selectedConv?._id;
    // If no conversation, try to create/find it
    if (!convId && (selectedUser && selectedUser._id)) {
      convId = await ensureConversationId(selectedUser._id);
    }
    if (socket && convId) {
      socket.emit("typing", {
        conversationId: convId,
        userId: userId,
      });
    }
    // ... local typing state for input (not for indicator)
  };

  const filteredConversations = conversations.filter((conv) => {
    const displayName = getDisplayName(conv.otherParticipant)
    return displayName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Example: handle selecting a user from a search or connections list
  // Call this when you click a user to start a new chat
  const handleStartChat = (user) => {
    setSelectedUser(user)
    setSelectedConversation(null)
    setMessages([])
  }

  // When conversations are updated, update selectedConv to the latest object
  useEffect(() => {
    if (selectedConv && conversations.length > 0) {
      const updated = conversations.find(conv => conv._id === selectedConv._id);
      if (updated) setSelectedConversation(updated);
    }
  }, [conversations]);

  // When selecting a conversation, always use the latest object from conversations
  const handleSelectConversation = (conv) => {
    const updated = conversations.find(c => c._id === conv._id) || conv;
    setSelectedConversation(updated);
    setSelectedUser(null);
    setMessages([]);
    setIsTyping(false);
  };

  // Track scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      if (container.scrollTop === 0 && hasMore && !loadingMore && oldestMessageId) {
        setLoadingMore(true);
        const prevHeight = container.scrollHeight;
        await loadMessages(null, oldestMessageId, true);
        setLoadingMore(false);
        setTimeout(() => {
          container.scrollTop = container.scrollHeight - prevHeight;
        }, 0);
      }
      // ...existing autoScroll logic
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setAutoScroll(nearBottom);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, oldestMessageId, messages]);

  useEffect(() => {
    setOldestMessageId(null);
    setHasMore(true);
    setLoadingMore(false);
    // ...existing logic
  }, [selectedConv, selectedUser]);

  if (typeof onClose !== 'function') {
    return <div className="p-4 text-red-500">Chat cannot render: parent did not provide onClose prop. Make sure setRightPanel('messages') is called to open the chat.</div>;
  }

  if (loading) {
    return (
      <div className="w-96 h-full bg-slate-900/30 backdrop-blur-2xl border-l border-slate-800/20 flex items-center justify-center">
        <div className="text-slate-400">Loading conversations...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-slate-900/30 backdrop-blur-2xl border-l border-slate-800/20">
      {/* Header and Search: only show when no conversation/user is selected */}
      {(!selectedConv && !selectedUser) ? (
        <>
          <div className="p-6 border-b border-slate-800/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Messages</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/30 border border-slate-700/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>
          </div>
        </>
      ) : (
        // Chat header only when a conversation/user is selected
        <div className="p-4 border-b border-slate-800/20 flex items-center space-x-3 flex-shrink-0">
          <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {(() => {
                let displayName = ""
                if (selectedConv) {
                  displayName = getDisplayName(selectedConv.otherParticipant)
                } else if (selectedUser) {
                  displayName = getDisplayName(selectedUser)
                }
                return displayName.charAt(0).toUpperCase()
              })()}
            </span>
            {/* Status Dot: green if online, gray if offline */}
            {(() => {
              let isOnline = false
              if (selectedConv && selectedConv.otherParticipant) {
                isOnline = selectedConv.otherParticipant.isOnline
              } else if (selectedUser) {
                isOnline = selectedUser?.isOnline
              }
              return isOnline ? (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
              ) : (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-500 border-2 border-slate-800 rounded-full"></div>
              )
            })()}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-white text-sm">
              {(() => {
                if (selectedConv) {
                  return getDisplayName(selectedConv.otherParticipant)
                } else if (selectedUser) {
                  return getDisplayName(selectedUser)
                }
                return ""
              })()}
            </h4>
            {(() => {
              // Unified status logic for dot and text
              let isOnline = false;
              let lastSeen = null;
              if (selectedConv && selectedConv.otherParticipant) {
                isOnline = selectedConv.otherParticipant.isOnline;
                lastSeen = selectedConv.otherParticipant.lastSeen;
              } else if (selectedUser) {
                isOnline = selectedUser?.isOnline;
                lastSeen = selectedUser?.lastSeen;
              }
              return (
                <p className="text-slate-400 text-xs">
                  {isTyping ? (
                    <span className="text-green-400">Typing...</span>
                  ) : isOnline ? (
                    <span className="text-green-400">Online</span>
                  ) : lastSeen ? (
                    `Last seen ${new Date(lastSeen).toLocaleDateString()}`
                  ) : (
                    <span className="text-gray-400">Offline</span>
                  )}
                </p>
              );
            })()}
          </div>
          <button
            onClick={async () => {
              setSelectedConversation(null)
              setSelectedUser(null)
              setMessages([])
              setIsTyping(false)
              await reloadConversations();
            }}
            className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex items-center justify-center"
            title="Back to conversations"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0 h-0">
        {(!selectedConv && !selectedUser) ? (
          <div
            className="flex-1 overflow-y-auto hide-scrollbar"
            style={{
              height: '100%',
              minHeight: 0,
              maxHeight: '100%',
            }}
          >
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                  <MessageCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No conversations yet</h3>
                <p className="text-slate-400 text-sm mb-4">Connect with others to start messaging</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 text-sm"
                >
                  Find Connections
                </button>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const displayName = getDisplayName(conversation.otherParticipant)
                return (
                  <button
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full p-4 flex items-center space-x-3 hover:bg-slate-800/20 transition-all duration-300 border-b border-slate-800/10 ${
                      selectedConv?._id === conversation._id ? "bg-slate-800/30" : ""
                    }`}
                  >
                    <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">{displayName.charAt(0).toUpperCase()}</span>
                      {conversation.otherParticipant?.isOnline ? (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-500 border-2 border-slate-800 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white text-sm">{displayName}</h4>
                        <span className="text-xs text-slate-400">
                          {conversation.lastMessage?.createdAt
                            ? new Date(conversation.lastMessage.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs truncate">
                        {conversation.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{conversation.unreadCount}</span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        ) : (
          // Chat area (messages + input)
          <div className="flex-1 flex flex-col min-h-0 h-0">
            {/* Messages list (restored original CSS/flex layout) */}
            <div
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar"
              ref={messagesContainerRef}
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
              }}
            >
              {loadingMore && (
                <div className="flex justify-center py-2">
                  <span className="text-xs text-slate-400">Loading more...</span>
                </div>
              )}
              {safeMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400 text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                safeMessages.map((message) => {
                  const isMyMessage =
                    String(message.sender?._id) === String(userId) || String(message.sender) === String(userId)
                  const senderName = isMyMessage
                    ? currentUser?.name || currentUser?.username || "You"
                    : getDisplayName(message.sender)

                  return (
                    <div key={message._id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                          isMyMessage
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm"
                            : "bg-slate-700/40 text-slate-200 rounded-bl-sm"
                        }`}
                      >
                        {!isMyMessage && <p className="text-xs font-medium mb-1 opacity-70">{senderName}</p>}
                        <p className="break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${isMyMessage ? "text-blue-100" : "text-slate-400"}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Message input */}
            <div className="p-4 border-t border-slate-800/20 bg-slate-900/40 flex-shrink-0">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-3 py-2 bg-slate-800/30 border border-slate-700/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Optionally, show a down-arrow button if not at bottom */}
            {!autoScroll && (
              <button
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="fixed bottom-20 right-4 p-2 bg-blue-500 text-white rounded-full shadow-lg z-50"
                title="Scroll to latest"
              >
                ↓
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Add this CSS to your global styles or in a CSS module for custom scrollbars:
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
*/
