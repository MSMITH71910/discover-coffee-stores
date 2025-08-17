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

  const handleOnClick = () => {
    handleTrackLocation();
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
            (Coordinates: Longitude, Latitude format)
          </p>
        </div>
      )}

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