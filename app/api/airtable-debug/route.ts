import { NextResponse } from 'next/server';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_NAME = 'tbl63q5444pDhM1Lv';

export async function GET() {
  try {
    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json({ 
        error: 'Missing config',
        AIRTABLE_BASE_ID: AIRTABLE_BASE_ID ? 'Set' : 'Missing',
        AIRTABLE_TOKEN: AIRTABLE_TOKEN ? 'Set' : 'Missing'
      }, { status: 500 });
    }

    // Try to get table schema by fetching all records
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?maxRecords=3`;
    
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Airtable response status:', response.status);
    console.log('Airtable response text:', responseText);

    if (!response.ok) {
      return NextResponse.json({
        error: 'Airtable API error',
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        url,
        config: {
          AIRTABLE_BASE_ID,
          AIRTABLE_TABLE_NAME,
          AIRTABLE_TOKEN: AIRTABLE_TOKEN ? `${AIRTABLE_TOKEN.substring(0, 10)}...` : 'Missing'
        }
      }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({
        error: 'Failed to parse response',
        responseText,
        parseError: e.message
      }, { status: 500 });
    }

    // Extract field names from records
    const fieldNames = new Set<string>();
    if (data.records) {
      data.records.forEach((record: any) => {
        if (record.fields) {
          Object.keys(record.fields).forEach(fieldName => {
            fieldNames.add(fieldName);
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        AIRTABLE_BASE_ID,
        AIRTABLE_TABLE_NAME,
        AIRTABLE_TOKEN: AIRTABLE_TOKEN ? `${AIRTABLE_TOKEN.substring(0, 10)}...` : 'Missing'
      },
      recordCount: data.records ? data.records.length : 0,
      availableFields: Array.from(fieldNames).sort(),
      sampleRecords: data.records ? data.records.map((r: any) => ({
        id: r.id,
        fields: r.fields
      })) : [],
      rawResponse: data
    });

  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      config: {
        AIRTABLE_BASE_ID,
        AIRTABLE_TABLE_NAME,
        AIRTABLE_TOKEN: AIRTABLE_TOKEN ? `${AIRTABLE_TOKEN.substring(0, 10)}...` : 'Missing'
      }
    }, { status: 500 });
  }
}

// Also test a simple create operation to see what fails
export async function POST() {
  try {
    const createUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const testData = {
      records: [
        {
          fields: {
            id: 'debug-test-123',
            name: 'Debug Test Store',
            address: '123 Debug Street',
            neighbourhood: 'Debug District',
            votes: 0,
            imgUrl: 'https://example.com/image.jpg'
          }
        }
      ]
    };

    console.log('Attempting to create:', testData);

    const response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const responseText = await response.text();
    console.log('Create response status:', response.status);
    console.log('Create response text:', responseText);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      request: testData,
      response: responseText,
      url: createUrl
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Create test failed',
      message: error.message
    }, { status: 500 });
  }
}