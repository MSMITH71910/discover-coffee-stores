import { NextResponse } from 'next/server';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_NAME = 'tbl63q5444pDhM1Lv'; // Updated to correct table ID

// POST - Upvote a coffee store
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coffee store ID required' }, { status: 400 });
    }

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json({ error: 'Airtable configuration missing' }, { status: 500 });
    }

    // Find the existing record
    const findUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={id}="${id}"`;
    
    const findResponse = await fetch(findUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!findResponse.ok) {
      throw new Error(`Airtable find error: ${findResponse.status}`);
    }

    const findData = await findResponse.json();
    
    if (!findData.records || findData.records.length === 0) {
      return NextResponse.json({ error: 'Coffee store not found' }, { status: 404 });
    }

    const record = findData.records[0];
    const currentVotes = record.fields.voting || 0;
    const newVotes = currentVotes + 1;

    // Update the record with new vote count
    const updateUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            id: record.id,
            fields: {
              voting: newVotes
            }
          }
        ]
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Airtable update error: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();
    const updatedRecord = updateData.records[0];
    
    return NextResponse.json({
      id: updatedRecord.fields.id,
      name: updatedRecord.fields.name,
      address: updatedRecord.fields.address,
      neighbourhood: updatedRecord.fields.neighbourhood,
      votes: updatedRecord.fields.voting,
      imgUrl: updatedRecord.fields.imgUrl,
      recordId: updatedRecord.id
    });

  } catch (error) {
    console.error('Error voting for coffee store:', error);
    return NextResponse.json({ error: 'Failed to vote for coffee store' }, { status: 500 });
  }
}