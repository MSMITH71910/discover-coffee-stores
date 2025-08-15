export type CoffeeStoreType = {
  id: string;
  name: string;
  imgUrl: string;
  address: string;
  voting: number;
  // Rich data fields
  description?: string;
  rating?: number;
  totalReviews?: number;
  priceRange?: string;
  offerings?: string;
  comments?: string;
  userRatings?: string;
};

export type MapboxType = {
  id: string;
  properties: {
    address: string;
  };
  text: string;
};

export type AirtableRecordType = {
  id: string;
  recordId: string;
  fields: CoffeeStoreType;
};
