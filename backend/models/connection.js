const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🧠 Index to avoid duplicate connection in same direction (A ➝ B)
// Note: MongoDB won't catch B ➝ A — handle this in controller with $or query.
connectionSchema.index({ user1: 1, user2: 1 }, { unique: true });

// ✅ Virtual field to get the other user (requires setting _currentUserId)
connectionSchema.virtual("otherUser").get(function () {
  if (!this._currentUserId) return null;
  return this.user1.equals(this._currentUserId) ? this.user2 : this.user1;
});

// Utility method to set current user for virtual field
connectionSchema.methods.setCurrentUser = function (userId) {
  this._currentUserId = userId;
};

module.exports = mongoose.model("Connection", connectionSchema);
