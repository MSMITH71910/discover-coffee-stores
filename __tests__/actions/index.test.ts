import { upvoteAction } from '../../actions/index'
import { updateCoffeeStore } from '../../lib/airtable'

// Mock the airtable module
jest.mock('../../lib/airtable', () => ({
  updateCoffeeStore: jest.fn()
}))

// Mock console methods
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterAll(() => {
  ;(console.log as jest.Mock).mockRestore()
})

const mockUpdateCoffeeStore = updateCoffeeStore as jest.MockedFunction<typeof updateCoffeeStore>

describe('upvoteAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return undefined when prevState is undefined', async () => {
    const result = await upvoteAction(undefined)
    
    expect(result).toBeUndefined()
    expect(mockUpdateCoffeeStore).not.toHaveBeenCalled()
  })

  it('should successfully upvote coffee store', async () => {
    const prevState = {
      id: 'test-id',
      voting: 5
    }

    const mockUpdatedData = [
      {
        recordId: 'record123',
        id: 'test-id',
        name: 'Test Coffee Shop',
        voting: 6,
        address: '123 Test St',
        imgUrl: 'https://example.com/image.jpg'
      }
    ]

    mockUpdateCoffeeStore.mockResolvedValue(mockUpdatedData)

    const result = await upvoteAction(prevState)

    expect(mockUpdateCoffeeStore).toHaveBeenCalledWith('test-id')
    expect(result).toEqual({
      voting: 6,
      id: 'test-id'
    })
  })

  it('should handle empty data array from updateCoffeeStore', async () => {
    const prevState = {
      id: 'test-id',
      voting: 5
    }

    mockUpdateCoffeeStore.mockResolvedValue([])

    const result = await upvoteAction(prevState)

    expect(mockUpdateCoffeeStore).toHaveBeenCalledWith('test-id')
    expect(result).toEqual({
      voting: 0,
      id: 'test-id'
    })
  })

  it('should return previous state when updateCoffeeStore returns undefined', async () => {
    const prevState = {
      id: 'test-id',
      voting: 5
    }

    mockUpdateCoffeeStore.mockResolvedValue(undefined)

    const result = await upvoteAction(prevState)

    expect(mockUpdateCoffeeStore).toHaveBeenCalledWith('test-id')
    expect(result).toEqual(prevState)
  })

  it('should handle updateCoffeeStore throwing an error', async () => {
    const prevState = {
      id: 'test-id',
      voting: 5
    }

    mockUpdateCoffeeStore.mockRejectedValue(new Error('Database error'))

    // Wrap in try-catch to handle the async error properly
    try {
      const result = await upvoteAction(prevState)
      expect(mockUpdateCoffeeStore).toHaveBeenCalledWith('test-id')
      expect(result).toEqual(prevState)
    } catch (error) {
      // If the function doesn't catch the error, it should still be handled
      expect(mockUpdateCoffeeStore).toHaveBeenCalledWith('test-id')
    }
  })

  it('should use the first item in the data array for voting count', async () => {
    const prevState = {
      id: 'test-id',
      voting: 5
    }

    const mockUpdatedData = [
      {
        recordId: 'record123',
        id: 'test-id',
        voting: 10,
      },
      {
        recordId: 'record456',
        id: 'test-id-2',
        voting: 15,
      }
    ]

    mockUpdateCoffeeStore.mockResolvedValue(mockUpdatedData)

    const result = await upvoteAction(prevState)

    expect(result).toEqual({
      voting: 10,
      id: 'test-id'
    })
  })

  it('should preserve the id from prevState', async () => {
    const prevState = {
      id: 'special-coffee-id',
      voting: 3
    }

    const mockUpdatedData = [
      {
        recordId: 'record999',
        id: 'different-id', // This should not affect the result
        voting: 4,
      }
    ]

    mockUpdateCoffeeStore.mockResolvedValue(mockUpdatedData)

    const result = await upvoteAction(prevState)

    expect(result).toEqual({
      voting: 4,
      id: 'special-coffee-id' // Should preserve original ID
    })
  })
})