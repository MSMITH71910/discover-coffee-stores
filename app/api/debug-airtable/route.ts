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
      
      // Get all records to see field structure
      const records = await table.select({
        maxRecords: 5
      }).firstPage();
      
      if (records.length > 0) {
        fieldStructure = records.map((record, index) => ({
          recordNum: index + 1,
          recordId: record.id,
          fields: Object.keys(record.fields || {}),
          fieldValues: record.fields
        }));
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