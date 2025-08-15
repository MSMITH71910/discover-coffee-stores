import { GET } from '@/app/api/getCoffeeStoresByLocation/route';
import { fetchCoffeeStores } from '@/lib/coffee-stores';
import { NextRequest } from 'next/server';

// Mock the coffee stores lib
jest.mock('@/lib/coffee-stores');
const mockFetchCoffeeStores = fetchCoffeeStores as jest.MockedFunction<typeof fetchCoffeeStores>;

// Mock environment variables
const originalEnv = process.env;

describe('/api/getCoffeeStoresByLocation', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createMockRequest = (searchParams: Record<string, string>) => {
    const url = new URL('http://localhost:3000/api/getCoffeeStoresByLocation');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return new NextRequest(url);
  };

  describe('Environment Variables Validation', () => {
    it('should return 500 when SERP_API_KEY is missing', async () => {
      delete process.env.SERP_API_KEY;
      process.env.UNSPLASH_ACCESS_KEY = 'test-key';

      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Service configuration error');
    });

    it('should return 500 when UNSPLASH_ACCESS_KEY is missing', async () => {
      process.env.SERP_API_KEY = 'test-key';
      delete process.env.UNSPLASH_ACCESS_KEY;

      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Service configuration error');
    });

    it('should return 500 when both API keys are missing', async () => {
      delete process.env.SERP_API_KEY;
      delete process.env.UNSPLASH_ACCESS_KEY;

      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Service configuration error');
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      process.env.SERP_API_KEY = 'test-serp-key';
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';
    });

    it('should return 400 for invalid coordinates format', async () => {
      const request = createMockRequest({ longLat: 'invalid-coords', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid coordinates');
    });

    it('should return 400 for coordinates with invalid characters', async () => {
      const request = createMockRequest({ longLat: '40.7589a,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid coordinates');
    });

    it('should return 400 for missing limit parameter', async () => {
      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid limit (1-20)');
    });

    it('should return 400 for invalid limit (too low)', async () => {
      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '0' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid limit (1-20)');
    });

    it('should return 400 for invalid limit (too high)', async () => {
      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '25' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid limit (1-20)');
    });

    it('should return 400 for non-numeric limit', async () => {
      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: 'abc' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid limit (1-20)');
    });
  });

  describe('Success Cases', () => {
    beforeEach(() => {
      process.env.SERP_API_KEY = 'test-serp-key';
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';
    });

    it('should return coffee stores successfully', async () => {
      const mockCoffeeStores = [
        { id: 'store1', name: 'Coffee Shop 1', address: 'Address 1', imgUrl: 'img1.jpg' },
        { id: 'store2', name: 'Coffee Shop 2', address: 'Address 2', imgUrl: 'img2.jpg' },
      ];

      mockFetchCoffeeStores.mockResolvedValueOnce(mockCoffeeStores);

      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCoffeeStores);
      expect(mockFetchCoffeeStores).toHaveBeenCalledWith('40.7589,-73.9851', 5);
    });

    it('should return empty array when no longLat provided', async () => {
      const request = createMockRequest({ longLat: '', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid coordinates');
    });

    it('should handle valid negative coordinates', async () => {
      const mockCoffeeStores = [
        { id: 'store1', name: 'Coffee Shop 1', address: 'Address 1', imgUrl: 'img1.jpg' },
      ];

      mockFetchCoffeeStores.mockResolvedValueOnce(mockCoffeeStores);

      const request = createMockRequest({ longLat: '-73.9851,40.7589', limit: '1' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCoffeeStores);
    });

    it('should handle coordinates without decimal points', async () => {
      const mockCoffeeStores = [];

      mockFetchCoffeeStores.mockResolvedValueOnce(mockCoffeeStores);

      const request = createMockRequest({ longLat: '-73,40', limit: '1' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.SERP_API_KEY = 'test-serp-key';
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';
    });

    it('should handle fetchCoffeeStores throwing an error', async () => {
      mockFetchCoffeeStores.mockRejectedValueOnce(new Error('External API failure'));

      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should return empty array when fetchCoffeeStores returns null', async () => {
      mockFetchCoffeeStores.mockResolvedValueOnce(null as any);

      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return empty array when fetchCoffeeStores returns undefined', async () => {
      mockFetchCoffeeStores.mockResolvedValueOnce(undefined as any);

      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should handle non-array response from fetchCoffeeStores', async () => {
      mockFetchCoffeeStores.mockResolvedValueOnce({ error: 'Something went wrong' } as any);

      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe('Security Tests', () => {
    it('should not expose API keys in response even on error', async () => {
      process.env.SERP_API_KEY = 'secret-serp-key';
      process.env.UNSPLASH_ACCESS_KEY = 'secret-unsplash-key';
      
      mockFetchCoffeeStores.mockRejectedValueOnce(new Error('API key validation failed'));

      const request = createMockRequest({ longLat: '40.7589,-73.9851', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(JSON.stringify(data)).not.toContain('secret-serp-key');
      expect(JSON.stringify(data)).not.toContain('secret-unsplash-key');
    });

    it('should handle malformed coordinates gracefully', async () => {
      const malformedCoords = [
        'lat,lng,extra',
        '40.7589',
        ',40.7589',
        '40.7589,',
        '40.7589,-73.9851,0',
        '40..7589,-73.9851',
        '40.7589.,-73.9851',
      ];

      process.env.SERP_API_KEY = 'test-key';
      process.env.UNSPLASH_ACCESS_KEY = 'test-key';

      for (const coords of malformedCoords) {
        const request = createMockRequest({ longLat: coords, limit: '5' });
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid coordinates');
      }
    });
  });
});