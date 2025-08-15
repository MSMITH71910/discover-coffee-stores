import { renderHook, act } from '@testing-library/react'
import useTrackLocation from '../../hooks/use-track-location'

// Mock console methods to reduce noise in tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  ;(console.log as jest.Mock).mockRestore()
  ;(console.error as jest.Mock).mockRestore()
})

describe('useTrackLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset geolocation mock
    ;(navigator.geolocation.getCurrentPosition as jest.Mock).mockReset()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTrackLocation())

    expect(result.current.longLat).toBe('')
    expect(result.current.isFindingLocation).toBe(false)
    expect(result.current.locationErrorMsg).toBe('')
    expect(typeof result.current.handleTrackLocation).toBe('function')
  })

  it('should set finding location to true when tracking starts', () => {
    const { result } = renderHook(() => useTrackLocation())

    act(() => {
      result.current.handleTrackLocation()
    })

    expect(result.current.isFindingLocation).toBe(true)
    expect(result.current.locationErrorMsg).toBe('')
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
  })

  it('should handle successful geolocation', () => {
    const mockPosition = {
      coords: {
        latitude: 40.730610,
        longitude: -73.935242
      }
    }

    ;(navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (success) => {
        success(mockPosition)
      }
    )

    const { result } = renderHook(() => useTrackLocation())

    act(() => {
      result.current.handleTrackLocation()
    })

    expect(result.current.longLat).toBe('-73.935242,40.73061')
    expect(result.current.isFindingLocation).toBe(false)
    expect(result.current.locationErrorMsg).toBe('')
  })

  it('should handle geolocation error', () => {
    const mockError = {
      code: 1,
      message: 'Permission denied'
    } as GeolocationPositionError

    ;(navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (success, error) => {
        error(mockError)
      }
    )

    const { result } = renderHook(() => useTrackLocation())

    act(() => {
      result.current.handleTrackLocation()
    })

    expect(result.current.isFindingLocation).toBe(false)
    expect(result.current.locationErrorMsg).toBe('Unable to retrieve your location')
    expect(result.current.longLat).toBe('')
  })

  it('should handle browser without geolocation support', () => {
    // Temporarily override geolocation
    const originalGeolocation = global.navigator.geolocation
    ;(global.navigator as any).geolocation = undefined

    const { result } = renderHook(() => useTrackLocation())

    act(() => {
      result.current.handleTrackLocation()
    })

    expect(result.current.locationErrorMsg).toBe('Geolocation is not supported by your browser')
    expect(result.current.isFindingLocation).toBe(false)

    // Restore geolocation
    global.navigator.geolocation = originalGeolocation
  })

  it('should clear error message when starting new location request', () => {
    const { result } = renderHook(() => useTrackLocation())

    // First, set an error state
    const originalGeolocation = global.navigator.geolocation
    ;(global.navigator as any).geolocation = undefined

    act(() => {
      result.current.handleTrackLocation()
    })

    expect(result.current.locationErrorMsg).toBe('Geolocation is not supported by your browser')

    // Restore geolocation and try again
    global.navigator.geolocation = originalGeolocation

    act(() => {
      result.current.handleTrackLocation()
    })

    expect(result.current.isFindingLocation).toBe(true)
    expect(result.current.locationErrorMsg).toBe('')
  })

  it('should format coordinates correctly', () => {
    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278
      }
    }

    ;(navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (success) => {
        success(mockPosition)
      }
    )

    const { result } = renderHook(() => useTrackLocation())

    act(() => {
      result.current.handleTrackLocation()
    })

    expect(result.current.longLat).toBe('-0.1278,51.5074')
  })

  it('should handle zero coordinates', () => {
    const mockPosition = {
      coords: {
        latitude: 0,
        longitude: 0
      }
    }

    ;(navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (success) => {
        success(mockPosition)
      }
    )

    const { result } = renderHook(() => useTrackLocation())

    act(() => {
      result.current.handleTrackLocation()
    })

    expect(result.current.longLat).toBe('0,0')
  })
})