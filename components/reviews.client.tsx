'use client';

import { useState } from 'react';

interface Review {
  id: string;
  text: string;
  author: string;
  date: string;
  rating: number;
}

interface ReviewsProps {
  coffeeStoreId: string;
}

export default function Reviews({ coffeeStoreId }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      text: 'Great coffee and friendly staff! The atmosphere is perfect for working.',
      author: 'Anonymous User',
      date: '2024-01-15',
      rating: 5
    },
    {
      id: '2', 
      text: 'Love their espresso! Always fresh and perfectly brewed.',
      author: 'Coffee Lover',
      date: '2024-01-14',
      rating: 4
    },
    {
      id: '3',
      text: 'Nice spot for a quick coffee break. Good service and clean environment.',
      author: 'Local Resident',
      date: '2024-01-13',
      rating: 4
    }
  ]);

  const [newReview, setNewReview] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.trim()) {
      alert('Please enter a review before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const review: Review = {
      id: Date.now().toString(),
      text: newReview.trim(),
      author: authorName.trim() || 'Anonymous User',
      date: new Date().toISOString().split('T')[0],
      rating: rating
    };

    setReviews(prev => [review, ...prev]);
    setNewReview('');
    setAuthorName('');
    setRating(5);
    setIsSubmitting(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>
        ⭐
      </span>
    ));
  };

  const renderRatingSelector = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300 transition-colors`}
      >
        ⭐
      </button>
    ));
  };

  return (
    <div className="border-t border-gray-600 pt-4">
      <div className="mb-4 flex items-center">
        <span className="text-xl">💬</span>
        <h3 className="pl-2 text-lg font-semibold text-white">Reviews ({reviews.length})</h3>
      </div>

      {/* Reviews List */}
      <div className="space-y-3 mb-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-sm font-medium text-white">{review.author}</span>
                <div className="ml-2 flex">
                  {renderStars(review.rating)}
                </div>
              </div>
              <span className="text-xs text-gray-500">{review.date}</span>
            </div>
            <p className="text-sm text-gray-300">{review.text}</p>
          </div>
        ))}
      </div>

      {/* Add Review Form */}
      <form onSubmit={handleSubmitReview} className="bg-gray-700 p-4 rounded-lg">
        <h4 className="text-white font-medium mb-3">Add Your Review</h4>
        
        {/* Rating Selector */}
        <div className="mb-3">
          <label className="text-sm text-gray-300 block mb-1">Your Rating:</label>
          <div className="flex items-center">
            {renderRatingSelector()}
            <span className="ml-2 text-sm text-gray-300">({rating} star{rating !== 1 ? 's' : ''})</span>
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-3">
          <label className="text-sm text-gray-300 block mb-1">Your Name (optional):</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Enter your name or leave blank for Anonymous"
            className="w-full p-2 rounded bg-gray-600 text-white placeholder-gray-400 text-sm"
            maxLength={50}
          />
        </div>

        {/* Review Text */}
        <div className="mb-3">
          <label className="text-sm text-gray-300 block mb-1">Your Review:</label>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Share your experience at this coffee shop..."
            className="w-full p-3 rounded bg-gray-600 text-white placeholder-gray-400 text-sm resize-none"
            rows={4}
            maxLength={500}
            required
          />
          <div className="text-xs text-gray-400 mt-1">
            {newReview.length}/500 characters
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting || !newReview.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}