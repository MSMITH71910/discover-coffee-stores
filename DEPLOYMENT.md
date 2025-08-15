# Vercel Deployment Guide

## Required Environment Variables

Add these to your Vercel dashboard under Settings → Environment Variables:

### API Keys
- `SERP_API_KEY` - Your SerpApi key for Google Maps data
- `UNSPLASH_ACCESS_KEY` - Your Unsplash API key for coffee shop images  
- `AIRTABLE_TOKEN` - Your Airtable personal access token
- `AIRTABLE_BASE_ID` - Your Airtable base ID

### Application Settings
- `NEXT_PUBLIC_SITE_URL` - Your Vercel deployment URL (e.g., https://your-app.vercel.app)
- `NODE_ENV` - Set to "production"

## Deployment Steps

1. **Push to Git**: Make sure your code is pushed to your Git repository
2. **Connect to Vercel**: Import your repository in Vercel dashboard
3. **Add Environment Variables**: Copy all variables from your `.env.local` to Vercel
4. **Deploy**: Vercel will automatically build and deploy your app

## Post-Deployment Checklist

- [ ] Test home page loads with coffee shops
- [ ] Test individual coffee shop pages show real data
- [ ] Test voting system works
- [ ] Test comments system works
- [ ] Verify no API keys are exposed in browser
- [ ] Check all pages load without errors

## Production Features

✅ Real coffee shop data from Google Maps
✅ User voting system with Airtable persistence  
✅ Comments and reviews system
✅ Responsive design
✅ API keys secured server-side
✅ Error handling and fallbacks