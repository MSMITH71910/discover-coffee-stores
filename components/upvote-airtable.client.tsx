'use client';

import { useState } from 'react';
import Image from 'next/image';

interface UpvoteAirtableProps {
  initialVoting: number;
  coffeeStoreId: string;
  coffeeStoreName: string;
  coffeeStoreAddress?: string;
  coffeeStoreNeighbourhood?: string;
  coffeeStoreImgUrl?: string;
}

export default function UpvoteAirtable({ 
  initialVoting, 
  coffeeStoreId, 
  coffeeStoreName,
  coffeeStoreAddress = '',
  coffeeStoreNeighbourhood = '',
  coffeeStoreImgUrl = ''
}: UpvoteAirtableProps) {
  const [voting, setVoting] = useState(initialVoting);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpvote = async () => {
    setIsVoting(true);
    setError('');
    setSuccess(false);
    
    try {
      // First, ensure the coffee store exists in Airtable
      await fetch('/api/coffee-stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: coffeeStoreId,
          name: coffeeStoreName,
          address: coffeeStoreAddress,
          neighbourhood: coffeeStoreNeighbourhood,
          imgUrl: coffeeStoreImgUrl
        }),
      });

      // Now vote for the coffee store
      const voteResponse = await fetch('/api/coffee-stores/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: coffeeStoreId,
        }),
      });

      if (!voteResponse.ok) {
        throw new Error('Failed to vote');
      }

      const updatedStore = await voteResponse.json();
      setVoting(updatedStore.votes);
      setSuccess(true);

      // Also store in localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem(`coffee_votes_${coffeeStoreId}`, updatedStore.votes.toString());
      }
      
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to save vote. Please try again.');
      
      // Fallback to localStorage if Airtable fails
      const newVoting = voting + 1;
      setVoting(newVoting);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`coffee_votes_${coffeeStoreId}`, newVoting.toString());
      }
    } finally {
      setIsVoting(false);
    }
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
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Voting...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="mr-2">⭐</span>
            Up vote!
          </div>
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-2 text-xs text-green-600">
          ✅ Vote saved to Airtable database
        </p>
      )}
    </div>
  );
}