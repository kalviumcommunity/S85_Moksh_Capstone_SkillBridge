/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { X, Search, Users, UserPlus, UserCheck, UserX, MessageCircle } from "lucide-react"
import axios from "axios"

export default function Connections({ onClose, onOpenMessages }) {
  const [activeTab, setActiveTab] = useState("connections") // connections, requests, discover
  const [connections, setConnections] = useState([])
  const [connectionRequests, setConnectionRequests] = useState([])
  const [discoverUsers, setDiscoverUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    loadUserData()
    loadConnections()
    loadConnectionRequests()
    loadDiscoverUsers()
  }, [])

  const loadUserData = () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserId(payload.userId)
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }
  }

  const loadConnections = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("/api/connections", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConnections(response.data || [])
    } catch (error) {
      console.error("Error loading connections:", error)
      setConnections([])
    }
  }

  // Update loadConnectionRequests
  const loadConnectionRequests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("/api/connections/requests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConnectionRequests(response.data || [])
    } catch (error) {
      console.error("Error loading connection requests:", error)
      setConnectionRequests([])
    }
  }

  const loadDiscoverUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("/api/connections/suggestions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDiscoverUsers(response.data || [])
    } catch (error) {
      console.error("Error loading discover users:", error)
      setDiscoverUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Update sendConnectionRequest
  const sendConnectionRequest = async (targetUserId) => {
    try {
      const token = localStorage.getItem("token")
      console.log("[sendConnectionRequest] Sending userId:", targetUserId)
      await axios.post(
        "/api/connections/request",
        { userId: targetUserId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      loadDiscoverUsers()
    } catch (error) {
      console.error("[sendConnectionRequest] Error:", error)
    }
  }

  // Update acceptConnectionRequest
  const acceptConnectionRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `/api/connections/${requestId}`,
        { status: "accepted" }, // <-- FIXED: use status, not action
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      loadConnectionRequests()
      loadConnections()
    } catch (error) {
      console.error("Error accepting connection request:", error)
    }
  }

  const rejectConnectionRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `/api/connections/${requestId}`,
        { status: "declined" }, // <-- FIXED: use status, not action
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      loadConnectionRequests()
    } catch (error) {
      console.error("Error rejecting connection request:", error)
    }
  }

  const handleMessageClick = async (userId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "/api/conversations",
        { participantId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (onOpenMessages) {
        onOpenMessages(response.data) // Pass the conversation object!
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  const filteredData = () => {
    let data = []
    switch (activeTab) {
      case "connections":
        data = connections.map(item => ({
          ...item.user, // flatten user fields to top-level for connections
          _id: item._id,
          connectedAt: item.connectedAt,
        }))
        break
      case "requests":
        data = connectionRequests
        break
      case "discover":
        data = discoverUsers
        break
      default:
        data = []
    }

    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requester?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  if (loading) {
    return (
      <div className="w-96 h-full bg-slate-900/30 backdrop-blur-2xl border-l border-slate-800/20 flex items-center justify-center">
        <div className="text-slate-400">Loading connections...</div>
      </div>
    )
  }

  return (
    <div className="w-96 h-full bg-slate-900/30 backdrop-blur-2xl border-l border-slate-800/20 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Connections</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/20 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab("connections")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              activeTab === "connections"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            My Connections
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative ${
              activeTab === "requests"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Requests
            {connectionRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                {connectionRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              activeTab === "discover"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Discover
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/30 border border-slate-700/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredData().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {activeTab === "connections" && "No connections yet"}
              {activeTab === "requests" && "No pending requests"}
              {activeTab === "discover" && "No users to discover"}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {activeTab === "connections" && "Start connecting with other users to build your network"}
              {activeTab === "requests" && "Connection requests will appear here"}
              {activeTab === "discover" && "Check back later for new users to connect with"}
            </p>
            {activeTab === "connections" && (
              <button
                onClick={() => setActiveTab("discover")}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 text-sm"
              >
                Discover Users
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredData().map((item) => (
              <div
                key={item._id}
                className="bg-slate-800/20 backdrop-blur-xl rounded-xl p-4 border border-slate-700/20 hover:bg-slate-800/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {(item.name || item.requester?.name || item.username)?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">
                      {item.name || item.requester?.name || item.username || "Unknown User"}
                    </h4>
                    <p className="text-slate-400 text-xs">
                      {item.email || item.requester?.email || "No email provided"}
                    </p>
                    {activeTab === "requests" && (
                      <p className="text-slate-500 text-xs mt-1">
                        Sent {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {activeTab === "connections" && (
                      <button
                        onClick={() => handleMessageClick(item._id)}
                        className="w-8 h-8 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-300 flex items-center justify-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    {activeTab === "requests" && (
                      <>
                        <button
                          onClick={() => acceptConnectionRequest(item._id)}
                          className="w-8 h-8 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-300 flex items-center justify-center"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectConnectionRequest(item._id)}
                          className="w-8 h-8 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300 flex items-center justify-center"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {activeTab === "discover" && (
                      <button
                        onClick={() => sendConnectionRequest(item._id)}
                        disabled={item.requestSent}
                        className={`w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center ${
                          item.requestSent
                            ? "bg-slate-600/20 text-slate-500 cursor-not-allowed"
                            : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
