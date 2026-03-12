export interface CartItem {
  productId: string; 
  name: string;
  price: number;
  quantity: number;
  image?: string;
  id?: any;      
  _id?: any;     
}

export interface User { 
  _id?:string;
  id?: number| string; 
  name: string; 
  email: string; 
  password: string; 
  shippingAddress?: string; 
  paymentDetails?: string; 
  cart: CartItem[];        
  wishlist: CartItem[];    
  role: 'user' | 'admin'; 
}



export const MOCK_USERS: User[] = [
  {
    id: 0,
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'Admin1234@',
    role: 'admin',
    cart: [],        
    wishlist: [] 
  },
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'John1234@',
    shippingAddress: '123 Street, Kolkata',
    paymentDetails: 'UPI John@upi',
    cart: [{
      id: 1,
      name: 'Wireless Headphones',
      price: 2000,
      quantity: 2,
      productId: ""
    }],
    wishlist: [],
    role: 'user'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Jane1234@',
    shippingAddress: '456 Avenue, noida',
    paymentDetails: 'Mastercard **** 5678',
    cart: [],
    wishlist: [],
    role: 'user'
  },
  {
    id: 3,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'Alic1234@',
    shippingAddress: '789 Road, coimbatore',
    paymentDetails: 'UPI alice@upi',
    cart: [],
    wishlist: [],
    role: 'user'
  },
];
