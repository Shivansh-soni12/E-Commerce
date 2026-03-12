export enum OrderStatus {
  Pending = 'Pending',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Returned = 'Returned',
  Fulfilled = 'Fulfilled'
}

export interface OrderItem {
  productId: number; 
  quantity: number;
  priceAtPurchase: number;
  
}

export interface Order {
  id: string;
  _id?: string;
  status: OrderStatus;
  totalAmount: number;
  date?: any;
  createdAt?: any;          
  shippingAddress?: string; 
  paymentMethod?: string;   
  items?: any[];
  productDetails?: any[];
  userId?: string;
}