import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const hasToken = !!process.env.AIRTABLE_TOKEN;
    const hasBaseId = !!process.env.AIRTABLE_BASE_ID;
    const tokenLength = process.env.AIRTABLE_TOKEN ? process.env.AIRTABLE_TOKEN.length : 0;
    const baseIdValue = process.env.AIRTABLE_BASE_ID || 'not set';
    
    // Test basic Airtable connection
    const testResults: any = {};
    const tablesToTest = ['Coffee Stores Reviews', 'coffee-stores', 'Table 1', 'Reviews', 'Coffee Stores'];
    
    for (const tableName of tablesToTest) {
      try {
        const Airtable = require('airtable');
        const base = new Airtable({ 
          apiKey: process.env.AIRTABLE_TOKEN 
        }).base(process.env.AIRTABLE_BASE_ID || 'appN9npoXRbfVD1hC');
        
        const table = base(tableName);
        
        // Try a simple select operation
        const records = await table.select({
          maxRecords: 1
        }).firstPage();
        
        testResults[tableName] = `Success - Found ${records.length} records`;
      } catch (error) {
        testResults[tableName] = `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    
    return NextResponse.json({
      environment_check: {
        hasToken,
        hasBaseId,
        tokenLength,
        baseIdValue,
      },
      table_tests: testResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}