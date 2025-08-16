import { NextResponse } from 'next/server';
import { findRecordByFilter } from '@/lib/airtable';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || 'field-test-123';
    
    // Use our existing function to find the record
    const records = await findRecordByFilter(id);
    
    if (records.length > 0) {
      const record = records[0];
      
      return NextResponse.json({
        message: 'Record found!',
        recordId: record.recordId,
        allFields: record,
        specificFields: {
          id: record.id,
          name: record.name,
          comments: record.comments,
          userRatings: record.userRatings,
          hasComments: !!record.comments,
          hasUserRatings: !!record.userRatings,
          commentsType: typeof record.comments,
          userRatingsType: typeof record.userRatings
        }
      });
    } else {
      return NextResponse.json({
        message: 'No record found',
        searchedId: id
      });
    }
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}