import { fetchCoffeeStores } from '@/lib/coffee-stores';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable all caching

export async function GET(request: NextRequest) {
  try {
    // Security: Validate API keys are present (but don't log them)
    if (!process.env.SERP_API_KEY || !process.env.UNSPLASH_ACCESS_KEY) {
      console.error('Missing required API keys');
      return NextResponse.json({ error: 'Service configuration error' }, {
        status: 500,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const longLat = searchParams.get('longLat') || '';
    const limit = searchParams.get('limit') || '';

    // Security: Validate input parameters
    if (!longLat.match(/^-?\d+\.?\d*,-?\d+\.?\d*$/)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, {
        status: 400,
      });
    }

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
      return NextResponse.json({ error: 'Invalid limit (1-20)' }, {
        status: 400,
      });
    }

    if (longLat) {
      console.log('🚀 API: getCoffeeStoresByLocation called at', new Date().toISOString(), 'with coordinates:', longLat);
      const coffeeStores = await fetchCoffeeStores(longLat, limitNum);
      console.log('✅ API: fetchCoffeeStores returned', coffeeStores?.length || 0, 'results');
      // Ensure we always return an array and never expose API keys
      return NextResponse.json(Array.isArray(coffeeStores) ? coffeeStores : []);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    // Security: Don't expose internal error details
    console.error('API Error (details hidden from client):', error);
    return NextResponse.json({ error: 'Internal server error' }, {
      status: 500,
    });
  }
}
