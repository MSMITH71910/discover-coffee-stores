'use client';

import { useState } from 'react';
import Image from 'next/image';

interface UpvoteLocalProps {
  initialVoting: number;
  coffeeStoreId: string;
}

export default function UpvoteLocal({ initialVoting, coffeeStoreId }: UpvoteLocalProps) {
  // Initialize with localStorage or default value
  const [voting, setVoting] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedVote = localStorage.getItem(`coffee_votes_${coffeeStoreId}`);
      return storedVote ? parseInt(storedVote) : initialVoting;
    }
    return initialVoting;
  });

  const [isVoting, setIsVoting] = useState(false);

  const handleUpvote = async () => {
    setIsVoting(true);
    
    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newVoting = voting + 1;
    setVoting(newVoting);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`coffee_votes_${coffeeStoreId}`, newVoting.toString());
    }
    
    setIsVoting(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Image
          src="/static/icons/star.svg"
          width="24"
          height="24"
          alt="star icon"
        />
        <p className="pl-2 text-yellow-400 font-semibold">{voting}</p>
        <span className="pl-2 text-sm text-gray-400">
          vote{voting !== 1 ? 's' : ''}
        </span>
      </div>

      <button
        onClick={handleUpvote}
        disabled={isVoting}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg min-w-[120px] transition-colors font-medium"
      >
        {isVoting ? (
          <div className="flex items-center justify-center">
            <Image
              src="/static/icons/loading-spinner.svg"
              width="20"
              height="20"
              alt="Loading"
              className="animate-spin mr-2"
            />
            Voting...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="mr-2">⭐</span>
            Up vote!
          </div>
        )}
      </button>
      
      <p className="mt-2 text-xs text-gray-500">
        Votes are stored locally in your browser
      </p>
    </div>
  );
}