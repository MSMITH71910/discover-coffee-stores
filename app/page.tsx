import Card from '@/components/card.server';
import NearbyCoffeeStores from '@/components/nearby-coffee-stores.client';
import { fetchCoffeeStores } from '@/lib/coffee-stores';
import { CoffeeStoreType } from '@/types';

export default async function Home() {
  return (
    <div className="pb-16">
      <main className="mx-auto mt-10 max-w-6xl px-4">
        <NearbyCoffeeStores />
        {/* 
        Removed hardcoded "Delaware County Coffee Stores" section
        that was showing worldwide shops. Now the site only shows 
        GPS-based local results in the "Stores near me" section.
        This ensures users see only coffee shops in their actual 
        current city/county when driving around.
        */}
      </main>
    </div>
  );
}