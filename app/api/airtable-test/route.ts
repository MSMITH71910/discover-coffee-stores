import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    
    console.log('Testing Airtable connection...');
    console.log('Base ID:', AIRTABLE_BASE_ID ? 'Set' : 'Missing');
    console.log('Token:', AIRTABLE_TOKEN ? 'Set (length: ' + AIRTABLE_TOKEN.length + ')' : 'Missing');
    
    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json({ 
        error: 'Airtable configuration missing',
        baseId: !!AIRTABLE_BASE_ID,
        token: !!AIRTABLE_TOKEN
      }, { status: 500 });
    }

    // Test with the correct table ID from your URL
    const tableId = 'tblDEV9W7lkoSexsf';  // From your Airtable URL
    const testUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}?maxRecords=1`;
    
    console.log('Testing URL:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Airtable API error: ${response.status}`,
        status: response.status,
        body: responseText,
        url: testUrl
      }, { status: 500 });
    }

    const data = JSON.parse(responseText);
    
    return NextResponse.json({
      success: true,
      message: 'Airtable connection working!',
      baseId: AIRTABLE_BASE_ID,
      tableId: tableId,
      recordCount: data.records ? data.records.length : 0,
      records: data.records || [],
      schema: data.records && data.records.length > 0 ? Object.keys(data.records[0].fields) : []
    });

  } catch (error: any) {
    console.error('Airtable test error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}