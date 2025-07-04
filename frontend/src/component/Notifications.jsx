"use client"

import { useState } from "react"
import { X, Bell, Heart, MessageCircle, UserPlus, Trash2 } from "lucide-react"
import api from "../utils/api"

export default function Notifications({ onClose, notifications, loadNotifications }) {
  const [loading] = useState(false)
  const [filter, setFilter] = useState("all") // all, unread, likes, comments, connections

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`, {})
      loadNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`)
      loadNotifications()
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all", {})
      loadNotifications()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read
    if (filter === "likes") return notification.type === "like"
    if (filter === "comments") return notification.type === "comment"
    if (filter === "connections") return notification.type === "connection"
    return true
  })

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-400" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-400" />
      case "connection":
        return <UserPlus className="w-4 h-4 text-green-400" />
      default:
        return <Bell className="w-4 h-4 text-slate-400" />
    }
  }

  if (loading) {
    return (
      <div className="w-96 h-full bg-slate-900/30 backdrop-blur-2xl border-l border-slate-800/20 flex items-center justify-center">
        <div className="text-slate-400">Loading notifications...</div>
      </div>
    )
  }

  return (
    <div className="w-96 h-full bg-slate-900/30 backdrop-blur-2xl border-l border-slate-800/20 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-slate-800/20 rounded-lg p-1 mb-4">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "likes", label: "Likes" },
            { key: "comments", label: "Comments" },
            { key: "connections", label: "Connections" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-300 ${
                filter === tab.key
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mark All Read */}
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="w-full px-3 py-2 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 hover:text-white rounded-lg transition-all duration-300 text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
            <p className="text-slate-400 text-sm">
              {filter === "all"
                ? "You're all caught up! New notifications will appear here."
                : `No ${filter} notifications at the moment.`}
            </p>
          </div>
        ) : (
          <div className="notifications-list" style={{ overflowY: 'scroll', maxHeight: '60vh' }}>
            <div className="p-4 space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-slate-800/20 backdrop-blur-xl rounded-xl p-4 border transition-all duration-300 hover:bg-slate-800/30 ${
                    notification.read ? "border-slate-700/20" : "border-blue-500/20 bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{notification.title || "Notification"}</p>
                          <p className="text-slate-400 text-xs mt-1">
                            {notification.message || "You have a new notification"}
                          </p>
                          <p className="text-slate-500 text-xs mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()} •{" "}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="w-6 h-6 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-300 flex items-center justify-center"
                            >
                              <div className="w-2 h-2 bg-current rounded-full"></div>
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="w-6 h-6 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300 flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
