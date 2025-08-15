import React from 'react';
import Link from 'next/link';
import { fetchCoffeeStore, fetchCoffeeStores } from '@/lib/coffee-stores';
import Image from 'next/image';
import { CoffeeStoreType } from '@/types';

// Import components with error boundaries
let UpvoteLocal: React.ComponentType<any>;
let Reviews: React.ComponentType<any>;

try {
  UpvoteLocal = require('@/components/upvote-local.client').default;
} catch {
  UpvoteLocal = () => <div className="text-gray-300">Rating component not available</div>;
}

try {
  Reviews = require('@/components/reviews.client').default;
} catch {
  Reviews = () => <div className="text-gray-300">Reviews component not available</div>;
}

async function getData(id: string, queryId: string) {
  try {
    const coffeeStoreFromMapbox = await fetchCoffeeStore(id, queryId);
    
    // Ensure we always have a valid object structure
    if (coffeeStoreFromMapbox && typeof coffeeStoreFromMapbox === 'object' && Object.keys(coffeeStoreFromMapbox).length > 0) {
      return {
        id: coffeeStoreFromMapbox.id || id,
        name: coffeeStoreFromMapbox.name || 'Coffee Store',
        address: coffeeStoreFromMapbox.address || '',
        imgUrl: coffeeStoreFromMapbox.imgUrl || '',
        voting: 0, // Default voting count
      };
    }
    
    // Return fallback data for the specific ID
    return {
      id,
      name: 'Coffee Store',
      address: 'Address not available',
      imgUrl: '',
      voting: 0,
    };
  } catch (error) {
    console.error('Error in getData:', error);
    return {
      id,
      name: 'Coffee Store',
      address: 'Address not available',
      imgUrl: '',
      voting: 0,
    };
  }
}

export async function generateStaticParams() {
  try {
    const TORONTO_LONG_LAT = '-79.3789680885594%2C43.653833032607096';
    const coffeeStores = await fetchCoffeeStores(TORONTO_LONG_LAT, 6);

    return coffeeStores.map((coffeeStore: CoffeeStoreType) => ({
      id: coffeeStore.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array if fetch fails
    return [];
  }
}

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ id: string }>;
}) {
  try {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { id } = params;
    const { id: queryId } = searchParams;

    const coffeeStore = await getData(id, queryId || '0');

    const { name = 'Coffee Store', address = '', imgUrl = '', voting = 0 } = coffeeStore;

    return (
      <div className="pb-16">
        <div className="m-auto grid max-w-full px-12 py-12 lg:max-w-6xl lg:grid-cols-2 lg:gap-4">
          <div className="">
            <div className="mb-2 mt-24 text-lg font-bold">
              <Link href="/">← Back to home</Link>
            </div>
            <div className="my-4">
              <h1 className="text-4xl">{name}</h1>
            </div>
            <Image
              src={
                imgUrl ||
                'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
              }
              width={740}
              height={360}
              className="max-h-[420px] min-w-full max-w-full rounded-lg border-2 sepia lg:max-w-[470px] "
              alt={'Coffee Store Image'}
            />
          </div>

          <div className={`glass mt-12 flex-col rounded-lg p-4 lg:mt-48`}>
            {/* Address Section */}
            {address && (
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <Image
                    src="/static/icons/places.svg"
                    width="24"
                    height="24"
                    alt="places icon"
                  />
                  <h3 className="pl-2 text-lg font-semibold text-white">Address</h3>
                </div>
                <p className="pl-8 text-gray-300 mb-3">{address}</p>
                
                {/* Directions Buttons */}
                <div className="pl-8 flex gap-2 flex-wrap">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    📍 Google Maps
                  </a>
                  <a
                    href={`https://maps.apple.com/?q=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    🗺️ Apple Maps
                  </a>
                  <a
                    href={`https://www.waze.com/ul?q=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    🚗 Waze
                  </a>
                </div>
              </div>
            )}

            {/* Coffee Store Info */}
            {!address && (
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <Image
                    src="/static/icons/places.svg"
                    width="24"
                    height="24"
                    alt="places icon"
                  />
                  <h3 className="pl-2 text-lg font-semibold text-white">Information</h3>
                </div>
                <p className="pl-8 text-gray-300 mb-3">Coffee store information is currently unavailable.</p>
              </div>
            )}

            {/* Voting Section */}
            <div className="mb-6 border-t border-gray-600 pt-4">
              <div className="mb-2 flex items-center">
                <Image
                  src="/static/icons/star.svg"
                  width="24"
                  height="24"
                  alt="star icon"
                />
                <h3 className="pl-2 text-lg font-semibold text-white">Rating</h3>
              </div>
              <UpvoteLocal initialVoting={voting} coffeeStoreId={id} />
            </div>

            {/* Reviews Section */}
            <Reviews coffeeStoreId={id} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering coffee store page:', error);
    
    // Return a safe fallback page
    return (
      <div className="pb-16">
        <div className="m-auto max-w-full px-12 py-12">
          <div className="mb-2 mt-24 text-lg font-bold">
            <Link href="/">← Back to home</Link>
          </div>
          <div className="my-4">
            <h1 className="text-4xl">Coffee Store</h1>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">We're having trouble loading this coffee store's information right now. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
}