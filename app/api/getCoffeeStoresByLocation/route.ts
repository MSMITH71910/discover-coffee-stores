import { fetchCoffeeStores } from '@/lib/coffee-stores';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const longLat = searchParams.get('longLat') || '';
    const limit = searchParams.get('limit') || '';

    if (longLat) {
      const coffeeStores = await fetchCoffeeStores(longLat, parseInt(limit));
      // Ensure we always return an array
      return NextResponse.json(Array.isArray(coffeeStores) ? coffeeStores : []);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    console.error('There is an error', error);
    return NextResponse.json([], {
      status: 500,
    });
  }
}
