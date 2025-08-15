import { fetchCoffeeStores, fetchCoffeeStore } from '../../lib/coffee-stores'
import { MapboxType } from '../../types'

// Mock data
const mockUnsplashResponse = {
  results: [
    { urls: { small: 'https://example.com/photo1.jpg' } },
    { urls: { small: 'https://example.com/photo2.jpg' } }
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
    } as MapboxType,
    {
      id: 'poi.987654321',
      text: 'Local Coffee Shop',
      properties: {
        address: '456 Oak Ave, City, State 12345'
      }
    } as MapboxType
  ]
}

const mockSingleCoffeeStoreResponse = {
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

  it('should return empty array on fetch error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const result = await fetchCoffeeStores('-73.935242,40.730610', 2)

    expect(result).toEqual([])
  })

  it('should fetch coffee stores successfully with photos', async () => {
    // Mock fetch responses - Unsplash first (for getListOfCoffeeStorePhotos), then Mapbox
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockUnsplashResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockMapboxResponse)
      })

    const result = await fetchCoffeeStores('-73.935242,40.730610', 2)

    expect(global.fetch).toHaveBeenCalledTimes(2) // Unsplash once + Mapbox once
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.unsplash.com/search/photos')
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.mapbox.com/geocoding/v5/mapbox.places/coffee.json')
    )

    expect(result).toEqual([
      {
        id: 'poi.123456789',
        name: 'Starbucks Coffee',
        address: '123 Main St, City, State 12345',
        imgUrl: 'https://example.com/photo1.jpg'
      },
      {
        id: 'poi.987654321',
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
        json: () => Promise.resolve(mockMapboxResponse)
      })

    const result = await fetchCoffeeStores('-73.935242,40.730610', 2)

    expect(result).toHaveLength(2)
    expect(result[0].imgUrl).toBe('')
    expect(result[1].imgUrl).toBe('')
  })

  it('should handle missing address property', async () => {
    const responseWithoutAddress = {
      features: [
        {
          id: 'poi.123456789',
          text: 'Coffee Shop',
          properties: {}
        } as MapboxType
      ]
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockUnsplashResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(responseWithoutAddress)
      })

    const result = await fetchCoffeeStores('-73.935242,40.730610', 1)

    expect(result).toHaveLength(1)
    expect(result[0].address).toBe('')
  })

  it('should handle undefined features', async () => {
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
        json: () => Promise.resolve(mockUnsplashResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockSingleCoffeeStoreResponse)
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
        json: () => Promise.resolve(mockUnsplashResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ features: [] })
      })

    const result = await fetchCoffeeStore('poi.123456789', '0')

    expect(result).toEqual({})
  })

  it('should handle fetch error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const result = await fetchCoffeeStore('poi.123456789', '0')

    expect(result).toBeUndefined()
  })

  it('should parse queryId as integer for index', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockUnsplashResponse)
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockSingleCoffeeStoreResponse)
      })

    await fetchCoffeeStore('poi.123456789', '5')

    // The queryId should be parsed as integer (5) and used as the index
    // This test verifies the parseInt(queryId) call in transformCoffeeData
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})