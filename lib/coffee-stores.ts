import { MapboxType } from '@/types';

const getListOfCoffeeStorePhotos = async () => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos/?client_id=${process.env.UNSPLASH_ACCESS_KEY}&query="coffee shop"&page=1&perPage=10&orientation=landscape`
    );
    const photos = await response.json();
    const results = photos?.results || [];
    return results?.map((result: { urls: any }) => result.urls['small']) || [];
  } catch (error) {
    console.error('Error retrieving a photo', error);
    return []; // Return empty array on error
  }
};

const transformCoffeeData = (
  idx: number,
  result: any,
  photos: Array<string> = []
) => {
  return {
    id: result.id || result.place_id,
    address: result.properties?.address || result.address || '',
    name: result.text || result.title || result.name,
    imgUrl: photos && photos.length > 0 ? photos[idx] : '',
    voting: 0, // Default voting
    // Rich data from SERP API
    description: result.description || '',
    rating: result.rating || 0,
    totalReviews: result.reviews || 0,
    priceRange: result.price || '',
    offerings: JSON.stringify(result.offerings || []),
  };
};

export const fetchCoffeeStores = async (longLat: string, limit: number) => {
  try {
    // Get photos from Unsplash
    const photos = await getListOfCoffeeStorePhotos();
    
    // Parse coordinates - longLat comes in as "longitude,latitude" format
    const [lng, lat] = longLat.split(',');
    
    console.log('🔍 fetchCoffeeStores DEBUG:');
    console.log('📍 Input longLat:', longLat);
    console.log('📍 Parsed lng:', lng, 'lat:', lat);
    
    // Use SERP API to find real coffee shops nearby - SERP expects "latitude,longitude"
    const serpApiUrl = `https://serpapi.com/search.json?engine=google_maps&q=coffee+shop&ll=@${lat},${lng},15z&type=search&api_key=${process.env.SERP_API_KEY}`;
    console.log('📡 SERP API URL (without key):', serpApiUrl.replace(/api_key=.*/, 'api_key=[HIDDEN]'));
    
    const response = await fetch(serpApiUrl);
    const data = await response.json();
    console.log('☕ SERP API response status:', response.status);
    console.log('☕ Local results count:', data.local_results?.length || 0);
    if (data.local_results && data.local_results.length > 0) {
      console.log('📍 First result address:', data.local_results[0].address);
    }
    
    // Extract local results - SERP API automatically returns location-appropriate results
    const localResults = data.local_results || [];
    
    console.log('🌍 GLOBAL LOCATION - Processing results for coordinates:', lat, lng);
    console.log('☕ Total local results found:', localResults.length);
    if (localResults.length > 0) {
      console.log('📍 First result location:', localResults[0].address);
      console.log('📍 Last result location:', localResults[localResults.length - 1]?.address);
    }
    
    // No geographic filtering - trust SERP API to return location-appropriate results
    // This makes the app work globally like Google Maps
    
    // Transform SERP API results to our format (keep all rich data) 
    const coffeeShops = localResults.slice(0, limit).map((result: any, idx: number) => ({
      id: result.place_id || `coffee-shop-${idx}`,
      title: result.title || result.name || 'Coffee Shop',
      address: result.address || 'Address not available',
      description: result.description || '',
      rating: result.rating || 0,
      reviews: result.reviews || 0,
      price: result.price || '',
      offerings: result.extensions?.find((ext: any) => ext.offerings)?.offerings || [],
      // Keep legacy format for compatibility
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
    
    try {
      const photos = await getListOfCoffeeStorePhotos();
      return fallbackShops.slice(0, limit).map((result: any, idx: number) =>
        transformCoffeeData(idx, result, photos)
      );
    } catch (photosError) {
      // If photos also fail, still return fallback data without images
      return fallbackShops.slice(0, limit).map((result: any, idx: number) =>
        transformCoffeeData(idx, result, [])
      );
    }
  }
};

export const fetchCoffeeStore = async (id: string, queryId: string) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${id}.json?proximity=ip&access_token=${process.env.MAPBOX_API}`
    );
    const data = await response.json();
    const photos = await getListOfCoffeeStorePhotos();

    const features = data.features || [];
    if (features.length === 0) {
      return {};
    }

    const coffeeStore = features.map((result: MapboxType, idx: number) =>
      transformCoffeeData(parseInt(queryId) || 0, result, photos)
    );
    return coffeeStore.length > 0 ? coffeeStore[0] : {};
  } catch (error) {
    console.error('Error while fetching coffee store', error);
    return {};
  }
};
