import Link from 'next/link';
import Image from 'next/image';
import UpvoteAirtable from '@/components/upvote-airtable.client';
import CommentsSection from '@/components/comments-section.client';

async function getCoffeeStoreData(id: string, queryId: string) {
  // Always fetch fresh real data from SERP API first
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

  // If we have real data, use it immediately - but get user data from Airtable
  if (realCoffeeData) {
    // Try to get stored user data from Airtable
    let airtableData = { votes: 0, comments: '[]', userRatings: '[]' };
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const airtableResponse = await fetch(`${baseUrl}/api/coffee-stores?id=${id}`, {
        cache: 'no-store'
      });
      
      if (airtableResponse.ok) {
        const existingData = await airtableResponse.json();
        airtableData = {
          votes: existingData.votes || 0,
          comments: existingData.comments || '[]',
          userRatings: existingData.userRatings || '[]'
        };
      }
    } catch (error) {
      // Use default values if Airtable fails
    }
    
    // Return real data with user data from Airtable
    return {
      ...realCoffeeData,
      votes: airtableData.votes,
      voting: airtableData.votes,
      comments: airtableData.comments,
      userRatings: airtableData.userRatings
    };
  }

  // Only if SERP API completely fails, use fallback logic
  const fallbackData = {
    id,
    name: `Coffee Shop ${queryId}`,
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
    // Check if record exists in Airtable
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const airtableResponse = await fetch(`${baseUrl}/api/coffee-stores?id=${id}`, {
      cache: 'no-store'
    });
    
    if (airtableResponse.ok) {
      const existingData = await airtableResponse.json();
      return {
        ...existingData,
        voting: existingData.votes || 0
      };
    }
    
    // If record doesn't exist, create it
    if (airtableResponse.status === 404) {
      const createResponse = await fetch(`${baseUrl}/api/coffee-stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fallbackData),
      });

      if (createResponse.ok) {
        const createdData = await createResponse.json();
        return {
          ...createdData,
          voting: createdData.votes || 0
        };
      }
    }
  } catch (error) {
    // Handle Airtable errors gracefully
  }

  // Final fallback 
  return {
    ...fallbackData,
    voting: 0
  };
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
              {/* Image Section */}
              <div className="lg:col-span-1">
                <Image
                  src={coffeeStore.imgUrl}
                  width={400}
                  height={300}
                  alt={coffeeStore.name}
                  className="rounded-lg w-full h-64 object-cover shadow-md"
                />
              </div>
              
              {/* Content Section */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold mb-3">{coffeeStore.name}</h1>
                  
                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className={`text-xl ${star <= Math.floor(coffeeStore.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ⭐
                        </span>
                      ))}
                      <span className="ml-2 text-lg font-semibold">{coffeeStore.rating}</span>
                    </div>
                    <span className="text-gray-600">({coffeeStore.totalReviews} reviews)</span>
                    {coffeeStore.priceRange && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        ${coffeeStore.priceRange}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {coffeeStore.description}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-start">
                      <span className="text-gray-600 text-sm w-20 flex-shrink-0">📍 Address:</span>
                      <span className="text-gray-800 text-sm font-medium">{coffeeStore.address}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-600 text-sm w-20 flex-shrink-0">🏘️ Area:</span>
                      <span className="text-gray-800 text-sm">{coffeeStore.neighbourhood}</span>
                    </div>
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

                  {/* Test Section */}
                  <div className="border-4 border-red-500 bg-red-100 p-8 mb-6">
                    <h1 className="text-4xl font-bold text-red-900">🚨 TEST COMMENTS SECTION</h1>
                    <p className="text-xl text-red-800 mt-4">THIS SHOULD BE VERY VISIBLE!</p>
                    <div className="bg-white p-4 mt-4 border-2 border-red-300">
                      <p>Store ID: {coffeeStore.id}</p>
                      <p>Store Name: {coffeeStore.name}</p>
                    </div>
                  </div>

                  {/* Voting Section */}
                  <div className="border-t pt-6 mb-6">
                    <UpvoteAirtable 
                      initialVoting={coffeeStore.voting || 0}
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
          </div>
          
          {/* Comments Section - Simple Test */}
          <div className="mt-8 border-t pt-8 bg-red-100 p-6 rounded-lg">
            <h2 className="text-3xl font-bold text-red-900 mb-6">🔴 COMMENTS TEST SECTION</h2>
            <p className="text-lg text-red-700">If you can see this, the section renders properly!</p>
            <div className="bg-white p-4 rounded mt-4">
              <p><strong>Coffee Store ID:</strong> {coffeeStore.id}</p>
              <p><strong>Store Name:</strong> {coffeeStore.name}</p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    
    console.error('Coffee store page error:', error);
    
    return (
      <div className="min-h-screen bg-red-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Coffee Shop Not Available</h1>
            <p className="text-gray-700 mb-4">We&apos;re having trouble loading this coffee shop right now.</p>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <p className="text-sm font-bold">Error Details:</p>
              <p className="text-xs">{error?.message || 'Unknown error'}</p>
            </div>
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