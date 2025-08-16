import { NextResponse } from 'next/server';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_NAME = 'Table 1';

// GET - Retrieve comments for a specific coffee store
export async function GET(request: Request) {
  console.log('🔍 COMMENTS GET - Direct retrieval endpoint');
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Coffee store ID required' }, { status: 400 });
    }

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json({ error: 'Airtable configuration missing' }, { status: 500 });
    }

    // Direct Airtable API call to get all fields
    const filterFormula = encodeURIComponent(`{id}="${id}"`);
    const findUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?filterByFormula=${filterFormula}`;
    
    console.log('🔍 COMMENTS GET - Fetching from URL:', findUrl);
    
    const findResponse = await fetch(findUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!findResponse.ok) {
      console.error('🔍 COMMENTS GET - Airtable API error:', findResponse.status);
      throw new Error(`Airtable API error: ${findResponse.status}`);
    }

    const findData = await findResponse.json();
    console.log('🔍 COMMENTS GET - Records found:', findData.records?.length || 0);
    
    if (findData.records && findData.records.length > 0) {
      const record = findData.records[0];
      console.log('🔍 COMMENTS GET - Record fields:', Object.keys(record.fields));
      console.log('🔍 COMMENTS GET - Comments field:', record.fields.comments);
      
      return NextResponse.json({
        success: true,
        id: record.fields.id,
        comments: record.fields.comments || '[]',
        userRatings: record.fields.userRatings || '[]',
        votes: record.fields.votes || 0,
        recordId: record.id,
        _debug: {
          hasComments: !!record.fields.comments,
          commentsLength: record.fields.comments ? record.fields.comments.length : 0,
          allFields: Object.keys(record.fields)
        }
      });
    }
    
    console.log('🔍 COMMENTS GET - No records found');
    return NextResponse.json({ 
      success: false,
      error: 'Coffee store not found',
      comments: '[]',
      userRatings: '[]'
    }, { status: 404 });
    
  } catch (error: any) {
    console.error('🔍 COMMENTS GET - Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch comments',
      comments: '[]',
      userRatings: '[]'
    }, { status: 500 });
  }
}