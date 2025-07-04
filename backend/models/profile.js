// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email:      { type: String, required: true, unique: true },
  name:       { type: String },
  avatarUrl:  { type: String },           // profile picture
  bio:        { type: String },
  // other fields…
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
