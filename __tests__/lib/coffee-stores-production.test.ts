import { fetchCoffeeStores, fetchCoffeeStore } from '@/lib/coffee-stores';
import { MapboxType } from '@/types';

// Mock environment variables
const originalEnv = process.env;

// Mock fetch globally
global.fetch = jest.fn();

describe('Coffee Stores Production Issues', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('fetchCoffeeStores - Environment Issues', () => {
    it('should handle missing SERP_API_KEY in production', async () => {
      delete process.env.SERP_API_KEY;
      process.env.UNSPLASH_ACCESS_KEY = 'test-key';

      // Mock Unsplash response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ results: [] })
      });

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      // Should fall back to hardcoded shops
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('starbucks-media-fallback');
      expect(result[1].id).toBe('dunkin-broomall-fallback');
    });

    it('should handle missing UNSPLASH_ACCESS_KEY', async () => {
      process.env.SERP_API_KEY = 'test-key';
      delete process.env.UNSPLASH_ACCESS_KEY;

      // Mock SERP API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({
          local_results: [
            {
              place_id: 'ChIJ123',
              title: 'Starbucks',
              address: '123 Main St'
            }
          ]
        })
      });

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      // Should still work but with empty imgUrl
      expect(result).toHaveLength(1);
      expect(result[0].imgUrl).toBe('');
    });

    it('should handle both API keys missing', async () => {
      delete process.env.SERP_API_KEY;
      delete process.env.UNSPLASH_ACCESS_KEY;

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      // Should still return fallback data
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('starbucks-media-fallback');
      expect(result[1].id).toBe('dunkin-broomall-fallback');
    });
  });

  describe('fetchCoffeeStores - SERP API Errors', () => {
    beforeEach(() => {
      process.env.SERP_API_KEY = 'test-serp-key';
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';
    });

    it('should handle SERP API returning 401 Unauthorized', async () => {
      // Mock Unsplash first call
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ results: [] })
        })
        // Mock SERP API 401 error
        .mockRejectedValueOnce(new Error('401 Unauthorized'));

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      // Should fall back to hardcoded shops
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('starbucks-media-fallback');
    });

    it('should handle SERP API returning empty local_results', async () => {
      // Mock Unsplash response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ 
            results: [{ urls: { small: 'photo1.jpg' } }] 
          })
        })
        // Mock SERP API with no results
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ local_results: [] })
        });

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      expect(result).toEqual([]);
    });

    it('should handle SERP API returning malformed data', async () => {
      // Mock Unsplash response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ results: [] })
        })
        // Mock SERP API with malformed data
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ error: 'Invalid query' })
        });

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      // Should fall back to hardcoded shops
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('starbucks-media-fallback');
    });

    it('should handle network timeout errors', async () => {
      // Mock Unsplash response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ results: [] })
        })
        // Mock network timeout
        .mockRejectedValueOnce(new Error('Network timeout'));

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      // Should fall back gracefully
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('starbucks-media-fallback');
    });
  });

  describe('fetchCoffeeStore - Mapbox API Issues', () => {
    beforeEach(() => {
      process.env.MAPBOX_API = 'test-mapbox-key';
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';
    });

    it('should handle missing MAPBOX_API environment variable', async () => {
      delete process.env.MAPBOX_API;

      const result = await fetchCoffeeStore('test-id', '0');

      expect(result).toBeUndefined();
    });

    it('should handle Mapbox API returning 401', async () => {
      // Mock Unsplash response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ results: [] })
        })
        // Mock Mapbox 401 error
        .mockRejectedValueOnce(new Error('401 Unauthorized'));

      const result = await fetchCoffeeStore('test-id', '0');

      expect(result).toBeUndefined();
    });

    it('should handle Mapbox API returning empty features', async () => {
      // Mock Unsplash response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ results: [] })
        })
        // Mock Mapbox with no features
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ features: [] })
        });

      const result = await fetchCoffeeStore('test-id', '0');

      expect(result).toEqual({});
    });

    it('should handle invalid queryId parameter', async () => {
      const mockUnsplashResponse = { results: [{ urls: { small: 'photo.jpg' } }] };
      const mockMapboxResponse = {
        features: [{
          id: 'poi.123',
          text: 'Coffee Shop',
          properties: { address: '123 Main St' }
        } as MapboxType]
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockUnsplashResponse) })
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockMapboxResponse) });

      // Test with invalid queryId (should handle NaN gracefully)
      const result = await fetchCoffeeStore('test-id', 'invalid');

      expect(result).toBeDefined();
      // parseInt('invalid') returns NaN, but photos[NaN] should be handled
      expect(result.imgUrl).toBe('');
    });

    it('should handle Mapbox API rate limiting', async () => {
      // Mock Unsplash response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ results: [] })
        })
        // Mock Mapbox rate limiting
        .mockRejectedValueOnce(new Error('429 Too Many Requests'));

      const result = await fetchCoffeeStore('test-id', '0');

      expect(result).toBeUndefined();
    });
  });

  describe('fetchCoffeeStores - Unsplash API Issues', () => {
    beforeEach(() => {
      process.env.SERP_API_KEY = 'test-serp-key';
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';
    });

    it('should handle Unsplash API returning 403 Forbidden', async () => {
      // Mock Unsplash 403 error
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('403 Forbidden'))
        // Mock SERP API success
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            local_results: [
              { place_id: 'test1', title: 'Coffee Shop 1', address: 'Address 1' }
            ]
          })
        });

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      // Should work but with empty images
      expect(result).toHaveLength(1);
      expect(result[0].imgUrl).toBe('');
    });

    it('should handle Unsplash API returning malformed JSON', async () => {
      // Mock Unsplash malformed response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.reject(new Error('Unexpected token'))
        })
        // Mock SERP API success
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            local_results: [
              { place_id: 'test1', title: 'Coffee Shop 1', address: 'Address 1' }
            ]
          })
        });

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      // Should work but with empty images
      expect(result).toHaveLength(1);
      expect(result[0].imgUrl).toBe('');
    });
  });

  describe('Production Coordinate Parsing Issues', () => {
    beforeEach(() => {
      process.env.SERP_API_KEY = 'test-serp-key';
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';
    });

    it('should handle URL-encoded coordinates correctly', async () => {
      const urlEncodedCoords = '-79.3789680885594%2C43.653833032607096';

      // Mock successful responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ results: [] })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            local_results: [
              { place_id: 'test1', title: 'Coffee Shop', address: 'Test Address' }
            ]
          })
        });

      const result = await fetchCoffeeStores(urlEncodedCoords, 1);

      expect(result).toHaveLength(1);
      // Verify the SERP API was called with properly parsed coordinates
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('@-79.3789680885594,43.653833032607096')
      );
    });

    it('should handle coordinates with spaces', async () => {
      const coordsWithSpaces = '40.7589, -73.9851';

      // Mock successful responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ results: [] })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            local_results: [
              { place_id: 'test1', title: 'Coffee Shop', address: 'Test Address' }
            ]
          })
        });

      const result = await fetchCoffeeStores(coordsWithSpaces, 1);

      expect(result).toHaveLength(1);
    });
  });

  describe('Data Transformation Edge Cases', () => {
    beforeEach(() => {
      process.env.SERP_API_KEY = 'test-serp-key';
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';
    });

    it('should handle SERP results with missing fields', async () => {
      // Mock responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ results: [] })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            local_results: [
              { place_id: 'test1' }, // Missing title and address
              { title: 'Coffee Shop 2' }, // Missing place_id and address
              { address: 'Only Address Shop' }, // Missing place_id and title
            ]
          })
        });

      const result = await fetchCoffeeStores('40.7589,-73.9851', 5);

      expect(result).toHaveLength(3);
      
      // First shop with missing title and address
      expect(result[0].id).toBe('test1');
      expect(result[0].name).toBe('Coffee Shop');
      expect(result[0].address).toBe('Address not available');
      
      // Second shop with missing place_id and address
      expect(result[1].id).toBe('coffee-shop-1');
      expect(result[1].name).toBe('Coffee Shop 2');
      expect(result[1].address).toBe('Address not available');
      
      // Third shop with missing place_id and title
      expect(result[2].id).toBe('coffee-shop-2');
      expect(result[2].name).toBe('Coffee Shop');
      expect(result[2].address).toBe('Only Address Shop');
    });

    it('should handle photos array being shorter than results', async () => {
      // Mock responses with more coffee shops than photos
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ 
            results: [
              { urls: { small: 'photo1.jpg' } },
              { urls: { small: 'photo2.jpg' } }
            ] 
          })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            local_results: [
              { place_id: 'shop1', title: 'Shop 1', address: 'Address 1' },
              { place_id: 'shop2', title: 'Shop 2', address: 'Address 2' },
              { place_id: 'shop3', title: 'Shop 3', address: 'Address 3' },
              { place_id: 'shop4', title: 'Shop 4', address: 'Address 4' },
            ]
          })
        });

      const result = await fetchCoffeeStores('40.7589,-73.9851', 4);

      expect(result).toHaveLength(4);
      expect(result[0].imgUrl).toBe('photo1.jpg');
      expect(result[1].imgUrl).toBe('photo2.jpg');
      expect(result[2].imgUrl).toBe(''); // No more photos available
      expect(result[3].imgUrl).toBe(''); // No more photos available
    });
  });
});