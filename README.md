# Coffee Shop Discovery App

A Next.js application for discovering local coffee shops with real-time data, user reviews, and interactive features.

## Features

- 🗺️ **Real Coffee Shop Data** - Powered by Google Maps API
- ⭐ **User Reviews** - Rate and comment on coffee shops
- 👍 **Voting System** - Upvote your favorite spots
- 📱 **Responsive Design** - Works on all devices
- 💾 **Persistent Storage** - Data stored in Airtable

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Airtable
- **APIs**: Google Maps (via SerpApi), Unsplash
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for SerpApi, Unsplash, and Airtable

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd discover-coffee-stores-main
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```
SERP_API_KEY=your_serp_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
AIRTABLE_TOKEN=your_airtable_token
AIRTABLE_BASE_ID=your_airtable_base_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Run the development server
```bash
npm run dev
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add all environment variables from `.env.local` to Vercel dashboard
3. Set `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL
4. Deploy!

## API Endpoints

- `GET /api/coffee-stores` - Get coffee store by ID
- `POST /api/coffee-stores` - Create new coffee store
- `POST /api/coffee-stores/vote` - Vote for a coffee store
- `POST /api/coffee-stores/comments` - Add comments and ratings
- `GET /api/health` - Health check

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.# Comment persistence system with TypeScript fixes
