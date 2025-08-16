import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const Airtable = require('airtable');
    const base = new Airtable({ 
      apiKey: process.env.AIRTABLE_TOKEN 
    }).base(process.env.AIRTABLE_BASE_ID || 'appN9npoXRbfVD1hC');
    
    // Try some common table names
    const possibleNames = [
      'Table 1',
      'Coffee Stores Reviews', 
      'coffee-stores',
      'Coffee Stores',
      'Reviews',
      'CoffeeStores',
      'Main'
    ];
    
    const results = [];
    
    for (const tableName of possibleNames) {
      try {
        const table = base(tableName);
        const records = await table.select({ maxRecords: 1 }).firstPage();
        results.push({
          tableName,
          status: 'SUCCESS',
          recordCount: records.length,
          firstRecordFields: records[0]?.fields ? Object.keys(records[0].fields) : []
        });
      } catch (error) {
        results.push({
          tableName,
          status: 'ERROR',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return NextResponse.json({
      baseId: process.env.AIRTABLE_BASE_ID,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}