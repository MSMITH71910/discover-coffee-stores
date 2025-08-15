# ☕ Discover Coffee Stores

A modern, location-based coffee shop discovery application built with Next.js 15 and TypeScript. Find the perfect coffee spot near you with real-time data, beautiful imagery, and detailed store information.

![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![React](https://img.shields.io/badge/React-19.0.0-61dafb)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000)

## 🌟 Features

- **🗺️ Location-Based Discovery**: Find coffee shops near your current location or any specified area
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **🖼️ High-Quality Images**: Beautiful coffee shop photos powered by Unsplash API
- **🔍 Real-Time Search**: Live coffee shop data via Google Maps integration through SERP API
- **📊 Store Details**: Comprehensive information including addresses, ratings, and more
- **⚡ Performance Optimized**: Built with Next.js 15 for lightning-fast loading
- **🛡️ Type-Safe**: Full TypeScript implementation for robust development
- **🧪 Well-Tested**: Comprehensive test suite with Jest and React Testing Library

## 🚀 Live Demo

Visit the live application: [https://discover-coffee-stores-pied.vercel.app](https://discover-coffee-stores-pied.vercel.app)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.2** - React framework with App Router
- **React 19.0.0** - UI library with latest features
- **TypeScript 5.6.3** - Type-safe development
- **Tailwind CSS 3.4.1** - Utility-first styling
- **React Hook Form** - Form state management

### Backend & APIs
- **SERP API** - Google Maps coffee shop data
- **Unsplash API** - High-quality coffee shop imagery
- **Mapbox API** - Geocoding and location services  
- **Airtable** - Cloud database for store data persistence

### Development & Testing
- **Jest 29.7.0** - JavaScript testing framework
- **React Testing Library** - Component testing utilities
- **TypeScript ESLint** - Code quality and consistency
- **Husky** - Git hooks for quality control

## 📋 Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- API keys for external services (see setup below)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd discover-coffee-stores
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Required API Keys
   SERP_API_KEY=your_serpapi_key_here
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   MAPBOX_API=your_mapbox_access_token_here
   
   # Airtable Configuration
   AIRTABLE_TOKEN=your_airtable_personal_access_token
   AIRTABLE_BASE_ID=your_airtable_base_id
   ```

4. **API Keys Setup Guide**

   **SERP API** (Google Maps Data)
   - Visit [serpapi.com](https://serpapi.com)
   - Sign up for a free account (100 searches/month free)
   - Copy your API key

   **Unsplash API** (Coffee Shop Images)
   - Visit [unsplash.com/developers](https://unsplash.com/developers)
   - Create a new application
   - Copy your Access Key

   **Mapbox API** (Geocoding)
   - Visit [mapbox.com](https://www.mapbox.com)
   - Sign up and create a new token
   - Copy your access token

   **Airtable** (Data Storage)
   - Visit [airtable.com](https://airtable.com)
   - Create a base with coffee store data
   - Generate a personal access token

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📁 Project Structure

```
discover-coffee-stores/
├── app/                    # Next.js 15 App Router
│   ├── coffee-store/      # Coffee store pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── lib/                   # Core business logic
│   └── coffee-stores.ts   # API integration functions
├── types/                 # TypeScript type definitions
├── __tests__/             # Test suites
│   ├── app/              # Component tests
│   ├── lib/              # Logic tests
│   └── api/              # API tests
├── public/                # Static assets
└── components/            # Reusable UI components
```

## 🔧 Key Features Implementation

### Location-Based Discovery
The application uses the browser's Geolocation API combined with SERP API to fetch real-time coffee shop data based on the user's current location or specified coordinates.

### Error Handling & Fallbacks
Robust error handling ensures the application gracefully degrades when external APIs are unavailable, providing fallback data and maintaining functionality.

### Performance Optimization
- Server-side rendering with Next.js 15
- Image optimization with Next.js Image component
- API response caching strategies
- Efficient re-rendering with React 19

### Type Safety
Complete TypeScript implementation with strict type checking, ensuring robust development and fewer runtime errors.

## 🚀 Deployment

This application is optimized for deployment on Vercel:

1. **Connect your repository** to Vercel
2. **Set environment variables** in your Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your application

### Environment Variables for Production
Ensure all API keys are configured in your Vercel environment settings:
- `SERP_API_KEY`
- `UNSPLASH_ACCESS_KEY` 
- `MAPBOX_API`
- `AIRTABLE_TOKEN`
- `AIRTABLE_BASE_ID`

## 🧪 Testing Strategy

The application includes comprehensive test coverage:

- **Unit Tests**: Core business logic and utility functions
- **Integration Tests**: API endpoints and data fetching
- **Component Tests**: React component behavior and rendering
- **Error Scenario Tests**: Graceful handling of API failures

Run `npm test` to execute the full test suite.

## 📈 Performance & Scalability

### Optimization Techniques
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Caching Strategies**: API response caching and memoization
- **Bundle Analysis**: Regular bundle size monitoring

### Scalability Considerations
- **API Rate Limiting**: Intelligent request batching and caching
- **Error Boundaries**: Graceful failure handling
- **Database Optimization**: Efficient Airtable queries
- **CDN Integration**: Static asset delivery via Vercel Edge Network

## 🤝 Contributing

While this is primarily a personal project, suggestions and feedback are welcome. Please ensure all contributions maintain the existing code quality standards and include appropriate tests.

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 👨‍💻 About the Developer

**Michael R Smith**  
*SmithDev Labs*

Experienced full-stack developer specializing in modern web technologies, with expertise in React ecosystem, TypeScript, and cloud-native applications. Passionate about creating performant, user-centric web experiences.

---

### 🔗 Connect with SmithDev Labs

Building innovative web solutions with cutting-edge technology stacks. Focused on performance, scalability, and exceptional user experiences.

---

*Built with ❤️ and lots of ☕ by SmithDev Labs*