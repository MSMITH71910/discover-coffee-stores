import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const hasToken = !!process.env.AIRTABLE_TOKEN;
    const hasBaseId = !!process.env.AIRTABLE_BASE_ID;
    const tokenLength = process.env.AIRTABLE_TOKEN ? process.env.AIRTABLE_TOKEN.length : 0;
    const baseIdValue = process.env.AIRTABLE_BASE_ID || 'not set';
    
    // Test basic Airtable connection
    let airtableTest = 'not tested';
    try {
      const Airtable = require('airtable');
      const base = new Airtable({ 
        apiKey: process.env.AIRTABLE_TOKEN 
      }).base(process.env.AIRTABLE_BASE_ID || 'appN9npoXRbfVD1hC');
      
      const table = base('Coffee Stores Reviews');
      
      // Try a simple select operation
      const records = await table.select({
        maxRecords: 1
      }).firstPage();
      
      airtableTest = `Success - Found ${records.length} records`;
    } catch (error) {
      airtableTest = `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
    
    return NextResponse.json({
      environment_check: {
        hasToken,
        hasBaseId,
        tokenLength,
        baseIdValue,
      },
      airtable_test: airtableTest,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}