/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect, useRef } from "react"
import { X, Search, Send, MessageCircle } from "lucide-react"
import api from "../utils/api"
import { useSocket } from '../SocketContext'

export default function Messages({ onClose, reloadConversations, conversations }) {
  const [selectedConv, setSelectedConversation] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null) // <-- for new chat
  const [lastSelectedConvId, setLastSelectedConvId] = useState(null) // Remember last selected conversation
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userId, setUserId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [connections, setConnections] = useState([]) // Add connections state
  const messagesEndRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const { socket, isConnected, isAuthenticated, emit, on, off, once } = useSocket()
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
    console.log('🚀 [Frontend] Messages component mounted');
    loadUserData()
    loadConversations()
    loadConnections() // Load connections
    
    // Don't auto-select conversations - show connections list first
  }, [])

  useEffect(() => {
    selectedConvRef.current = selectedConv;
    selectedUserRef.current = selectedUser;
  }, [selectedConv, selectedUser]);

  // Socket event listeners - simplified and optimized
  useEffect(() => {
    if (!socket || !userId || !isConnected) return;

    console.log('🔗 [Frontend] Setting up socket listeners - connected:', isConnected, 'authenticated:', isAuthenticated);

    const handleNewMessage = (message) => {
      console.log('📨 [Socket] New message received:', message);
      console.log('📨 [Socket] Current state - selectedConv:', selectedConvRef.current?._id, 'selectedUser:', selectedUserRef.current?._id);
      
      // Validate message structure
      if (!message || !message._id || !message.content) {
        console.warn('⚠️ [Socket] Invalid message structure received:', message);
        return;
      }
      
      // Check if message belongs to current conversation
      const currentConvId = selectedConvRef.current?._id;
      const currentUserId = selectedUserRef.current?._id;
      
      // Get message sender and receiver IDs (handle both populated and non-populated)
      const senderId = message.sender?._id || message.sender;
      const receiverId = message.receiver?._id || message.receiver;
      
      console.log('📨 [Socket] Message details - sender:', senderId, 'receiver:', receiverId, 'conversation:', message.conversation);
      
      // Add message if it's for current conversation
      if (currentConvId && message.conversation === currentConvId) {
        console.log('✅ [Socket] Adding message to current conversation');
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      // Add message if it's for current user chat (when no conversation selected yet)
      else if (currentUserId && !currentConvId && 
        (senderId === currentUserId || receiverId === currentUserId ||
         senderId === userId || receiverId === userId)) {
        console.log('✅ [Socket] Adding message to current user chat');
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      // Add message if it involves the current user (sender or receiver)
      else if ((senderId === userId || receiverId === userId) && 
               (currentConvId || currentUserId)) {
        console.log('✅ [Socket] Adding message involving current user');
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      } else {
        console.log('⚠️ [Socket] Message not for current conversation/user, skipping');
      }
      
      // Always reload conversations to update last message
      if (reloadConversations) {
        setTimeout(() => reloadConversations(), 100);
      }
    };

    const handleTyping = (data) => {
      console.log('⌨️ [Socket] Typing event:', data);
      
      // Validate typing data
      if (!data || !data.conversationId || !data.userId) {
        console.warn('⚠️ [Socket] Invalid typing data received:', data);
        return;
      }
      
      const currentConvId = selectedConvRef.current?._id;
      
      if (data.conversationId === currentConvId && data.userId !== userId) {
        const isTypingNow = data.isTyping !== false; // default to true
        setIsTyping(isTypingNow);
        
        if (typingTimeout) clearTimeout(typingTimeout);
        
        if (isTypingNow) {
          const timeout = setTimeout(() => setIsTyping(false), 3000);
          setTypingTimeout(timeout);
        }
      }
    };

    const handleStatus = (data) => {
      console.log('🟢 [Socket] Status update:', data);
      
      // Update selected conversation participant status
      if (selectedConvRef.current?.otherParticipant?._id === data.userId) {
        setSelectedConversation(prev => ({
          ...prev,
          otherParticipant: {
            ...prev.otherParticipant,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen
          }
        }));
      }
      
      // Update selected user status
      if (selectedUserRef.current?._id === data.userId) {
        setSelectedUser(prev => ({
          ...prev,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen
        }));
      }
      
      if (reloadConversations) reloadConversations();
    };

    // Handle socket errors
    const handleSocketError = (error) => {
      console.error('❌ [Socket] Socket error in Messages:', error);
      // Could show user notification here
    };
    
    const handleMessageDelivered = (data) => {
      console.log('✅ [Socket] Message delivered confirmation:', data);
      // Could update message status in UI
    };

    // Add event listeners
    on('newMessage', handleNewMessage);
    on('typing', handleTyping);
    on('status', handleStatus);
    on('error', handleSocketError);
    on('messageDelivered', handleMessageDelivered);

    // Cleanup
    return () => {
      off('newMessage', handleNewMessage);
      off('typing', handleTyping);
      off('status', handleStatus);
      off('error', handleSocketError);
      off('messageDelivered', handleMessageDelivered);
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [socket, userId, isConnected, isAuthenticated]);

  // Load messages when conversation/user selection changes - optimized
  useEffect(() => {
    if (!userId) return;
    
    console.log('🔄 [Frontend] Selection changed - selectedConv:', selectedConv?._id, 'selectedUser:', selectedUser?._id);
    
    if (selectedConv) {
      console.log('📋 [Frontend] Loading messages for conversation:', selectedConv._id);
      console.log('📋 [Frontend] Conversation participants:', selectedConv.participants);
      
      const otherParticipant = getOtherParticipant(selectedConv.participants, userId);
      console.log('📋 [Frontend] Other participant found:', otherParticipant?._id);
      
      if (otherParticipant?._id) {
        loadMessages(otherParticipant._id);
      } else {
        console.log('⚠️ [Frontend] No other participant found in conversation');
      }
      setSelectedUser(null);
    } else if (selectedUser?._id) {
      console.log('📋 [Frontend] Loading messages for user:', selectedUser._id);
      loadMessages(selectedUser._id);
    } else {
      // Don't clear messages immediately - let them persist
      console.log('⚠️ [Frontend] No selection, keeping existing messages');
    }
  }, [selectedConv?._id, selectedUser?._id, userId])

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
    console.log('📋 [Frontend] Loading conversations');
    try {
      const response = await api.get("/api/messages/conversations")
      console.log('✅ [Frontend] Conversations loaded:', response.data?.length || 0);
      // The conversations are passed as props, but we can also reload them here if needed
      if (reloadConversations) {
        reloadConversations()
      }
    } catch (error) {
      console.error('❌ [Frontend] Error loading conversations:', error);
      console.error('❌ [Frontend] Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false)
    }
  }

  const loadConnections = async () => {
    console.log('📋 [Frontend] Loading connections');
    try {
      const response = await api.get("/api/connections")
      console.log('✅ [Frontend] Connections loaded:', response.data?.length || 0);
      setConnections(response.data || [])
    } catch (error) {
      console.error('❌ [Frontend] Error loading connections:', error);
    }
  }

  // Don't auto-select conversations - let user choose from connections list
  // useEffect(() => {
  //   if (conversations && conversations.length > 0 && !selectedConv && !selectedUser && userId) {
  //     console.log('🔄 [Frontend] Auto-selecting conversation after conversations loaded');
  //     
  //     // Try to restore last selected conversation first
  //     let targetConv = null;
  //     if (lastSelectedConvId) {
  //       targetConv = conversations.find(conv => conv._id === lastSelectedConvId);
  //       console.log('🔄 [Frontend] Attempting to restore last selected conversation:', lastSelectedConvId);
  //       if (targetConv) {
  //         console.log('✅ [Frontend] Restored last selected conversation:', targetConv._id);
  //       } else {
  //         console.log('⚠️ [Frontend] Last selected conversation not found in current list');
  //       }
  //     }
  //     
  //     // If no last selected or not found, use first conversation
  //     if (!targetConv && conversations.length > 0) {
  //       targetConv = conversations[0];
  //       console.log('🔄 [Frontend] Using first conversation as fallback:', targetConv._id);
  //     }
  //     
  //     if (targetConv) {
  //       setSelectedConversation(targetConv);
  //     }
  //   }
  // }, [conversations.length, userId]) // Simplified dependencies to prevent loop

const loadMessages = async (id, beforeId = null, append = false) => {
  // Prevent duplicate calls
  if (loading && !append) {
    console.log('🚫 [Frontend] Already loading messages, skipping duplicate call');
    return;
  }
  
  console.log('📥 [Frontend] Loading messages - id:', id, 'beforeId:', beforeId, 'append:', append);
  console.log('📋 [Frontend] Current state - selectedConv:', selectedConv?._id, 'selectedUser:', selectedUser?._id);
  
  if (!append) setLoading(true);
  
  try {
    const token = localStorage.getItem("token");
    let url;
    let targetUserId;

    // Determine the target user ID for the API call
    if (selectedConv && selectedConv.otherParticipant?._id) {
      targetUserId = selectedConv.otherParticipant._id;
      url = `/api/messages/user/${targetUserId}`;
      console.log('🔗 [Frontend] Using conversation URL:', url);
    } else if (selectedUser && selectedUser._id) {
      targetUserId = selectedUser._id;
      url = `/api/messages/user/${targetUserId}`;
      console.log('🔗 [Frontend] Using user URL:', url);
    } else if (id) {
      targetUserId = id;
      url = `/api/messages/user/${targetUserId}`;
      console.log('🔗 [Frontend] Using provided ID URL:', url);
    } else {
      console.log('⚠️ [Frontend] No valid ID found, keeping existing messages');
      setLoading(false);
      return; // Don't clear messages, just return
    }

    // Validate that we have a proper user ID
    if (!targetUserId || !targetUserId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('⚠️ [Frontend] Invalid user ID format:', targetUserId);
      setLoading(false);
      return;
    }

    if (beforeId) {
      url += `?before=${beforeId}`;
      console.log('📄 [Frontend] Added pagination parameter:', url);
    }

    console.log('🌐 [Frontend] Making API call to:', url);
    const response = await api.get(url);
    console.log('✅ [Frontend] Messages loaded:', response.data?.length || 0);

    const newMessages = Array.isArray(response.data) ? response.data : [];
    
    if (append) {
      console.log('➕ [Frontend] Appending messages to existing list');
      setMessages((prev) => [...newMessages, ...prev]);
    } else {
      console.log('🔄 [Frontend] Replacing messages list');
      setMessages(newMessages);
    }

    setHasMore(newMessages.length > 0);
    if (newMessages.length > 0) {
      setOldestMessageId(newMessages[0]._id);
    }
    
    // Only reload conversations occasionally, not on every message load
    if (!append && Math.random() < 0.3) {
      reloadConversations();
    }
  } catch (error) {
    console.error('❌ [Frontend] Error loading messages:', error);
    console.error('❌ [Frontend] Error details:', error.response?.data || error.message);
    
    // Only clear messages if it's a 404 or authentication error
    if (error.response?.status === 404 || error.response?.status === 401) {
      setMessages([]);
    }
    setHasMore(false);
  } finally {
    setLoading(false);
  }
};


  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageContent = newMessage;
    setNewMessage(""); // Clear input immediately for better UX
    
    try {
      let payload;
      let receiverId;
      
      if (selectedConv) {
        payload = { conversationId: selectedConv._id, content: messageContent };
        // Use otherParticipant directly from conversation object
        receiverId = selectedConv.otherParticipant?._id || getOtherParticipant(selectedConv.participants, userId)?._id;
        console.log('📤 [Frontend] Conversation mode - otherParticipant:', selectedConv.otherParticipant);
        console.log('📤 [Frontend] Conversation participants:', selectedConv.participants);
      } else if (selectedUser) {
        payload = { receiverId: selectedUser._id, content: messageContent };
        receiverId = selectedUser._id;
        console.log('📤 [Frontend] User mode - selectedUser:', selectedUser);
      } else {
        alert("Please select a user to chat with.");
        setNewMessage(messageContent); // Restore message
        return;
      }
      
      // Ensure receiverId is valid
      if (!receiverId) {
        console.error('❌ [Frontend] No valid receiverId found');
        console.log('📋 [Frontend] Debug - selectedConv:', selectedConv);
        console.log('📋 [Frontend] Debug - selectedUser:', selectedUser);
        console.log('📋 [Frontend] Debug - userId:', userId);
      }
      
      console.log('📤 [Frontend] Sending message:', payload);
      console.log('📤 [Frontend] Receiver ID:', receiverId);
      
      const response = await api.post("/api/messages", payload);
      console.log('✅ [Frontend] Message sent successfully:', response.data);
      
      // Add message to local state immediately
      setMessages(prev => {
        // Prevent duplicates
        if (prev.some(m => m._id === response.data._id)) return prev;
        return [...prev, response.data];
      });
      
      // Emit via Socket.IO for real-time delivery to other user
      if (isConnected && isAuthenticated && receiverId) {
        console.log('📡 [Frontend] Emitting socket message to:', receiverId);
        console.log('📡 [Frontend] Socket status - connected:', isConnected, 'authenticated:', isAuthenticated);
        
        const success = emit("sendMessage", {
          ...response.data,
          receiverId: receiverId
        });
        
        if (!success) {
          console.warn('⚠️ [Frontend] Failed to emit socket message - connection issue');
        }
      } else {
        console.log('⚠️ [Frontend] Cannot emit socket message - connected:', isConnected, 'authenticated:', isAuthenticated, 'receiverId:', receiverId);
      }
      
      // Handle new conversation creation
      if (!selectedConv && selectedUser) {
        console.log('🔄 [Frontend] Creating new conversation, reloading conversations');
        if (reloadConversations) {
          await reloadConversations();
        }
        // Find the new conversation after reload
        setTimeout(() => {
          const newConv = conversations.find(conv =>
            conv.otherParticipant && conv.otherParticipant._id === selectedUser._id
          );
          if (newConv) {
            console.log('✅ [Frontend] Found new conversation:', newConv._id);
            setSelectedConversation(newConv);
            setSelectedUser(null);
          }
        }, 500);
      } else {
        // Just reload conversations to update last message
        if (reloadConversations) reloadConversations();
      }
      
    } catch (error) {
      console.error('❌ [Frontend] Error sending message:', error);
      console.error('❌ [Frontend] Error details:', error.response?.data || error.message);
      setNewMessage(messageContent); // Restore message on error
      alert('Failed to send message. Please try again.');
    }
  }

  const getOtherParticipant = (participants, userId) => {
    if (!participants || !Array.isArray(participants)) {
      console.log('⚠️ [Frontend] getOtherParticipant - participants invalid:', participants);
      return null;
    }
    const other = participants.find((p) => String(p._id || p.id || p) !== String(userId));
    console.log('📋 [Frontend] getOtherParticipant - found:', other);
    return other || null;
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

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Emit typing indicator
    if (isConnected && isAuthenticated && userId) {
      const convId = selectedConv?._id;
      if (convId) {
        const success = emit("typing", {
          conversationId: convId,
          userId: userId,
          isTyping: e.target.value.length > 0
        });
        
        if (!success) {
          console.warn('⚠️ [Frontend] Failed to emit typing event');
        }
      }
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const displayName = getDisplayName(conv.otherParticipant)
    return displayName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Filter connections that don't have conversations yet
  const availableConnections = connections.filter((conn) => {
    const hasConversation = conversations.some(conv => 
      conv.otherParticipant?._id === conn.user._id
    )
    const displayName = getDisplayName(conn.user)
    return !hasConversation && displayName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Combine conversations and available connections for display
  const allChatItems = [...filteredConversations, ...availableConnections.map(conn => ({
    _id: `connection-${conn._id}`,
    isConnection: true,
    otherParticipant: conn.user,
    lastMessage: null,
    unreadCount: 0
  }))]

  const handleConnectionClick = (connection) => {
    console.log('🔄 [Frontend] Selected connection for new chat:', connection.user._id);
    setSelectedUser(connection.user)
    setSelectedConversation(null)
    setMessages([])
  }

  // Example: handle selecting a user from a search or connections list
  // Call this when you click a user to start a new chat
  const handleStartChat = (user) => {
    setSelectedUser(user)
    setSelectedConversation(null)
    // Don't clear messages immediately - let loadMessages handle it
  }

  // When conversations are updated, update selectedConv to the latest object - optimized
  useEffect(() => {
    if (selectedConv && conversations.length > 0) {
      const updated = conversations.find(conv => conv._id === selectedConv._id);
      if (updated && updated !== selectedConv) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations, selectedConv?._id]);

  // When selecting a conversation, always use the latest object from conversations
  const handleSelectConversation = (conv) => {
    const updated = conversations.find(c => c._id === conv._id) || conv;
    setSelectedConversation(updated);
    setSelectedUser(null);
    // Remember this conversation for next time
    setLastSelectedConvId(updated._id);
    // Don't clear messages immediately - let loadMessages handle it
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
              // Keep messages in state for better UX
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
            {allChatItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                  <MessageCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No conversations yet</h3>
                <p className="text-slate-400 text-sm mb-4">You have no connections to message</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 text-sm"
                >
                  Find Connections
                </button>
              </div>
            ) : (
              allChatItems.map((item) => {
                if (item.isConnection) {
                  // Render connection item
                  const displayName = getDisplayName(item.otherParticipant)
                  return (
                    <button
                      key={item._id}
                      onClick={() => handleConnectionClick({ user: item.otherParticipant })}
                      className="w-full p-3 hover:bg-slate-800/50 transition-colors duration-200 text-left border-b border-slate-800/50 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white text-sm truncate">
                            {displayName}
                          </span>
                          <span className="text-xs text-blue-400 ml-2 flex-shrink-0">
                            New Chat
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs truncate">
                          Start a conversation
                        </p>
                      </div>
                    </button>
                  )
                }
                
                // Render conversation item
                const conversation = item
                const displayName = getDisplayName(conversation.otherParticipant)
                return (
                  <button
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full p-3 hover:bg-slate-800/50 transition-colors duration-200 text-left border-b border-slate-800/50 flex items-center gap-3 ${
                      selectedConv?._id === conversation._id ? "bg-slate-800/70" : ""
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm truncate">
                          {displayName}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {conversation.lastMessage?.createdAt
                            ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
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
