import '@testing-library/jest-dom'

// Mock environment variables
process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key'
process.env.MAPBOX_API = 'test-mapbox-key'

// Mock fetch globally
global.fetch = jest.fn()

// Mock geolocation
Object.defineProperty(global.navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn(),
  },
})

beforeEach(() => {
  jest.clearAllMocks()
})