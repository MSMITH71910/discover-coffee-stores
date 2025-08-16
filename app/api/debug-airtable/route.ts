import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const hasToken = !!process.env.AIRTABLE_TOKEN;
    const hasBaseId = !!process.env.AIRTABLE_BASE_ID;
    const tokenLength = process.env.AIRTABLE_TOKEN ? process.env.AIRTABLE_TOKEN.length : 0;
    const baseIdValue = process.env.AIRTABLE_BASE_ID || 'not set';
    
    // Test Table 1 and show field structure
    let tableTest = 'not tested';
    let fieldStructure = {};
    
    try {
      const Airtable = require('airtable');
      const base = new Airtable({ 
        apiKey: process.env.AIRTABLE_TOKEN 
      }).base(process.env.AIRTABLE_BASE_ID || 'appN9npoXRbfVD1hC');
      
      const table = base('Table 1');
      
      // Get first record to see field structure
      const records = await table.select({
        maxRecords: 1
      }).firstPage();
      
      if (records.length > 0) {
        fieldStructure = {
          recordId: records[0].id,
          fields: Object.keys(records[0].fields || {}),
          fieldValues: records[0].fields
        };
        tableTest = `Success - Found ${records.length} records`;
      } else {
        tableTest = 'Success - No records found';
      }
    } catch (error) {
      tableTest = `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
    
    return NextResponse.json({
      environment_check: {
        hasToken,
        hasBaseId,
        tokenLength,
        baseIdValue,
      },
      table_test: tableTest,
      field_structure: fieldStructure,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}