import { MapboxType } from '@/types';

const getListOfCoffeeStorePhotos = async () => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos/?client_id=${process.env.UNSPLASH_ACCESS_KEY}&query="coffee shop"&page=1&perPage=10&orientation=landscape`
    );
    const photos = await response.json();
    const results = photos?.results || [];
    return results?.map((result: { urls: any }) => result.urls['small']);
  } catch (error) {
    console.error('Error retrieving a photo', error);
  }
};

const transformCoffeeData = (
  idx: number,
  result: MapboxType,
  photos: Array<string>
) => {
  return {
    id: result.id,
    address: result.properties?.address || '',
    name: result.text,
    imgUrl: photos.length > 0 ? photos[idx] : '',
  };
};

export const fetchCoffeeStores = async (longLat: string, limit: number) => {
  try {
    // Get photos from Unsplash
    const photos = await getListOfCoffeeStorePhotos();
    
    // Parse coordinates
    const [lat, lng] = longLat.split(',');
    
    // Use SERP API to find real coffee shops nearby
    const serpApiUrl = `https://serpapi.com/search.json?engine=google_maps&q=coffee+shop&ll=@${lat},${lng},15z&type=search&api_key=${process.env.SERP_API_KEY}`;
    
    console.log('Searching for coffee shops with SERP API...');
    const response = await fetch(serpApiUrl);
    const data = await response.json();
    
    // Extract local results
    const localResults = data.local_results || [];
    console.log(`Found ${localResults.length} coffee shops via SERP API`);
    
    // Transform SERP API results to our format
    const coffeeShops = localResults.slice(0, limit).map((result: any, idx: number) => ({
      id: result.place_id || `coffee-shop-${idx}`,
      text: result.title || result.name || 'Coffee Shop',
      properties: {
        address: result.address || 'Address not available'
      }
    }));
    
    return coffeeShops.map((result: any, idx: number) =>
      transformCoffeeData(idx, result, photos)
    );
  } catch (error) {
    console.error('Error while fetching coffee stores:', error);
    // Fallback to some known Delaware County coffee shops
    const fallbackShops = [
      {
        id: 'starbucks-media-fallback',
        text: 'Starbucks Media',
        properties: { address: 'Orange St, Media, PA' }
      },
      {
        id: 'dunkin-broomall-fallback',
        text: 'Dunkin\' Broomall', 
        properties: { address: 'W Chester Pike, Broomall, PA' }
      }
    ];
    
    const photos = await getListOfCoffeeStorePhotos();
    return fallbackShops.slice(0, limit).map((result: any, idx: number) =>
      transformCoffeeData(idx, result, photos)
    );
  }
};

export const fetchCoffeeStore = async (id: string, queryId: string) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${id}.json?proximity=ip&access_token=${process.env.MAPBOX_API}`
    );
    const data = await response.json();
    const photos = await getListOfCoffeeStorePhotos();

    const coffeeStore = data.features.map((result: MapboxType, idx: number) =>
      transformCoffeeData(parseInt(queryId), result, photos)
    );
    return coffeeStore.length > 0 ? coffeeStore[0] : {};
  } catch (error) {
    console.error('Error while fetching coffee stores', error);
  }
};
