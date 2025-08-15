import { NextResponse } from 'next/server';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_NAME = 'tbl63q5444pDhM1Lv';

export async function GET(request: Request) {
  try {
    console.log('=== AIRTABLE DEBUG START ===');
    console.log('Base ID:', AIRTABLE_BASE_ID);
    console.log('Table Name:', AIRTABLE_TABLE_NAME);
    console.log('Token exists:', !!AIRTABLE_TOKEN);
    
    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json({ 
        error: 'Missing config',
        baseId: !!AIRTABLE_BASE_ID,
        token: !!AIRTABLE_TOKEN
      }, { status: 500 });
    }

    // Test 1: Get table schema/fields
    const schemaUrl = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;
    
    console.log('Schema URL:', schemaUrl);
    
    const schemaResponse = await fetch(schemaUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Schema response status:', schemaResponse.status);
    
    let schemaData = null;
    if (schemaResponse.ok) {
      schemaData = await schemaResponse.json();
      console.log('Schema data:', JSON.stringify(schemaData, null, 2));
    } else {
      const schemaError = await schemaResponse.text();
      console.log('Schema error:', schemaError);
    }

    // Test 2: List existing records
    const listUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?maxRecords=3`;
    
    console.log('List URL:', listUrl);
    
    const listResponse = await fetch(listUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('List response status:', listResponse.status);
    
    let listData = null;
    if (listResponse.ok) {
      listData = await listResponse.json();
      console.log('List data:', JSON.stringify(listData, null, 2));
    } else {
      const listError = await listResponse.text();
      console.log('List error:', listError);
    }

    // Test 3: Try filter formula
    const testId = 'test123';
    const filterUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={id}="${testId}"`;
    
    console.log('Filter URL:', filterUrl);
    
    const filterResponse = await fetch(filterUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Filter response status:', filterResponse.status);
    
    let filterData = null;
    if (filterResponse.ok) {
      filterData = await filterResponse.json();
      console.log('Filter data:', JSON.stringify(filterData, null, 2));
    } else {
      const filterError = await filterResponse.text();
      console.log('Filter error:', filterError);
    }

    // Test 4: Try creating a simple record
    const createUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const testRecord = {
      records: [
        {
          fields: {
            id: 'debug-test-' + Date.now(),
            name: 'Debug Test Store',
            address: '123 Test St',
            neighbourhood: 'Test Area',
            votes: 0,
            imgUrl: 'https://example.com/test.jpg'
          }
        }
      ]
    };

    console.log('Create URL:', createUrl);
    console.log('Test record:', JSON.stringify(testRecord, null, 2));
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRecord)
    });

    console.log('Create response status:', createResponse.status);
    
    let createData = null;
    if (createResponse.ok) {
      createData = await createResponse.json();
      console.log('Create success:', JSON.stringify(createData, null, 2));
    } else {
      const createError = await createResponse.text();
      console.log('Create error:', createError);
    }

    console.log('=== AIRTABLE DEBUG END ===');

    return NextResponse.json({
      config: {
        baseId: AIRTABLE_BASE_ID,
        tableName: AIRTABLE_TABLE_NAME,
        tokenExists: !!AIRTABLE_TOKEN
      },
      schema: {
        status: schemaResponse.status,
        data: schemaData
      },
      list: {
        status: listResponse.status,
        data: listData
      },
      filter: {
        status: filterResponse.status,
        data: filterData,
        url: filterUrl
      },
      create: {
        status: createResponse.status,
        data: createData,
        testRecord: testRecord
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      message: error.message 
    }, { status: 500 });
  }
}