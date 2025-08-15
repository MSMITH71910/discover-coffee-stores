import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envStatus = {
      MAPBOX_API: !!process.env.MAPBOX_API,
      UNSPLASH_ACCESS_KEY: !!process.env.UNSPLASH_ACCESS_KEY,
      SERP_API_KEY: !!process.env.SERP_API_KEY,
      AIRTABLE_TOKEN: !!process.env.AIRTABLE_TOKEN,
      AIRTABLE_BASE_ID: !!process.env.AIRTABLE_BASE_ID
    };

    const missingEnvs = Object.entries(envStatus)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    const status = {
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      envVariables: envStatus,
      missingEnvVars: missingEnvs,
      allEnvsPresent: missingEnvs.length === 0,
      buildInfo: {
        nextVersion: '15.3.2',
        nodeVersion: process.version
      }
    };

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Health check failed', message: error.message },
      { status: 500 }
    );
  }
}