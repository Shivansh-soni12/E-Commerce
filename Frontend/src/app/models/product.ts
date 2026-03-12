export interface Product {
  _id?: string; // MongoDB ObjectId as string
  id: number; // Keep this for frontend logic, but backend will use _id
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
}
