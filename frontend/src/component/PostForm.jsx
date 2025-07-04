import React, { useState } from 'react';
import axios from 'axios';

const PostForm = () => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('image', image);
    await axios.post('/api/posts', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input type="file" onChange={e => setImage(e.target.files[0])} required />
      <input
        type="text"
        placeholder="Caption"
        value={caption}
        onChange={e => setCaption(e.target.value)}
        className="block my-2"
      />
      <button type="submit" className="bg-blue-500 px-4 py-1 rounded">Post</button>
    </form>
  );
};

export default PostForm;
