import { NextResponse } from 'next/server';
import { findRecordByFilter } from '@/lib/airtable';

// Debug endpoint to see exactly what's in Airtable for a given coffee store ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Use the same function that our main API uses
    const records = await findRecordByFilter(id);
    
    if (records.length > 0) {
      const record = records[0];
      return NextResponse.json({
        success: true,
        id: id,
        foundRecords: records.length,
        recordData: record,
        allFieldKeys: Object.keys(record),
        comments: record.comments,
        userRatings: record.userRatings,
        hasComments: !!record.comments,
        hasUserRatings: !!record.userRatings,
        commentsType: typeof record.comments,
        userRatingsType: typeof record.userRatings
      });
    } else {
      return NextResponse.json({
        success: false,
        id: id,
        foundRecords: 0,
        message: 'No records found'
      });
    }
    
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}