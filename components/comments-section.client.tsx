'use client';

import React, { useState, useEffect } from 'react';

interface Comment {
  id: string;
  name: string;
  comment: string;
  rating: number;
  timestamp: string;
}

interface CommentsSectionProps {
  coffeeStoreId: string;
  initialComments: Comment[];
  initialUserRatings: number[];
}

export default function CommentsSection({ 
  coffeeStoreId, 
  initialComments, 
  initialUserRatings 
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [userRatings, setUserRatings] = useState<number[]>(initialUserRatings || []);
  
  // PERSISTENCE FIX: Load saved comments when component mounts
  useEffect(() => {
    const loadSavedComments = async () => {
      try {
        // Try to fetch comments directly from our working API
        const response = await fetch(`/api/coffee-stores?id=${coffeeStoreId}`, {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Parse comments if they exist
          if (data.comments && data.comments !== '[]') {
            try {
              const savedComments = JSON.parse(data.comments);
              if (Array.isArray(savedComments) && savedComments.length > 0) {
                setComments(savedComments);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
          
          // Parse user ratings if they exist
          if (data.userRatings && data.userRatings !== '[]') {
            try {
              const savedRatings = JSON.parse(data.userRatings);
              if (Array.isArray(savedRatings) && savedRatings.length > 0) {
                setUserRatings(savedRatings);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      } catch (error) {
        console.log('Could not load saved comments, using initial data');
        // If loading fails, keep using initialComments which is fine
      }
    };
    
    // Only load if we don't have initial comments
    if ((!initialComments || initialComments.length === 0) && coffeeStoreId) {
      loadSavedComments();
    }
  }, [coffeeStoreId, initialComments]);

  // Calculate average user rating
  const allRatings = [...userRatings, ...comments.map(c => c.rating)];
  const averageUserRating = allRatings.length > 0 
    ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)
    : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !userName.trim()) {
      setMessage('❌ Please fill in both name and comment');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const comment: Comment = {
        id: Date.now().toString(),
        name: userName.trim(),
        comment: newComment.trim(),
        rating: newRating,
        timestamp: new Date().toISOString()
      };

      const updatedComments = [...comments, comment];
      const updatedRatings = [...allRatings, newRating];

      // Save to Airtable via API
      const response = await fetch('/api/coffee-stores/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: coffeeStoreId,
          comments: updatedComments,
          userRatings: updatedRatings
        })
      });

      if (response.ok) {
        setComments(updatedComments);
        setUserRatings(updatedRatings);
        setNewComment('');
        setUserName('');
        setNewRating(5);
        setMessage('✅ Comment saved successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorText = await response.text();
        setMessage(`❌ Failed to save comment: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      setMessage('❌ Error saving comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reviews & Comments</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
          {allRatings.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span>{averageUserRating} average user rating</span>
            </span>
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Share your experience:</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= newRating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400`}
                >
                  ⭐
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                ({newRating} star{newRating !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* Comment Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Comment *
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tell us about your experience at this coffee shop..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Post Comment'}
          </button>

          {/* Status Message */}
          {message && (
            <div className={`text-sm font-medium ${
              message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to share your experience!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              {/* Comment Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800">{comment.name}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= comment.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                    <span className="ml-1 text-sm text-gray-600">({comment.rating}/5)</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.timestamp)}
                </span>
              </div>

              {/* Comment Text */}
              <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}