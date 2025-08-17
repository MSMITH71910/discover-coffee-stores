import { AirtableRecordType, CoffeeStoreType } from '@/types';

var Airtable = require('airtable');
var base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID || 'appN9npoXRbfVD1hC'
);

const table = base('Table 1');

const getMinifiedRecords = (records: Array<AirtableRecordType>) => {
  return records.map((record: AirtableRecordType) => {
    return {
      recordId: record.id,
      ...record.fields,
    };
  });
};

const findRecordByFilter = async (id: string) => {
  const findRecords = await table
    .select({
      filterByFormula: `{id} = "${id}"`,
    })
    .firstPage();

  return getMinifiedRecords(findRecords);
};

export const createCoffeeStore = async (
  coffeeStore: any,
  id: string
) => {
  const { 
    name, 
    address, 
    votes = 0, 
    imgUrl,
    description = '',
    rating = 0,
    totalReviews = 0,
    priceRange = '',
    offerings = '[]',
    comments = '[]',
    userRatings = '[]'
  } = coffeeStore;

  try {
    if (id) {
      const records = await findRecordByFilter(id);
      if (records.length === 0) {
        const createRecords = await table.create([
          {
            fields: {
              id,
              name,
              address,
              neighbourhood: address, // Use address as fallback for neighbourhood  
              votes: votes || 0,
              imgUrl,
              description: description || '',
              rating: rating || 0,
              totalReviews: totalReviews || 0,
              priceRange: priceRange || '',
              offerings: typeof offerings === 'string' ? offerings : JSON.stringify(offerings || []),
              comments: typeof comments === 'string' ? comments : JSON.stringify(comments || []),
              userRatings: typeof userRatings === 'string' ? userRatings : JSON.stringify(userRatings || []),
            },
          },
        ]);
        if (createRecords.length > 0) {
          return getMinifiedRecords(createRecords);
        }
      } else {
        return records;
      }
    }
  } catch (error) {
    // Handle errors silently
  }
};

export const updateCoffeeStore = async (id: string) => {
  try {
    if (id) {
      const records = await findRecordByFilter(id);
      if (records.length !== 0) {
        const record = records[0];
        const updatedVotes = (record.voting || 0) + 1;

        const updatedRecords = await table.update([
          {
            id: record.recordId,
            fields: {
              votes: updatedVotes,
            },
          },
        ]);

        if (updatedRecords.length > 0) {
          return getMinifiedRecords(updatedRecords);
        }
      }
    }
  } catch (error) {
    // Handle errors silently
  }
};

// Export additional functions for comments API
export { findRecordByFilter, getMinifiedRecords };

export const updateRecord = async (recordId: string, fields: any) => {
  try {
    const updatedRecords = await table.update([
      {
        id: recordId,
        fields,
      },
    ]);
    
    if (updatedRecords.length > 0) {
      return updatedRecords[0];
    }
    throw new Error('No records updated');
  } catch (error) {
    throw error;
  }
};
