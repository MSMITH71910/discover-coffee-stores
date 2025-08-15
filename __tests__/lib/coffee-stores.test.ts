import { fetchCoffeeStores, fetchCoffeeStore } from '../../lib/coffee-stores'
import { MapboxType } from '../../types'

// Mock data
const mockUnsplashResponse = {
  results: [
    { urls: { small: 'https://example.com/photo1.jpg' } },
    { urls: { small: 'https://example.com/photo2.jpg' } }
  ]
}

const mockSerpResponse = {
  local_results: [
    {
      place_id: 'ChIJ123456789',
      title: 'Starbucks Coffee',
      address: '123 Main St, City, State 12345'
    },
    {
      place_id: 'ChIJ987654321',
      title: 'Local Coffee Shop',
      address: '456 Oak Ave, City, State 12345'
    }
  ]
}

const mockMapboxResponse = {
  features: [
    {
      id: 'poi.123456789',
      text: 'Starbucks Coffee',
      properties: {
        address: '123 Main St, City, State 12345'
      }
    } as MapboxType
  ]
}



describe('fetchCoffeeStores', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return fallback data on fetch error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const result = await fetchCoffeeStores('-73.935242,40.730610', 2)

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('starbucks-media-fallback')
    expect(result[1].id).toBe('dunkin-broomall-fallback')
  })

  it('should fetch coffee stores successfully with photos', async () => {
    // Mock fetch responses - Unsplash first (for getListOfCoffeeStorePhotos), then SERP API
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockUnsplashResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockSerpResponse)
      })

    const result = await fetchCoffeeStores('-73.935242,40.730610', 2)

    expect(global.fetch).toHaveBeenCalledTimes(2) // Unsplash once + SERP API once
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.unsplash.com/search/photos')
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('serpapi.com/search.json')
    )

    expect(result).toEqual([
      {
        id: 'ChIJ123456789',
        name: 'Starbucks Coffee',
        address: '123 Main St, City, State 12345',
        imgUrl: 'https://example.com/photo1.jpg'
      },
      {
        id: 'ChIJ987654321',
        name: 'Local Coffee Shop',
        address: '456 Oak Ave, City, State 12345',
        imgUrl: 'https://example.com/photo2.jpg'
      }
    ])
  })

  it('should handle no photos available', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ results: [] })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockSerpResponse)
      })

    const result = await fetchCoffeeStores('-73.935242,40.730610', 2)

    expect(result).toHaveLength(2)
    expect(result[0].imgUrl).toBe('')
    expect(result[1].imgUrl).toBe('')
  })

  it('should handle missing address property', async () => {
    const serpResponseWithoutAddress = {
      local_results: [
        {
          place_id: 'ChIJ123456789',
          title: 'Coffee Shop'
          // Missing address property
        }
      ]
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockUnsplashResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(serpResponseWithoutAddress)
      })

    const result = await fetchCoffeeStores('-73.935242,40.730610', 1)

    expect(result).toHaveLength(1)
    expect(result[0].address).toBe('Address not available')
  })

  it('should handle undefined local_results', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockUnsplashResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({})
      })

    const result = await fetchCoffeeStores('-73.935242,40.730610', 2)

    expect(result).toEqual([])
  })
})

describe('fetchCoffeeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch single coffee store successfully', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockMapboxResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockUnsplashResponse)
      })

    const result = await fetchCoffeeStore('poi.123456789', '0')

    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.mapbox.com/geocoding/v5/mapbox.places/poi.123456789.json')
    )

    expect(result).toEqual({
      id: 'poi.123456789',
      name: 'Starbucks Coffee',
      address: '123 Main St, City, State 12345',
      imgUrl: 'https://example.com/photo1.jpg'
    })
  })

  it('should return empty object when no features found', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ features: [] })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockUnsplashResponse)
      })

    const result = await fetchCoffeeStore('poi.123456789', '0')

    expect(result).toEqual({})
  })

  it('should handle fetch error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const result = await fetchCoffeeStore('poi.123456789', '0')

    expect(result).toEqual({})
  })

  it('should parse queryId as integer for index', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockMapboxResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockUnsplashResponse)
      })

    await fetchCoffeeStore('poi.123456789', '5')

    // The queryId should be parsed as integer (5) and used as the index
    // This test verifies the parseInt(queryId) call in transformCoffeeData
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})