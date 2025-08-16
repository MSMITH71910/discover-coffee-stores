import { NextResponse } from 'next/server';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_NAME = 'Table 1'; // Table name, not ID

interface CoffeeStore {
  id: string;
  name: string;
  address: string;
  neighbourhood: string;
  votes: number;
  imgUrl: string;
}

// GET - Retrieve a coffee store
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
    const findUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={id}="${id}"`;
    
    const findResponse = await fetch(findUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!findResponse.ok) {
      throw new Error(`Airtable API error: ${findResponse.status}`);
    }

    const findData = await findResponse.json();
    
    if (findData.records && findData.records.length > 0) {
      const record = findData.records[0];
      return NextResponse.json({
        id: record.fields.id,
        name: record.fields.name,
        address: record.fields.address,
        neighbourhood: record.fields.neighbourhood,
        votes: record.fields.votes || 0,
        imgUrl: record.fields.imgUrl,
        comments: record.fields.comments || '[]',
        userRatings: record.fields.userRatings || '[]',
        description: record.fields.description || '',
        rating: record.fields.rating || 0,
        totalReviews: record.fields.totalReviews || 0,
        priceRange: record.fields.priceRange || '',
        offerings: record.fields.offerings || '[]',
        recordId: record.id
      });
    }
    
    return NextResponse.json({ error: 'Coffee store not found' }, { status: 404 });
    
  } catch (error) {
    console.error('Error fetching coffee store:', error);
    return NextResponse.json({ error: 'Failed to fetch coffee store' }, { status: 500 });
  }
}

// POST - Create or update a coffee store
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, address, neighbourhood, imgUrl } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'Coffee store ID and name required' }, { status: 400 });
    }

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json({ error: 'Airtable configuration missing' }, { status: 500 });
    }

    // Check if record already exists
    const findUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={id}="${id}"`;
    
    const findResponse = await fetch(findUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const findData = await findResponse.json();
    
    if (findData.records && findData.records.length > 0) {
      // Return existing record
      const record = findData.records[0];
      return NextResponse.json({
        id: record.fields.id,
        name: record.fields.name,
        address: record.fields.address,
        neighbourhood: record.fields.neighbourhood,
        votes: record.fields.votes || 0,
        imgUrl: record.fields.imgUrl,
        comments: record.fields.comments || '[]',
        userRatings: record.fields.userRatings || '[]',
        description: record.fields.description || '',
        rating: record.fields.rating || 0,
        totalReviews: record.fields.totalReviews || 0,
        priceRange: record.fields.priceRange || '',
        offerings: record.fields.offerings || '[]',
        recordId: record.id
      });
    }

    // Create new record
    const createUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              id,
              name,
              address: address || '',
              neighbourhood: neighbourhood || '',
              votes: 0,
              imgUrl: imgUrl || ''
            }
          }
        ]
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Airtable create error: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    const newRecord = createData.records[0];
    
    return NextResponse.json({
      id: newRecord.fields.id,
      name: newRecord.fields.name,
      address: newRecord.fields.address,
      neighbourhood: newRecord.fields.neighbourhood,
      votes: newRecord.fields.votes || 0,
      imgUrl: newRecord.fields.imgUrl,
      recordId: newRecord.id
    });

  } catch (error) {
    console.error('Error creating/updating coffee store:', error);
    return NextResponse.json({ error: 'Failed to create/update coffee store' }, { status: 500 });
  }
}