import { NextResponse } from 'next/server';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_NAME = 'tbl63q5444pDhM1Lv';

// GET - Check coffee store vote status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Coffee store ID required' }, { status: 400 });
    }

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json({ error: 'Airtable configuration missing' }, { status: 500 });
    }

    // Search for existing record
    const findUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=AND({id}="${id}")`;
    
    const findResponse = await fetch(findUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!findResponse.ok) {
      throw new Error(`Airtable API error: ${findResponse.status} - ${findResponse.statusText}`);
    }

    const findData = await findResponse.json();
    
    return NextResponse.json({
      success: true,
      id,
      recordExists: findData.records && findData.records.length > 0,
      recordCount: findData.records ? findData.records.length : 0,
      record: findData.records && findData.records.length > 0 ? {
        id: findData.records[0].fields.id,
        name: findData.records[0].fields.name,
        votes: findData.records[0].fields.votes || 0,
        recordId: findData.records[0].id
      } : null,
      airtableResponse: findData
    });
    
  } catch (error: any) {
    console.error('Error checking coffee store:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      id: new URL(request.url).searchParams.get('id')
    }, { status: 500 });
  }
}