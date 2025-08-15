import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Page, { generateStaticParams } from '@/app/coffee-store/[id]/page';
import { fetchCoffeeStore, fetchCoffeeStores } from '@/lib/coffee-stores';

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
    return <img src={src} alt={alt} width={width} height={height} />;
  };
});

// Mock the lib functions
jest.mock('@/lib/coffee-stores');
const mockFetchCoffeeStore = fetchCoffeeStore as jest.MockedFunction<typeof fetchCoffeeStore>;
const mockFetchCoffeeStores = fetchCoffeeStores as jest.MockedFunction<typeof fetchCoffeeStores>;

// Mock client components
jest.mock('@/components/upvote-local.client', () => {
  return function MockUpvoteLocal({ initialVoting, coffeeStoreId }: { initialVoting: number; coffeeStoreId: string }) {
    return <div data-testid="upvote-local">Voting: {initialVoting} for {coffeeStoreId}</div>;
  };
});

jest.mock('@/components/reviews.client', () => {
  return function MockReviews({ coffeeStoreId }: { coffeeStoreId: string }) {
    return <div data-testid="reviews">Reviews for {coffeeStoreId}</div>;
  };
});

describe('Coffee Store Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateStaticParams', () => {
    it('should generate static params from coffee stores', async () => {
      const mockCoffeeStores = [
        { id: 'store1', name: 'Coffee Shop 1', address: 'Address 1', imgUrl: 'img1.jpg' },
        { id: 'store2', name: 'Coffee Shop 2', address: 'Address 2', imgUrl: 'img2.jpg' },
      ];

      mockFetchCoffeeStores.mockResolvedValueOnce(mockCoffeeStores);

      const params = await generateStaticParams();

      expect(mockFetchCoffeeStores).toHaveBeenCalledWith('-79.3789680885594%2C43.653833032607096', 6);
      expect(params).toEqual([
        { id: 'store1' },
        { id: 'store2' },
      ]);
    });

    it('should handle empty coffee stores response', async () => {
      mockFetchCoffeeStores.mockResolvedValueOnce([]);

      const params = await generateStaticParams();

      expect(params).toEqual([]);
    });

    it('should handle fetchCoffeeStores error', async () => {
      mockFetchCoffeeStores.mockRejectedValueOnce(new Error('API Error'));

      await expect(generateStaticParams()).rejects.toThrow('API Error');
    });
  });

  describe('Page Component', () => {
    const mockProps = {
      params: Promise.resolve({ id: 'test-store-id' }),
      searchParams: Promise.resolve({ id: '0' }),
    };

    it('should render coffee store page with complete data', async () => {
      const mockCoffeeStore = {
        name: 'Test Coffee Shop',
        address: '123 Test St',
        imgUrl: 'https://example.com/test-image.jpg',
        voting: 5,
      };

      mockFetchCoffeeStore.mockResolvedValueOnce(mockCoffeeStore);

      render(await Page(mockProps));

      await waitFor(() => {
        expect(screen.getByText('Test Coffee Shop')).toBeInTheDocument();
        expect(screen.getByText('123 Test St')).toBeInTheDocument();
        expect(screen.getByText('← Back to home')).toBeInTheDocument();
        expect(screen.getByTestId('upvote-local')).toBeInTheDocument();
        expect(screen.getByTestId('reviews')).toBeInTheDocument();
      });
    });

    it('should render page with empty coffee store data', async () => {
      mockFetchCoffeeStore.mockResolvedValueOnce({});

      render(await Page(mockProps));

      await waitFor(() => {
        // Should render with empty/default values
        expect(screen.getByText('← Back to home')).toBeInTheDocument();
        expect(screen.getByTestId('upvote-local')).toBeInTheDocument();
        expect(screen.getByTestId('reviews')).toBeInTheDocument();
        
        // Should use fallback image
        const image = screen.getByAltText('Coffee Store Image');
        expect(image).toHaveAttribute('src', expect.stringContaining('unsplash.com'));
      });
    });

    it('should handle coffee store without address', async () => {
      const mockCoffeeStore = {
        name: 'Test Coffee Shop',
        address: '',
        imgUrl: 'https://example.com/test-image.jpg',
        voting: 3,
      };

      mockFetchCoffeeStore.mockResolvedValueOnce(mockCoffeeStore);

      render(await Page(mockProps));

      await waitFor(() => {
        expect(screen.getByText('Test Coffee Shop')).toBeInTheDocument();
        // Address section should not render
        expect(screen.queryByText('Address')).not.toBeInTheDocument();
      });
    });

    it('should render directions buttons when address is present', async () => {
      const mockCoffeeStore = {
        name: 'Test Coffee Shop',
        address: '123 Test Street, City, State',
        imgUrl: 'https://example.com/test-image.jpg',
        voting: 3,
      };

      mockFetchCoffeeStore.mockResolvedValueOnce(mockCoffeeStore);

      render(await Page(mockProps));

      await waitFor(() => {
        const googleMapsLink = screen.getByText('📍 Google Maps');
        const appleMapsLink = screen.getByText('🗺️ Apple Maps');
        const wazeLink = screen.getByText('🚗 Waze');

        expect(googleMapsLink).toBeInTheDocument();
        expect(appleMapsLink).toBeInTheDocument();
        expect(wazeLink).toBeInTheDocument();

        // Check if links have correct href attributes
        expect(googleMapsLink.closest('a')).toHaveAttribute('href', 
          expect.stringContaining('google.com/maps/search')
        );
        expect(appleMapsLink.closest('a')).toHaveAttribute('href', 
          expect.stringContaining('maps.apple.com')
        );
        expect(wazeLink.closest('a')).toHaveAttribute('href', 
          expect.stringContaining('waze.com')
        );
      });
    });

    it('should handle fetchCoffeeStore returning undefined', async () => {
      mockFetchCoffeeStore.mockResolvedValueOnce(undefined);

      render(await Page(mockProps));

      await waitFor(() => {
        // Should still render the page structure
        expect(screen.getByText('← Back to home')).toBeInTheDocument();
        expect(screen.getByTestId('upvote-local')).toBeInTheDocument();
        expect(screen.getByTestId('reviews')).toBeInTheDocument();
      });
    });

    it('should handle fetchCoffeeStore error by letting it bubble up', async () => {
      mockFetchCoffeeStore.mockRejectedValueOnce(new Error('API Error'));

      // In Next.js, errors in server components should be handled by error boundaries
      await expect(Page(mockProps)).rejects.toThrow('API Error');
    });

    it('should pass correct parameters to fetchCoffeeStore', async () => {
      mockFetchCoffeeStore.mockResolvedValueOnce({});

      await Page(mockProps);

      expect(mockFetchCoffeeStore).toHaveBeenCalledWith('test-store-id', '0');
    });

    it('should handle custom image URL', async () => {
      const mockCoffeeStore = {
        name: 'Test Coffee Shop',
        address: '123 Test St',
        imgUrl: 'https://custom-image.com/coffee.jpg',
        voting: 5,
      };

      mockFetchCoffeeStore.mockResolvedValueOnce(mockCoffeeStore);

      render(await Page(mockProps));

      await waitFor(() => {
        const image = screen.getByAltText('Coffee Store Image');
        expect(image).toHaveAttribute('src', 'https://custom-image.com/coffee.jpg');
      });
    });
  });
});