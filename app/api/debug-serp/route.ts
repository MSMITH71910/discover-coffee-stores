import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryId = searchParams.get('id') || '0';
  
  try {
    const Delaware_County_LONG_LAT = '39.9078,-75.4348';
    const [lat, lng] = Delaware_County_LONG_LAT.split(',');
    const serpApiUrl = `https://serpapi.com/search.json?engine=google_maps&q=coffee+shop&ll=@${lat},${lng},15z&type=search&api_key=${process.env.SERP_API_KEY}`;
    
    const response = await fetch(serpApiUrl);
    const data = await response.json();
    const localResults = data.local_results || [];
    
    const qIdx = parseInt(queryId) || 0;
    const result = localResults[qIdx];
    
    if (result) {
      return NextResponse.json({
        success: true,
        index: qIdx,
        coffeeShop: {
          title: result.title,
          address: result.address,
          description: result.description,
          rating: result.rating,
          reviews: result.reviews,
          price: result.price,
          place_id: result.place_id
        },
        totalResults: localResults.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No coffee shop found at index ' + qIdx,
        totalResults: localResults.length,
        availableIndexes: localResults.map((r: any, i: number) => `${i}: ${r.title}`)
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.SERP_API_KEY
    });
  }
}