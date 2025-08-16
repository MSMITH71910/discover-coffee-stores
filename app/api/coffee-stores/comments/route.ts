import { NextRequest, NextResponse } from 'next/server';
import { findRecordByFilter, updateRecord, createCoffeeStore } from '@/lib/airtable';

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
          votes: 0,
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

export async function GET() {
  return NextResponse.json({ message: 'Comments API endpoint is working' });
}