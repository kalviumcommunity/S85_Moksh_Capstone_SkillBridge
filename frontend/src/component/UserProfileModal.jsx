"use client"

import { useState, useEffect } from "react"
import { X, UserPlus, MessageCircle, MapPin, Link, Calendar, Heart, Camera } from "lucide-react"
import api from "../utils/api"

export default function UserProfileModal({ userId, isOpen, onClose, onStartConversation }) {
  const [user, setUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState(null) // null, 'connected', 'pending', 'none'
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile()
      loadUserPosts()
      checkConnectionStatus()
    }
  }, [isOpen, userId])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setCurrentUserId(payload.userId)
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await api.get(`/api/users/${userId}`)
      setUser(response.data)
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const loadUserPosts = async () => {
    try {
      const response = await api.get(`/api/users/${userId}/posts`)
      setUserPosts(response.data || [])
    } catch (error) {
      console.error("Error loading user posts:", error)
      setUserPosts([])
    } finally {
      setLoading(false)
    }
  }

  const checkConnectionStatus = async () => {
    try {
      const response = await api.get(`/api/connections/status/${userId}`)
      setConnectionStatus(response.data.status)
    } catch (error) {
      console.error("Error checking connection status:", error)
      setConnectionStatus("none")
    }
  }

  const sendConnectionRequest = async () => {
    try {
      console.log("[UserProfileModal] Sending connection request to userId:", userId, "from currentUserId:", currentUserId)
      await api.post("/api/connections/request", { userId: userId })
      setConnectionStatus("pending")
      alert("Connection request sent!")
    } catch (error) {
      console.error("Error sending connection request:", error)
      alert("Failed to send connection request")
    }
  }

  const startConversation = async () => {
    try {
      const response = await api.post(
        "/api/messages/conversations",
        { participantId: userId }
      )
      if (onStartConversation) {
        onStartConversation(response.data)
      }
      onClose()
    } catch (error) {
      console.error("Error starting conversation:", error)
      alert("Failed to start conversation")
    }
  }

  if (!isOpen || !userId) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/20 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 h-96 flex items-center justify-center">
          <div className="text-slate-400">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 rounded-full transition-all duration-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4 sm:mb-0">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center border-4 border-slate-800 shadow-xl">
                  <span className="text-white font-bold text-3xl">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                </div>
                {user?.isOnline && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">{user?.name || "Unknown User"}</h1>
                <p className="text-slate-400 mb-2">@{user?.username}</p>
                {user?.bio && <p className="text-slate-300 mb-3">{user.bio}</p>}

                {/* User Details */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                  {user?.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user?.website && (
                    <div className="flex items-center space-x-1">
                      <Link className="w-4 h-4" />
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex space-x-6 text-sm mb-4">
                  <div className="text-center">
                    <div className="font-bold text-white">{userPosts.length}</div>
                    <div className="text-slate-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white">{user?.followers?.length || 0}</div>
                    <div className="text-slate-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white">{user?.following?.length || 0}</div>
                    <div className="text-slate-400">Following</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {currentUserId !== userId && (
                  <div className="flex space-x-3">
                    {connectionStatus === "connected" ? (
                      <button
                        onClick={startConversation}
                        className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                    ) : connectionStatus === "pending" ? (
                      <button
                        disabled
                        className="flex items-center space-x-2 px-6 py-2 bg-slate-600/20 text-slate-400 font-medium rounded-lg cursor-not-allowed"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Request Sent</span>
                      </button>
                    ) : (
                      <button
                        onClick={sendConnectionRequest}
                        className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="border-t border-slate-700/20 max-h-96 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Posts ({userPosts.length})
            </h3>

            {userPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPosts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-slate-700/20 rounded-xl overflow-hidden hover:bg-slate-700/30 transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src={post.imageUrl?.startsWith("http") ? post.imageUrl : `${import.meta.env.VITE_API_URL}${post.imageUrl}`}
                      alt={post.caption || "Post"}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      {post.caption && <p className="text-slate-300 text-sm line-clamp-2 mb-2">{post.caption}</p>}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.likes || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comments?.length || 0}</span>
                          </span>
                        </div>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-400">No posts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
