import React, { useState } from 'react';
import { User } from 'lucide-react';

export default function ProfileModal({ user, connections, onClose, onProfileUpdate, onProfilePictureUpload, onRemoveConnection, uploadError }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await onProfileUpdate({ name, bio });
    setEditMode(false);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicture(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleProfilePictureSave = async () => {
    if (!profilePicture) {
      setError('Please select an image.');
      return;
    }
    setUploading(true);
    try {
      await onProfilePictureUpload(profilePicture);
      setShowPictureModal(false);
      setProfilePicture(null);
      setPreview(null);
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* Main Profile Modal */}
      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-2">
            <img src={user?.profilePicture || '/assets/logo.png'} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-500" />
            <button type="button" onClick={() => setShowPictureModal(true)} className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer border-2 border-white">
              ✎
            </button>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
          <p className="text-slate-400 text-sm mb-2">{user?.email}</p>
          <p className="text-slate-300 text-center mb-2">{user?.bio}</p>
          <button onClick={() => setEditMode(!editMode)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs">{editMode ? 'Cancel' : 'Edit Profile'}</button>
        </div>
        {editMode && (
          <form onSubmit={handleProfileUpdate} className="mb-6">
            <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-lg bg-slate-800 text-white" placeholder="Name" />
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-lg bg-slate-800 text-white" placeholder="Bio" />
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg">Save</button>
          </form>
        )}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Connections ({connections.length})</h3>
          <ul className="max-h-32 overflow-y-auto">
            {connections.map(conn => {
              const userObj = conn.user || conn;
              const displayName = userObj.name || userObj.username || userObj.email || 'User';
              const initial = displayName.charAt(0).toUpperCase();
              return (
                <li key={conn._id} className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {userObj.profilePicture ? (
                      <img src={userObj.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">{initial}</span>
                      </div>
                    )}
                    <span className="text-white">{displayName}</span>
                  </div>
                  <button onClick={() => onRemoveConnection(conn._id)} className="text-xs text-red-400 hover:underline">Remove</button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-6 border-t border-slate-700 pt-4">
          <h4 className="text-slate-400 text-xs mb-2">Settings</h4>
          <button className="w-full py-2 bg-slate-800 text-white rounded-lg mb-2">Change Password</button>
          <button className="w-full py-2 bg-slate-800 text-white rounded-lg">Logout</button>
        </div>
      </div>
      {/* Profile Picture Edit Modal */}
      {showPictureModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-sm shadow-2xl relative flex flex-col items-center">
            <button onClick={() => setShowPictureModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-xl font-bold text-white mb-4">Edit Profile Picture</h2>
            <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
              {preview || user?.profilePicture ? (
                <img src={preview || user?.profilePicture} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-blue-500" />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-blue-500">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleProfilePictureChange} disabled={uploading} />
            </div>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            {uploadError && <div className="text-red-400 mb-2">{uploadError}</div>}
            <div className="flex space-x-4 mt-2">
              <button onClick={handleProfilePictureSave} disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{uploading ? 'Uploading...' : 'Save'}</button>
              <button onClick={() => { setShowPictureModal(false); setProfilePicture(null); setPreview(null); setError(''); }} className="px-4 py-2 bg-slate-700 text-white rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 