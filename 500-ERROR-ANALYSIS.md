# 500 Internal Server Error - Root Cause Analysis & Fix

## Problem
The deployed application is returning 500 Internal Server Errors on:
- `https://discover-coffee-stores-pied.vercel.app/coffee-store`
- `https://discover-coffee-stores-pied.vercel.app/coffee-store/ChIJ-_mVztLpxokRRNd2aa71Yto?id=0`

## Root Causes Identified

### 1. **Critical Bug in `transformCoffeeData` function**
```typescript
// BEFORE (BROKEN):
imgUrl: photos.length > 0 ? photos[idx] : '',

// AFTER (FIXED):
imgUrl: photos && photos.length > 0 ? photos[idx] : '',
```
**Issue**: When `getListOfCoffeeStorePhotos()` failed, it returned `undefined` instead of an empty array, causing `photos.length` to throw "Cannot read properties of undefined".

### 2. **Missing Error Handling in Photo Fetching**
```typescript
// BEFORE (BROKEN):
const getListOfCoffeeStorePhotos = async () => {
  try {
    // ... fetch logic
    return results?.map(...);
  } catch (error) {
    console.error('Error retrieving a photo', error);
    // Returns undefined
  }
};

// AFTER (FIXED):
const getListOfCoffeeStorePhotos = async () => {
  try {
    // ... fetch logic  
    return results?.map(...) || [];
  } catch (error) {
    console.error('Error retrieving a photo', error);
    return []; // Always return empty array
  }
};
```

### 3. **Inadequate Fallback Handling**
```typescript
// BEFORE (BROKEN):
} catch (error) {
  const photos = await getListOfCoffeeStorePhotos(); // Could fail again
  return fallbackShops.slice(0, limit).map((result: any, idx: number) =>
    transformCoffeeData(idx, result, photos) // Crash if photos undefined
  );
}

// AFTER (FIXED):
} catch (error) {
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
```

### 4. **Missing Environment Variables in Production**
The diagnostic revealed that **all required API keys are missing** in production:
- `MAPBOX_API` ❌ Missing
- `UNSPLASH_ACCESS_KEY` ❌ Missing  
- `SERP_API_KEY` ❌ Missing
- `AIRTABLE_TOKEN` ❌ Missing
- `AIRTABLE_BASE_ID` ❌ Missing

### 5. **fetchCoffeeStore Returning undefined**
```typescript
// BEFORE (BROKEN):
} catch (error) {
  console.error('Error while fetching coffee stores', error);
  // Returns undefined
}

// AFTER (FIXED): 
} catch (error) {
  console.error('Error while fetching coffee store', error);
  return {}; // Always return empty object
}
```

## Fixes Implemented

### ✅ **Code Fixes**
1. **Fixed `transformCoffeeData`** to handle undefined photos array
2. **Improved `getListOfCoffeeStorePhotos`** to always return array
3. **Enhanced fallback error handling** with nested try-catch
4. **Fixed `fetchCoffeeStore`** to return empty object on error
5. **Added proper validation** for empty features arrays

### ✅ **Test Coverage**
Created comprehensive tests covering:
- Environment variable validation
- API failure scenarios  
- Edge cases with malformed data
- Error boundary testing
- Production-specific issues

## Deployment Checklist

### 🔧 **Immediate Actions Required**
1. **Set Environment Variables in Vercel**:
   ```bash
   MAPBOX_API=your_mapbox_api_key
   UNSPLASH_ACCESS_KEY=your_unsplash_key
   SERP_API_KEY=your_serp_api_key
   AIRTABLE_TOKEN=your_airtable_token
   AIRTABLE_BASE_ID=your_airtable_base_id
   ```

2. **Verify API Key Validity**:
   - Check rate limits
   - Test each API endpoint
   - Monitor usage quotas

3. **Deploy Updated Code**:
   - The fixed code handles all error scenarios
   - Fallback data ensures pages still render
   - No more 500 errors from undefined access

### 📊 **Testing Results**
- ✅ Original tests: **9/9 passing**
- ✅ Simple coffee store page: **4/4 passing**  
- ✅ Production error scenarios covered
- ✅ Build successful

### 🎯 **Expected Outcome**
After setting the environment variables and deploying the fixed code:
- `/coffee-store` will render the simple page
- `/coffee-store/[id]` will show coffee store details or fallback gracefully
- No more 500 errors from undefined property access
- Graceful degradation when APIs are unavailable

## Monitoring Recommendations

1. **Add logging** for API failures in production
2. **Set up alerts** for high error rates
3. **Monitor API usage** to prevent rate limiting
4. **Track fallback usage** to identify API reliability issues

The core issue was **defensive programming** - the code assumed external APIs would always succeed and return expected data structures. The fixes ensure graceful degradation at every level.