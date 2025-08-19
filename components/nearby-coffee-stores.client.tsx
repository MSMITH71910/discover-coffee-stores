'use client';

import React, { useEffect, useState } from 'react';
import Banner from './banner.client';
import useTrackLocation from '@/hooks/use-track-location';
import CardClient from './card.client';
import { CoffeeStoreType } from '@/types';

export default function NearbyCoffeeStores() {
  const { handleTrackLocation, isFindingLocation, longLat, locationErrorMsg } =
    useTrackLocation();

  const [coffeeStores, setCoffeeStores] = useState<CoffeeStoreType[]>([]);
  const [manualLocation, setManualLocation] = useState('');

  const handleOnClick = () => {
    handleTrackLocation();
  };

  const handleManualLocation = async () => {
    if (manualLocation) {
      try {
        console.log('🔍 Fetching coffee stores for manual coordinates:', manualLocation);
        const limit = 10;
        const response = await fetch(
          `/api/getCoffeeStoresByLocation?longLat=${manualLocation}&limit=${limit}`
        );
        const coffeeStores = await response.json();
        console.log('☕ Found coffee stores:', coffeeStores.length, 'stores');
        setCoffeeStores(coffeeStores);
      } catch (error) {
        console.error('❌ Error fetching coffee stores:', error);
      }
    }
  };

  useEffect(() => {
    async function coffeeStoresByLocation() {
      if (longLat) {
        try {
          console.log('🔍 Fetching coffee stores for coordinates:', longLat);
          const limit = 10;
          const apiUrl = `/api/getCoffeeStoresByLocation?longLat=${longLat}&limit=${limit}`;
          console.log('📡 API URL:', apiUrl);
          
          const response = await fetch(apiUrl);
          const coffeeStores = await response.json();
          
          console.log('☕ Found coffee stores:', coffeeStores.length, 'stores');
          console.log('📍 First store location:', coffeeStores[0]?.address);
          
          setCoffeeStores(coffeeStores);
        } catch (error) {
          console.error('❌ Error fetching coffee stores:', error);
        }
      }
    }

    coffeeStoresByLocation();
  }, [longLat]);

  return (
    <div>
      <Banner
        handleOnClick={handleOnClick}
        buttonText={isFindingLocation ? 'Locating...' : 'View stores nearby'}
      />
      {locationErrorMsg && <p className="text-red-400 mt-4">Location Error: {locationErrorMsg}</p>}
      
      {longLat && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-green-400 text-sm">
            📍 <strong>Your detected location:</strong> {longLat}
          </p>
          <p className="text-gray-300 text-xs mt-1">
            (Coordinates: Longitude, Latitude format) - GPS shows you ~15mi from your actual location
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-900 rounded-lg">
        <p className="text-blue-300 text-sm mb-2">🧪 <strong>Test different location:</strong></p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Enter coordinates (lon,lat)"
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded flex-1 min-w-[200px]"
          />
          <button
            onClick={handleManualLocation}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Search Here
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          <p>🇺🇸 US: <span 
            className="cursor-pointer text-orange-400 hover:underline font-semibold" 
            onClick={() => setManualLocation('-75.4037,39.9876')}
          >-75.4037,39.9876 (Newtown Square, PA)</span> | <span 
            className="cursor-pointer text-blue-400 hover:underline" 
            onClick={() => setManualLocation('-74.0060,40.7128')}
          >-74.0060,40.7128 (NYC)</span> | <span 
            className="cursor-pointer text-blue-400 hover:underline"
            onClick={() => setManualLocation('-122.4194,37.7749')}
          >-122.4194,37.7749 (SF)</span></p>
          <p className="mt-1">🌍 Global: <span 
            className="cursor-pointer text-green-400 hover:underline" 
            onClick={() => setManualLocation('-79.3832,43.6532')}
          >-79.3832,43.6532 (Toronto, CA)</span> | <span 
            className="cursor-pointer text-purple-400 hover:underline"
            onClick={() => setManualLocation('-99.1332,19.4326')}
          >-99.1332,19.4326 (Mexico City, MX)</span> | <span 
            className="cursor-pointer text-yellow-400 hover:underline"
            onClick={() => setManualLocation('2.3522,48.8566')}
          >2.3522,48.8566 (Paris, FR)</span></p>
        </div>
      </div>

      {coffeeStores.length > 0 && (
        <div className="mt-20">
          <h2 className="mt-8 pb-8 text-4xl font-bold text-white">
            Stores near me
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {coffeeStores.map((coffeeStore: CoffeeStoreType, idx: number) => (
              <CardClient
                key={`${coffeeStore.name}-${coffeeStore.id}`}
                name={coffeeStore.name}
                imgUrl={coffeeStore.imgUrl}
                address={coffeeStore.address}
                href={`/coffee-store/${coffeeStore.id}?idx=${idx}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}