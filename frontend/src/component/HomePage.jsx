/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Search,
  Bell,
  MessageCircle,
  Users,
  User,
  Plus,
  MoreHorizontal,
  HeartIcon as HeartOutline,
  HeartIcon as HeartFilled,
  Bookmark,
  Trash2,
  Edit3,
  Home,
  Compass,
  Settings,
  Camera,
  Send,
  X,
  Eye,
  EyeOff,
} from "lucide-react"
import api from "../utils/api"
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET, getApiBaseUrl } from "../config/constants"
import Messages from "./Messages"
import Notifications from "./Notifications"
import Connections from "./Connections"
import Explore from "./Explore"
import SearchModal from "./SearchModal"
import UserProfileModal from "./UserProfileModal"
import { useSocket } from '../SocketContext'
import ProfileModal from './ProfileModal'

export default function HomePage() {
  const navigate = useNavigate()

  // State management
  const [posts, setPosts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [file, setFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [caption, setCaption] = useState("")
  const [success, setSuccess] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState("")
  const [activeSection, setActiveSection] = useState("home")
  const [rightPanel, setRightPanel] = useState(null)
  const [postAnonymously, setPostAnonymously] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingCaptionId, setEditingCaptionId] = useState(null)
  const [editingCaption, setEditingCaption] = useState("")

  // New state for bookmarks and comments
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set())
  const [openComments, setOpenComments] = useState(new Set())
  const [commentTexts, setCommentTexts] = useState({})
  const [postComments, setPostComments] = useState({})

  // New state for search and profile modals
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)

  // New state for messages
  const [selectedConversation, setSelectedConversation] = useState(null)

  // New state for conversations
  const [conversations, setConversations] = useState([])

  // New state for notifications
  const [notifications, setNotifications] = useState([])

  // New state for profile modal
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  // Add user and connections state
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);

  // New state for profile picture upload error
  const [profilePicUploadError, setProfilePicUploadError] = useState("");

  // New state for auth error modal
  const [authErrorModal, setAuthErrorModal] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState("");

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
    }
  }, [navigate])

  // Load posts and user data
  useEffect(() => {
    loadPosts()
    loadUserData()
  }, [])

  // Load conversations for unread badge
  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await api.get("/api/messages/conversations")
      setConversations(response.data || [])
    } catch (error) {
      setConversations([])
    }
  }

  useEffect(() => {
    loadConversations()
    const interval = setInterval(loadConversations, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPosts = async () => {
    try {
      const response = await api.get("/api/posts")
      const postsData = Array.isArray(response.data) ? response.data : []
      setPosts(postsData)

      // Initialize comments for each post
      const commentsData = {}
      postsData.forEach((post) => {
        commentsData[post._id] = post.comments || []
      })
      setPostComments(commentsData)

      // Load bookmarked posts to sync state
      try {
        const bookmarksResponse = await api.get("/api/posts/bookmarks")
        const bookmarkedIds = new Set(bookmarksResponse.data?.map(post => post._id) || [])
        setBookmarkedPosts(bookmarkedIds)
      } catch (bookmarkError) {
        console.error("Error loading bookmarks:", bookmarkError)
        // Keep existing bookmark state if API fails
      }
    } catch (error) {
      console.error("Error loading posts:", error)
      setPosts([]) // Set empty array if API fails
    }
  }

  const loadUserData = () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserId(payload.userId)
        setUserName(payload.name || payload.username || "User")
      } catch (error) {
        console.error("Error decoding token:", error)
        // If token is invalid, redirect to login
        localStorage.removeItem("token")
        navigate("/login")
      }
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    }
  }

  // Remove selected image
  const removeImage = () => {
    setFile(null)
    setImagePreview(null)
  }

  // Close modal and reset form
  const closeModal = () => {
    setShowModal(false)
    setFile(null)
    setImagePreview(null)
    setCaption("")
    setPostAnonymously(false)
  }

  // Handle post creation
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append("image", file)
    formData.append("caption", caption)
    formData.append("anonymous", postAnonymously)

    try {
      await api.post(`/api/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      closeModal()
      setSuccess(true)
      loadPosts() // Reload posts
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error uploading post:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle post interactions
  const handleLike = async (postId) => {
    try {
      await api.post(`/api/posts/${postId}/like`, {})
      loadPosts() // Refresh posts to show updated likes
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleBookmark = async (postId) => {
    try {
      await api.post(`/api/posts/${postId}/bookmark`, {})

      // Toggle bookmark state locally
      const newBookmarked = new Set(bookmarkedPosts)
      if (newBookmarked.has(postId)) {
        newBookmarked.delete(postId)
      } else {
        newBookmarked.add(postId)
      }
      setBookmarkedPosts(newBookmarked)

      console.log("Post bookmarked!")
    } catch (error) {
      console.error("Error bookmarking post:", error)
    }
  }

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: "Check out this post",
        text: post.caption,
        url: window.location.href,
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  // Handle section navigation
  const handleSectionClick = (section) => {
    setActiveSection(section)
    setRightPanel(section !== "home" ? section : null)
  }

  // Handle comment functionality
  const toggleComments = (postId) => {
    const newOpenComments = new Set(openComments)
    if (newOpenComments.has(postId)) {
      newOpenComments.delete(postId)
    } else {
      newOpenComments.add(postId)
    }
    setOpenComments(newOpenComments)
  }

  const handleCommentSubmit = async (postId) => {
    const commentText = commentTexts[postId]
    if (!commentText || !commentText.trim()) return

    try {
      const response = await api.post(`/api/posts/${postId}/comment`, { text: commentText })

      // Update local comments state with server response
      const newComments = { ...postComments }
      if (!newComments[postId]) {
        newComments[postId] = []
      }
      // Use the comment from server response if available, otherwise create local one
      const newComment = response.data || {
        _id: Date.now().toString(),
        text: commentText,
        author: { name: userName },
        createdAt: new Date().toISOString(),
      }
      newComments[postId].push(newComment)
      setPostComments(newComments)

      // Clear comment input
      setCommentTexts({ ...commentTexts, [postId]: "" })

      // Refresh posts to get updated comment count
      loadPosts()
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleCommentChange = (postId, value) => {
    setCommentTexts({ ...commentTexts, [postId]: value })
  }

  // Handle search functionality
  const handleSearchClick = () => {
    setShowSearchModal(true)
  }

  const handleUserSelect = (user) => {
    setSelectedUserId(user._id)
    setShowProfileModal(true)
  }

  const handleStartConversation = (conversation) => {
    setActiveSection("messages")
    setRightPanel("messages")
    // You can add logic here to select the specific conversation
  }

  // Handle clicking on user names in posts
  const handleUserClick = (authorId) => {
    if (authorId && authorId !== userId) {
      setSelectedUserId(authorId)
      setShowProfileModal(true)
    }
  }

  // Handler to open messages with a specific user/conversation
  const openMessagesWithUser = (conversation) => {
    setSelectedConversation(conversation)
    setRightPanel("messages") // <-- This opens the right panel!
  }

  const loadNotifications = async () => {
    try {
      const response = await api.get("/api/notifications")
      setNotifications(response.data || [])
    } catch (error) {
      setNotifications([])
    }
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, []) // loadNotifications is stable, no need to add to deps

  const socket = useSocket()
  useEffect(() => {
    if (!socket) return
    socket.on("notification", () => {
      loadNotifications()
    })
    return () => {
      socket.off("notification")
    }
  }, [socket]) // socket dependency is correct

  // Fetch user and connections on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/users/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    const fetchConnections = async () => {
      try {
        const res = await api.get("/api/connections");
        setConnections(res.data || []);
      } catch (err) {
        setConnections([]);
      }
    };
    fetchUser();
    fetchConnections();
  }, []);

  // Handler for updating profile
  const handleProfileUpdate = async (data) => {
    try {
      const res = await api.put(`/api/users/${userId}/profile`, data);
      setUser(res.data);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // New function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Handler for uploading profile picture
  const handleProfilePictureUpload = async (file) => {
    setProfilePicUploadError("");
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      setProfilePicUploadError("Your session has expired. Please log in again to change your profile picture.");
      return;
    }
    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const uploadRes = await axios.post(
        CLOUDINARY_UPLOAD_URL,
        formData
      );
      const imageUrl = uploadRes.data.secure_url;
      // Update user profile picture
      await handleProfileUpdate({ profilePicture: imageUrl });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setProfilePicUploadError("Authentication failed. Please log in again.");
      } else {
        setProfilePicUploadError("Failed to upload profile picture. Please try again.");
      }
    }
  };

  // Handler for removing a connection
  const handleRemoveConnection = async (connectionId) => {
    try {
      await api.delete(`/api/connections/${connectionId}`);
      setConnections(connections.filter((c) => c._id !== connectionId));
    } catch (err) {
      console.error("Error removing connection:", err);
    }
  };

  useEffect(() => {
    const handleAuthError = (e) => {
      setAuthErrorMessage(e.detail?.message || "Session expired. Please log in again.");
      setAuthErrorModal(true);
    };
    window.addEventListener("authError", handleAuthError);
    return () => window.removeEventListener("authError", handleAuthError);
  }, []);

  // Calculate unread counts
  const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/8 to-purple-500/8 rounded-full blur-xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-60 right-32 w-24 h-24 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-xl animate-bounce"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-xl animate-pulse"
          style={{ animationDuration: "5s" }}
        ></div>
      </div>

      {/* Top Navigation */}
      <nav className="relative z-50 bg-slate-900/50 backdrop-blur-2xl border-b border-slate-800/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 bg-white rounded-lg"></div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                SkillBridge
              </h1>
            </div>

            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for users..."
                  onClick={handleSearchClick}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20 transition-all duration-300 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="w-10 h-10 bg-slate-800/30 backdrop-blur-xl text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-xl transition-all duration-300 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </button>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover cursor-pointer"
                  onClick={() => setProfileModalOpen(true)}
                />
              ) : (
                <div
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer border-2 border-blue-500"
                  onClick={() => setProfileModalOpen(true)}
                >
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)] min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 bg-slate-900/30 backdrop-blur-2xl border-r border-slate-800/20 relative z-40">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <button
                onClick={() => handleSectionClick("home")}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeSection === "home"
                    ? "bg-gradient-to-r from-blue-600/15 to-purple-600/15 text-white border border-blue-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/20"
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="font-medium">Home Feed</span>
              </button>

              <button
                onClick={() => handleSectionClick("explore")}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeSection === "explore"
                    ? "bg-gradient-to-r from-blue-600/15 to-purple-600/15 text-white border border-blue-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/20"
                }`}
              >
                <Compass className="w-6 h-6" />
                <span className="font-medium">Explore</span>
              </button>

              <button
                onClick={() => handleSectionClick("messages")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeSection === "messages"
                    ? "bg-gradient-to-r from-blue-600/15 to-purple-600/15 text-white border border-blue-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/20"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">Messages</span>
                </div>
                {unreadMessages > 0 && (
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSectionClick("notifications")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeSection === "notifications"
                    ? "bg-gradient-to-r from-blue-600/15 to-purple-600/15 text-white border border-blue-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/20"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Bell className="w-6 h-6" />
                  <span className="font-medium">Notifications</span>
                </div>
                {unreadNotifications > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSectionClick("connections")}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeSection === "connections"
                    ? "bg-gradient-to-r from-blue-600/15 to-purple-600/15 text-white border border-blue-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/20"
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="font-medium">Connections</span>
              </button>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-6 h-6" />
              <span>Create Post</span>
            </button>

            <div className="bg-slate-800/20 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/20">
              <h3 className="text-white font-semibold mb-3">Your Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Posts</span>
                  <span className="text-white font-medium">{posts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Connections</span>
                  <span className="text-white font-medium">248</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Views</span>
                  <span className="text-white font-medium">1.2k</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${rightPanel ? "border-r border-slate-800/20" : ""}`}>
          <div className="max-w-2xl mx-auto p-6">
            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-gradient-to-r from-emerald-600/15 to-green-600/15 backdrop-blur-xl border border-emerald-500/20 text-white px-6 py-4 rounded-2xl flex items-center shadow-xl">
                <div className="w-8 h-8 mr-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold">Post shared successfully!</span>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-8">
              {posts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                    <Camera className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Share Your Journey</h3>
                  <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                    Connect with brilliant minds and showcase your skills to the world.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Create Your First Post</span>
                  </button>
                </div>
              ) : (
                posts.map((post) => {
                  const isLiked = post.likedBy?.includes(userId)
                  const isBookmarked = bookmarkedPosts.has(post._id)
                  const isCommentsOpen = openComments.has(post._id)
                  const comments = postComments[post._id] || []

                  return (
                    <article
                      key={post._id}
                      className="bg-slate-800/15 backdrop-blur-2xl border border-slate-700/15 rounded-3xl overflow-hidden hover:bg-slate-800/20 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-blue-500/5"
                    >
                      {/* Post Header */}
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
                            onClick={() => handleUserClick(post.author?._id || post.author)}
                          >
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4
                              className="font-bold text-white cursor-pointer hover:text-blue-300 transition-colors"
                              onClick={() => handleUserClick(post.author?._id || post.author)}
                            >
                              {post.anonymous ? "Anonymous User" : post.author?.name || post.author || userName}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {new Date(post.createdAt).toLocaleDateString()} • Public
                            </p>
                          </div>
                        </div>

                        {userId === (post.author?._id || post.author) && (
                          <div className="relative">
                            <button
                              onClick={() => setMenuOpen(menuOpen === post._id ? null : post._id)}
                              className="w-10 h-10 text-slate-400 hover:text-white hover:bg-slate-700/20 rounded-xl transition-all duration-300 flex items-center justify-center"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {menuOpen === post._id && (
                              <div className="absolute right-0 top-12 w-48 bg-slate-800/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-700/20 overflow-hidden z-30">
                                <button
                                  onClick={() => {
                                    setEditingCaptionId(post._id)
                                    setEditingCaption(post.caption || "")
                                    setMenuOpen(null)
                                  }}
                                  className="w-full flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/20 transition-all duration-200"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  <span>Edit Post</span>
                                </button>
                                <button
                                  onClick={async () => {
                                    await api.delete(`/api/posts/${post._id}`)
                                    loadPosts()
                                    setMenuOpen(null)
                                  }}
                                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete Post</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Post Caption */}
                      {editingCaptionId === post._id ? (
                        <div className="px-6 pb-4 flex flex-col gap-2">
                          <textarea
                            value={editingCaption}
                            onChange={(e) => setEditingCaption(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700/20 border border-slate-600/20 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              className="px-4 py-1 bg-blue-600 text-white rounded"
                              onClick={async () => {
                                try {
                                  await api.put(`/api/posts/${post._id}`, { caption: editingCaption })
                                  setEditingCaptionId(null)
                                  loadPosts()
                                } catch (err) {
                                  alert("Failed to update caption")
                                }
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="px-4 py-1 bg-slate-600 text-white rounded"
                              onClick={() => setEditingCaptionId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        post.caption && (
                          <div className="px-6 pb-4">
                            <p className="text-slate-200 leading-relaxed">{post.caption}</p>
                          </div>
                        )
                      )}

                      {/* Post Image */}
                      <div className="relative group">
                        <img
                          src={
                            post.imageUrl?.startsWith("http") ? post.imageUrl : `${getApiBaseUrl()}${post.imageUrl}`
                          }
                          alt={post.caption || "Post image"}
                          className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-700"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>

                      {/* Post Actions */}
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLike(post._id)}
                              className={`flex items-center space-x-2 px-4 py-2 ${
                                isLiked ? "text-red-500" : "text-slate-300"
                              } hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group`}
                            >
                              {isLiked ? (
                                <HeartFilled
                                  fill="currentColor"
                                  className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <HeartOutline className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                              )}
                              <span className="font-medium">{post.likes || 0}</span>
                            </button>
                            <button
                              onClick={() => toggleComments(post._id)}
                              className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-300 group"
                            >
                              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                              <span className="font-medium">{comments.length}</span>
                            </button>
                            <button
                              onClick={() => handleShare(post)}
                              className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-green-400 hover:bg-green-500/10 rounded-xl transition-all duration-300 group"
                            >
                              <Send className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                              <span className="font-medium">Share</span>
                            </button>
                          </div>
                          <button
                            onClick={() => handleBookmark(post._id)}
                            className={`w-12 h-12 ${
                              isBookmarked ? "text-yellow-400" : "text-slate-300"
                            } hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition-all duration-300 flex items-center justify-center group`}
                          >
                            <Bookmark
                              className={`w-5 h-5 group-hover:scale-110 transition-transform duration-300 ${
                                isBookmarked ? "fill-current" : ""
                              }`}
                            />
                          </button>
                        </div>

                        {/* Comments Section */}
                        {isCommentsOpen && (
                          <div className="mt-6 pt-6 border-t border-slate-700/20">
                            {/* Comment Input */}
                            <div className="flex space-x-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentTexts[post._id] || ""}
                                  onChange={(e) => handleCommentChange(post._id, e.target.value)}
                                  className="flex-1 px-3 py-2 bg-slate-700/20 border border-slate-600/20 text-slate-200 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handleCommentSubmit(post._id)
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleCommentSubmit(post._id)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 text-sm"
                                >
                                  Post
                                </button>
                              </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-3">
                              {comments.map((comment) => (
                                <div key={comment._id} className="flex space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-slate-700/20 rounded-lg px-3 py-2">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span
                                          className="text-sm font-medium text-white cursor-pointer hover:text-blue-300 transition-colors"
                                          onClick={() => handleUserClick(comment.author?._id || comment.author)}
                                        >
                                          {comment.author?.name || comment.author || userName}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-200">{comment.text}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </div>
        </main>

        {/* Right Panel */}
        {rightPanel && (
          <div className="w-96 flex flex-col h-full min-h-0 bg-slate-900/30 backdrop-blur-2xl border-l border-slate-800/20">
            {rightPanel === "messages" && (
              <Messages
                onClose={() => setRightPanel(null)}
                selectedConversation={selectedConversation}
                reloadConversations={loadConversations}
                conversations={conversations}
              />
            )}
            {rightPanel === "notifications" && <Notifications onClose={() => setRightPanel(null)} notifications={notifications} loadNotifications={loadNotifications} unreadNotifications={unreadNotifications} />}
            {rightPanel === "connections" && <Connections onClose={() => setRightPanel(null)} onOpenMessages={openMessagesWithUser} />}
            {rightPanel === "explore" && <Explore onClose={() => setRightPanel(null)} />}
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} onUserSelect={handleUserSelect} />

      {/* User Profile Modal */}
      <UserProfileModal
        userId={selectedUserId}
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          setSelectedUserId(null)
        }}
        onStartConversation={handleStartConversation}
      />

      {/* Compact Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/20 rounded-2xl shadow-2xl w-full max-w-md">
            <form onSubmit={handleUpload} className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create Post</h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full px-3 py-2 bg-slate-700/20 border border-slate-600/20 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-purple-600 file:text-white file:text-sm file:font-medium file:cursor-pointer hover:file:from-blue-700 hover:file:to-purple-700"
                  />

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Caption</label>
                  <textarea
                    placeholder="What's on your mind?"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700/20 border border-slate-600/20 text-slate-200 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-sm"
                  />
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPostAnonymously(!postAnonymously)}
                      className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-300"
                    >
                      {postAnonymously ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="text-sm">Post as {postAnonymously ? "Anonymous" : userName || "User"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700/20 hover:bg-slate-700/40 text-slate-300 hover:text-white font-medium rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Posting..." : "Share Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModalOpen && (
        <ProfileModal
          user={user}
          connections={connections}
          onClose={() => setProfileModalOpen(false)}
          onProfileUpdate={handleProfileUpdate}
          onProfilePictureUpload={handleProfilePictureUpload}
          onRemoveConnection={handleRemoveConnection}
          uploadError={profilePicUploadError}
        />
      )}

      {/* Auth Error Modal */}
      {authErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Session Expired</h2>
            <p className="text-slate-700 mb-6 text-center">{authErrorMessage}</p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => { window.location.href = "/login"; }}
            >
              Log In Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
