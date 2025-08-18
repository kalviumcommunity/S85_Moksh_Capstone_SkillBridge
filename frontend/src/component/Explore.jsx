"use client"

import { useState, useEffect } from "react"
import { X, Search, TrendingUp, Hash, Users, Eye } from "lucide-react"
import api from "../utils/api"

export default function Explore({ onClose }) {
  const [activeTab, setActiveTab] = useState("trending") // trending, hashtags, people
  const [trendingPosts, setTrendingPosts] = useState([])
  const [trendingHashtags, setTrendingHashtags] = useState([])
  const [suggestedPeople, setSuggestedPeople] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExploreData()
  }, [activeTab])

  const loadExploreData = async () => {
    setLoading(true)
    try {
      if (activeTab === "trending") {
        const response = await api.get("/api/posts/trending")
        setTrendingPosts(response.data || [])
      } else if (activeTab === "hashtags") {
        const response = await api.get("/api/hashtags/trending")
        setTrendingHashtags(response.data || [])
      } else if (activeTab === "people") {
        const response = await api.get("/api/users/suggested")
        setSuggestedPeople(response.data || [])
      }
    } catch (error) {
      console.error("Error loading explore data:", error)
    } finally {
      setLoading(false)
    }
  }

  const followHashtag = async (hashtag) => {
    try {
      await api.post("/api/hashtags/follow", { hashtag })
      loadExploreData()
    } catch (error) {
      console.error("Error following hashtag:", error)
    }
  }

  const followUser = async (userId) => {
    try {
      await api.post("/api/users/follow", { userId })
      loadExploreData()
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  const getFilteredData = () => {
    let data = []
    switch (activeTab) {
      case "trending":
        data = trendingPosts
        break
      case "hashtags":
        data = trendingHashtags
        break
      case "people":
        data = suggestedPeople
        break
      default:
        data = []
    }

    if (!searchTerm) return data

    return data.filter((item) => {
      if (activeTab === "trending") {
        return (
          item.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      } else if (activeTab === "hashtags") {
        return item.tag?.toLowerCase().includes(searchTerm.toLowerCase())
      } else if (activeTab === "people") {
        return (
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.username?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      return false
    })
  }

  if (loading) {
    return (
      <div className="w-96 h-full bg-slate-900/30 backdrop-blur-2xl border-l border-slate-800/20 flex items-center justify-center">
        <div className="text-slate-400">Loading explore content...</div>
      </div>
    )
  }

  return (
    <div className="w-96 h-full bg-slate-900/30 backdrop-blur-2xl border-l border-slate-800/20 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Explore</h2>
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
            onClick={() => setActiveTab("trending")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              activeTab === "trending"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab("hashtags")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              activeTab === "hashtags"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Hashtags
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              activeTab === "people"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            People
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
        {getFilteredData().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
              {activeTab === "trending" && <TrendingUp className="w-8 h-8 text-slate-400" />}
              {activeTab === "hashtags" && <Hash className="w-8 h-8 text-slate-400" />}
              {activeTab === "people" && <Users className="w-8 h-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {activeTab === "trending" && "No trending posts"}
              {activeTab === "hashtags" && "No trending hashtags"}
              {activeTab === "people" && "No suggested people"}
            </h3>
            <p className="text-slate-400 text-sm">
              {activeTab === "trending" && "Check back later for trending content"}
              {activeTab === "hashtags" && "Popular hashtags will appear here"}
              {activeTab === "people" && "We'll suggest people you might know"}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {getFilteredData().map((item, index) => (
              <div
                key={item._id || index}
                className="bg-slate-800/20 backdrop-blur-xl rounded-xl p-4 border border-slate-700/20 hover:bg-slate-800/30 transition-all duration-300"
              >
                {activeTab === "trending" && (
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.imageUrl?.startsWith("http") ? item.imageUrl : `${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                      alt="Post"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium line-clamp-2">{item.caption || "No caption"}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-slate-400 text-xs flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {item.views || 0} views
                        </span>
                        <span className="text-slate-400 text-xs">{item.likes || 0} likes</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "hashtags" && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">#{item.tag}</p>
                        <p className="text-slate-400 text-xs">{item.count || 0} posts</p>
                      </div>
                    </div>
                    <button
                      onClick={() => followHashtag(item.tag)}
                      disabled={item.following}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                        item.following
                          ? "bg-slate-600/20 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      }`}
                    >
                      {item.following ? "Following" : "Follow"}
                    </button>
                  </div>
                )}

                {activeTab === "people" && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {item.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{item.name || "Unknown User"}</p>
                        <p className="text-slate-400 text-xs">@{item.username || "username"}</p>
                        <p className="text-slate-500 text-xs">{item.mutualConnections || 0} mutual connections</p>
                      </div>
                    </div>
                    <button
                      onClick={() => followUser(item._id)}
                      disabled={item.following}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                        item.following
                          ? "bg-slate-600/20 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      }`}
                    >
                      {item.following ? "Following" : "Follow"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
