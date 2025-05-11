import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch all posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/posts`);
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Fetch user's bookmarked posts
  const fetchBookmarkedPosts = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };
      
      // Get bookmarks directly from the API
      const res = await axios.get(`${API_BASE_URL}/api/users/bookmarks`, config);
      
      // The API returns an array of bookmark objects with post data populated
      const bookmarkedData = res.data.map(bookmark => bookmark.post);
      
      // Filter out any null or undefined values
      setBookmarkedPosts(bookmarkedData.filter(post => post !== null && post !== undefined));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookmarked posts:', err);
      setLoading(false);
    }
  }, [isAuthenticated, user, API_BASE_URL]);

  // Add bookmark
  const addBookmark = async (postId) => {
    if (!isAuthenticated) {
      alert('Please log in to bookmark posts');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      };

      await axios.post(`${API_BASE_URL}/api/users/bookmarks`, { postId }, config);
      
      // Update local state
      setBookmarkedPosts(prev => [...prev, { _id: postId }]);
    } catch (err) {
      console.error('Error adding bookmark:', err);
    }
  };

  // Remove bookmark
  const removeBookmark = async (postId) => {
    if (!isAuthenticated) return;

    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };

      await axios.delete(`${API_BASE_URL}/api/users/bookmarks/${postId}`, config);
      
      // Update local state
      setBookmarkedPosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  // Check if post is bookmarked
  const isBookmarked = (postId) => {
    if (!bookmarkedPosts || !postId) return false;
    return bookmarkedPosts.some(post => post && post._id === postId);
  };

  // Share post
  const sharePost = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this post: ${post.title}`,
          url: `${window.location.origin}/posts/${post._id}`
        });
        return 'shared';
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy to clipboard
      try {
        const url = `${window.location.origin}/posts/${post._id}`;
        await navigator.clipboard.writeText(url);
        return 'copied';
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  // Delete post
  const deletePost = async (postId) => {
    if (!isAuthenticated) return false;

    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };

      await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, config);
      
      // Update local state
      setPosts(prev => prev.filter(post => post._id !== postId));
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      return false;
    }
  };

  // Like/unlike post
  const likePost = async (postId) => {
    if (!isAuthenticated) {
      alert('Please log in to like posts');
      return null;
    }

    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };

      const res = await axios.put(`${API_BASE_URL}/api/posts/like/${postId}`, {}, config);
      return res.data;
    } catch (err) {
      console.error('Error liking post:', err);
      return null;
    }
  };

  // Add comment
  const addComment = async (postId, text) => {
    if (!isAuthenticated) {
      alert('Please log in to comment');
      return null;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/posts/comment/${postId}`,
        { text },
        config
      );
      return res.data;
    } catch (err) {
      console.error('Error adding comment:', err);
      return null;
    }
  };

  // Delete comment
  const deleteComment = async (postId, commentId) => {
    if (!isAuthenticated) return false;

    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };

      await axios.delete(`${API_BASE_URL}/api/posts/comment/${postId}/${commentId}`, config);
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      return false;
    }
  };

  // For backward compatibility - alias for fetchBookmarkedPosts
  const fetchBookmarks = fetchBookmarkedPosts;

  // Load initial data
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Load bookmarks when user changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarkedPosts();
    } else {
      setBookmarkedPosts([]);
    }
  }, [isAuthenticated, user, fetchBookmarkedPosts]);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        fetchPosts,
        bookmarkedPosts,
        fetchBookmarkedPosts,
        fetchBookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        sharePost,
        deletePost,
        likePost,
        addComment,
        deleteComment
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
