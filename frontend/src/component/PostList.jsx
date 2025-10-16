import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/api/posts').then(res => setPosts(res.data));
  }, []);

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post._id} className="bg-gray-700 p-4 rounded-lg">
          <img src={`/${post.imageUrl}`} alt="Post" className="w-full h-64 object-cover rounded" />
          <p className="mt-2">{post.caption}</p>
        </div>
      ))}
    </div>
  );
};

export default PostList;
