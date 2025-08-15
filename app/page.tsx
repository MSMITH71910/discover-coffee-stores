import Card from '@/components/card.server';
import NearbyCoffeeStores from '@/components/nearby-coffee-stores.client';
import { fetchCoffeeStores } from '@/lib/coffee-stores';
import { CoffeeStoreType } from '@/types';

async function getData() {
  //mapbox api
  const Delaware_County_LONG_LAT = '39.9078,-75.4348';
  return await fetchCoffeeStores(Delaware_County_LONG_LAT, 6);
}

export default async function Home() {
  const coffeeStores = (await getData()) || [];

  return (
    <div className="pb-16">
      <main className="mx-auto mt-10 max-w-6xl px-4">
        <NearbyCoffeeStores />
        <div className="mt-20">
          <h2 className="mt-8 pb-8 text-4xl font-bold text-white">
            Delaware County Coffee Stores
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {coffeeStores.map((coffeeStore: CoffeeStoreType, idx: number) => (
              <Card
                key={`${coffeeStore.name}-${coffeeStore.id}`}
                name={coffeeStore.name}
                imgUrl={coffeeStore.imgUrl}
                address={coffeeStore.address}
                href={`/coffee-store/${coffeeStore.id}?id=${idx}`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}