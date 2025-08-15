# 🔧 Coffee Store Finder - Setup Guide

## ❌ Current Issue: "Stores Nearby" Button Not Working

The "View stores nearby" button isn't showing results because the required API keys are missing.

## 🗝️ Required API Keys

### 1. **Mapbox API Key** (Required for location search)
1. Go to [https://www.mapbox.com/](https://www.mapbox.com/)
2. Create a free account
3. Navigate to your Account → Access tokens
4. Copy your default public token

### 2. **Unsplash Access Key** (Required for coffee shop images)
1. Go to [https://unsplash.com/developers](https://unsplash.com/developers)
2. Create a free account
3. Create a new application
4. Copy your Access Key

### 3. **Airtable Token** (Optional - for voting feature)
1. Go to [https://airtable.com/](https://airtable.com/)
2. Create a free account
3. Go to Account → Developer hub → Personal access tokens
4. Create a token with read/write access

## ⚡ Quick Setup

1. **Copy the environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit the `.env.local` file and add your API keys:**
   ```bash
   MAPBOX_API=pk.eyJ1Ijoiam9obmRvZSIsImEiOiJjazlyODNvMzMwNnUwM29xbWJ4YnY1YWJrIn0.example
   UNSPLASH_ACCESS_KEY=abc123def456ghi789jkl012mno345pqr678stu
   AIRTABLE_TOKEN=patAbc123.def456ghi789
   AIRTABLE_BASE_ID=appAbc123Def456
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing the Fix

1. **Open** [http://localhost:3001](http://localhost:3001)
2. **Click** "View stores nearby" button
3. **Allow** location access when prompted
4. **Wait** for coffee shops to appear

## 🔍 Debugging Steps

### Check if environment variables are loaded:
```bash
# In your terminal, run this to test the API directly:
curl "http://localhost:3001/api/getCoffeeStoresByLocation?longLat=39.9078,-75.4348&limit=5"
```

### Check browser console:
1. Open Developer Tools (F12)
2. Go to Console tab  
3. Click "View stores nearby"
4. Look for any error messages

### Common Issues:
- **Empty array `[]`**: API keys missing or invalid
- **Geolocation error**: User denied location access
- **Network error**: API endpoints are down

## 📊 Expected Behavior

Once setup correctly:
1. ✅ **Click** "View stores nearby" → Button changes to "Locating..."
2. ✅ **Browser** asks for location permission
3. ✅ **App** fetches your coordinates  
4. ✅ **API** searches for nearby coffee shops
5. ✅ **Results** display with photos and info

## 🆘 Still Not Working?

If you continue having issues:

1. **Check the browser console** for error messages
2. **Verify API keys** are correct and have proper permissions
3. **Test each API** individually:
   - Mapbox: Should return coffee shop data
   - Unsplash: Should return photo URLs
4. **Make sure** you're allowing location access in the browser

The app should work perfectly once the API keys are configured! 🎉