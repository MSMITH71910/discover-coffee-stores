import { NextRequest, NextResponse } from 'next/server';
import { findRecordByFilter, updateRecord, createCoffeeStore } from '@/lib/airtable';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_NAME = 'Table 1';

// GET - Retrieve comments for a specific coffee store
export async function GET(request: NextRequest) {
  console.log('🔍 COMMENTS GET - Direct retrieval in comments route');
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Coffee store ID required' }, { status: 400 });
    }

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json({ error: 'Airtable configuration missing' }, { status: 500 });
    }

    // Use our existing findRecordByFilter function
    const records = await findRecordByFilter(id);
    
    if (records && records.length > 0) {
      const record = records[0];
      console.log('🔍 COMMENTS GET - Record found with fields:', Object.keys(record));
      
      return NextResponse.json({
        success: true,
        id: record.id,
        comments: record.comments || '[]',
        userRatings: record.userRatings || '[]',
        votes: record.voting || 0,
        recordId: record.recordId,
        _debug: {
          hasComments: !!record.comments,
          commentsValue: record.comments,
          allFields: Object.keys(record)
        }
      });
    }
    
    console.log('🔍 COMMENTS GET - No records found for ID:', id);
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

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { id, comments, userRatings } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Coffee store ID is required' }, { status: 400 });
    }

    // Try to find existing record
    const records = await findRecordByFilter(id);
    let record;
    
    if (records.length === 0) {
      // If the record doesn't exist, create a basic one
      try {
        const basicRecord = {
          name: `Coffee Store`,
          address: 'Address not available',
          neighbourhood: 'Delaware County, PA',
          voting: 0,
          imgUrl: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
          description: 'A local coffee shop.',
          rating: 0,
          totalReviews: 0,
          priceRange: '',
          offerings: JSON.stringify(['Coffee']),
          comments: JSON.stringify([]),
          userRatings: JSON.stringify([])
        };
        
        const createdRecords = await createCoffeeStore(basicRecord, id);
        if (createdRecords && createdRecords.length > 0) {
          record = createdRecords[0];
        } else {
          throw new Error('Failed to create coffee store record');
        }
      } catch (createError) {
        return NextResponse.json({ 
          message: 'Failed to create coffee store record',
          error: createError instanceof Error ? createError.message : String(createError)
        }, { status: 500 });
      }
    } else {
      record = records[0];
    }

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if this is an Airtable authorization error
    if (errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('not authorized') || errorMessage.includes('401')) {
      return NextResponse.json(
        { message: 'Airtable authorization error. Please check API credentials.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Failed to update comments',
        error: errorMessage
      },
      { status: 500 }
    );
  }
}