import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UpvoteAirtable from '@/components/upvote-airtable.client';
import CommentsSection from '@/components/comments-section.client';

async function getCoffeeStoreData(id: string, queryId: string) {
  let realCoffeeData = null;
  
  try {
    const Delaware_County_LONG_LAT = '39.9078,-75.4348';
    const [lat, lng] = Delaware_County_LONG_LAT.split(',');
    const serpApiUrl = `https://serpapi.com/search.json?engine=google_maps&q=coffee+shop&ll=@${lat},${lng},15z&type=search&api_key=${process.env.SERP_API_KEY}`;
    
    const response = await fetch(serpApiUrl);
    const data = await response.json();
    const localResults = data.local_results || [];
    
    const qIdx = parseInt(queryId) || 0;
    if (localResults[qIdx]) {
      const result = localResults[qIdx];
      realCoffeeData = {
        id: result.place_id || id,
        name: result.title || result.name || `Coffee Shop ${queryId}`,
        address: result.address || 'Address not available',
        neighbourhood: result.address?.split(',').slice(-2).join(',').trim() || 'Delaware County, PA',
        votes: 0,
        imgUrl: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
        description: result.description || 'A local coffee shop serving quality beverages.',
        rating: result.rating || 0,
        totalReviews: result.reviews || 0,
        priceRange: result.price || '',
        offerings: JSON.stringify(result.extensions?.find((ext: any) => ext.offerings)?.offerings || ['Coffee']),
        comments: JSON.stringify([]),
        userRatings: JSON.stringify([])
      };
    }
  } catch (error) {
    // Silently handle API errors
  }
  
  const mockData = realCoffeeData || {
    id,
    name: `Coffee Store ${queryId}`,
    address: 'Address not available',
    neighbourhood: 'Delaware County, PA',
    votes: 0,
    imgUrl: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    description: 'A local coffee shop.',
    rating: 0,
    totalReviews: 0,
    priceRange: '',
    offerings: JSON.stringify(['Coffee']),
    comments: JSON.stringify([]),
    userRatings: JSON.stringify([])
  };

  try {
    // First check if we have it in Airtable
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const airtableResponse = await fetch(`${baseUrl}/api/coffee-stores?id=${id}`, {
      cache: 'no-store'
    });
    
    if (airtableResponse.ok) {
      const data = await airtableResponse.json();
      return {
        id: data.id,
        name: data.name,
        address: data.address || mockData.address,
        neighbourhood: data.neighbourhood || mockData.neighbourhood,
        votes: data.votes || 0,
        imgUrl: data.imgUrl || mockData.imgUrl,
        description: data.description || mockData.description,
        rating: data.rating || mockData.rating,
        totalReviews: data.totalReviews || mockData.totalReviews,
        priceRange: data.priceRange || mockData.priceRange,
        offerings: data.offerings || mockData.offerings,
        comments: data.comments || mockData.comments,
        userRatings: data.userRatings || mockData.userRatings
      };
    }
    
    // If record doesn't exist, create it in Airtable
    if (airtableResponse.status === 404) {
      
      const createResponse = await fetch(`${baseUrl}/api/coffee-stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
        cache: 'no-store'
      });
      
      if (createResponse.ok) {
        const createdData = await createResponse.json();
        return {
          id: createdData.id,
          name: createdData.name,
          address: createdData.address || mockData.address,
          neighbourhood: createdData.neighbourhood || mockData.neighbourhood,
          votes: createdData.votes || 0,
          imgUrl: createdData.imgUrl || mockData.imgUrl,
          description: createdData.description || mockData.description,
          rating: createdData.rating || mockData.rating,
          totalReviews: createdData.totalReviews || mockData.totalReviews,
          priceRange: createdData.priceRange || mockData.priceRange,
          offerings: createdData.offerings || mockData.offerings,
          comments: createdData.comments || mockData.comments,
          userRatings: createdData.userRatings || mockData.userRatings
        };
      }
    }
  } catch (error) {
    // Handle Airtable errors gracefully
  }

  // Final fallback to mock data
  return mockData;
}

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { id } = params;
    // Handle both 'id' and 'idx' query parameters
    const queryId = (searchParams.id || searchParams.idx || '0') as string;

    const coffeeStore = await getCoffeeStoreData(id, queryId);

    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to home
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Image */}
              <div className="lg:col-span-1">
                <Image
                  src={coffeeStore.imgUrl}
                  width={400}
                  height={300}
                  alt={coffeeStore.name}
                  className="rounded-lg w-full h-64 object-cover shadow-md"
                />
              </div>
              
              {/* Main Info */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold mb-3">{coffeeStore.name}</h1>
                  
                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xl ${
                            star <= Math.floor(coffeeStore.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                      <span className="ml-2 text-lg font-semibold">
                        {coffeeStore.rating || 'No rating'}
                      </span>
                    </div>
                    {coffeeStore.totalReviews > 0 && (
                      <span className="text-gray-600">
                        ({coffeeStore.totalReviews} reviews)
                      </span>
                    )}
                    {coffeeStore.priceRange && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {coffeeStore.priceRange}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {coffeeStore.description && (
                    <div className="mb-6">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {coffeeStore.description}
                      </p>
                    </div>
                  )}

                  {/* Address */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-start">
                      <span className="text-gray-600 text-sm w-20 flex-shrink-0">📍 Address:</span>
                      <span className="text-gray-800 text-sm font-medium">{coffeeStore.address}</span>
                    </div>
                    
                    {coffeeStore.neighbourhood && (
                      <div className="flex items-start">
                        <span className="text-gray-600 text-sm w-20 flex-shrink-0">🏘️ Area:</span>
                        <span className="text-gray-800 text-sm">{coffeeStore.neighbourhood}</span>
                      </div>
                    )}
                  </div>

                  {/* Offerings */}
                  {coffeeStore.offerings && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">What they offer:</h3>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(coffeeStore.offerings).map((offering: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {offering}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voting */}
                  <div className="border-t pt-6 mb-6">
                    <UpvoteAirtable
                      initialVoting={coffeeStore.votes}
                      coffeeStoreId={coffeeStore.id}
                      coffeeStoreName={coffeeStore.name}
                      coffeeStoreAddress={coffeeStore.address}
                      coffeeStoreNeighbourhood={coffeeStore.neighbourhood}
                      coffeeStoreImgUrl={coffeeStore.imgUrl}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments & User Ratings Section */}
            <div className="mt-8 border-t pt-6">
              <CommentsSection 
                coffeeStoreId={coffeeStore.id}
                initialComments={coffeeStore.comments ? JSON.parse(coffeeStore.comments) : []}
                initialUserRatings={coffeeStore.userRatings ? JSON.parse(coffeeStore.userRatings) : []}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    
    return (
      <div className="min-h-screen bg-red-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Coffee Shop Not Available</h1>
            <p className="text-gray-700 mb-4">We&apos;re having trouble loading this coffee shop right now.</p>
            <div className="mt-4">
              <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Remove generateStaticParams to make this a fully dynamic route
// This will prevent build-time pre-generation and allow on-demand rendering