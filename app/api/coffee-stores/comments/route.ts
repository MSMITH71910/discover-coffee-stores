import { NextRequest, NextResponse } from 'next/server';
import { findRecordByFilter, updateRecord } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { id, comments, userRatings } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Coffee store ID is required' }, { status: 400 });
    }

    const records = await findRecordByFilter(`{id} = "${id}"`);
    
    if (records.length === 0) {
      return NextResponse.json({ message: 'Coffee store not found' }, { status: 404 });
    }

    const record = records[0];

    const updateData = {
      comments: JSON.stringify(comments || []),
      userRatings: JSON.stringify(userRatings || [])
    };

    const updatedRecord = await updateRecord(record.recordId, updateData);

    return NextResponse.json({
      message: 'Comments updated successfully',
      recordId: record.recordId
    });

  } catch (error) {
    return NextResponse.json(
      { 
        message: 'Failed to update comments',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Comments API endpoint is working' });
}