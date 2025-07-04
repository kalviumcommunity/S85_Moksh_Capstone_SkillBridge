"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, UserPlus, User } from "lucide-react"
import axios from "axios"

export default function SearchModal({ isOpen, onClose, onUserSelect }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  const searchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSearchResults(response.data || [])
    } catch (error) {
      console.error("Error searching users:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (user) => {
    // Add to recent searches
    const updatedRecent = [user, ...recentSearches.filter((u) => u._id !== user._id)].slice(0, 5)
    setRecentSearches(updatedRecent)

    if (onUserSelect) {
      onUserSelect(user)
    }
    onClose()
  }

  const sendConnectionRequest = async (userId, event) => {
    event.stopPropagation()
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "/api/connection-requests",
        { targetUserId: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      alert("Connection request sent!")
      // Update the user in search results to show request sent
      setSearchResults((prev) => prev.map((user) => (user._id === userId ? { ...user, requestSent: true } : user)))
    } catch (error) {
      console.error("Error sending connection request:", error)
      alert("Failed to send connection request")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 pt-20">
      <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/20 rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Search Users</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-400">Searching...</div>
            </div>
          ) : searchTerm.trim() ? (
            searchResults.length > 0 ? (
              <div className="p-4 space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center justify-between p-4 bg-slate-700/20 hover:bg-slate-700/40 rounded-xl transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                          {user.name}
                        </h4>
                        <p className="text-slate-400 text-sm">@{user.username}</p>
                        {user.email && <p className="text-slate-500 text-xs">{user.email}</p>}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => sendConnectionRequest(user._id, e)}
                        disabled={user.requestSent}
                        className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center ${
                          user.requestSent
                            ? "bg-slate-600/20 text-slate-500 cursor-not-allowed"
                            : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
                        }`}
                      >
                        <UserPlus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <User className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-slate-400">No users found</p>
                <p className="text-slate-500 text-sm">Try a different search term</p>
              </div>
            )
          ) : (
            <div className="p-4">
              {recentSearches.length > 0 ? (
                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Recent Searches</h4>
                  <div className="space-y-2">
                    {recentSearches.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleUserClick(user)}
                        className="flex items-center space-x-3 p-3 bg-slate-700/20 hover:bg-slate-700/40 rounded-xl transition-all duration-300 cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white text-sm">{user.name}</h4>
                          <p className="text-slate-400 text-xs">@{user.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Search className="w-12 h-12 text-slate-400 mb-3" />
                  <p className="text-slate-400">Start typing to search for users</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
