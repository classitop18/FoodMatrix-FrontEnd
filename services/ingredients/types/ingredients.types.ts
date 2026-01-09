export interface Ingredient {
  id: string;
  name: string;
  category: string;
  averagePrice?: string;
  averageUnit?: string;
  defaultMeasurementUnit?: string;
  isPerishable?: boolean;
  shelfLifeDays?: number;
  createdAt: string;
}

export interface GetIngredientsParams {
  category?: string;
  search?: string;
  limit?: number;
}
