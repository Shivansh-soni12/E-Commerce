// import { HttpClient } from "@angular/common/http";
// import { Injectable } from "@angular/core";
// import { Order } from "../models/order";
// import { Observable } from "rxjs/internal/Observable";
// import { map } from "rxjs/internal/operators/map";

// @Injectable({ providedIn: 'root' })
// export class OrderMgmt {
//   [x: string]: any;
//   private apiUrl = 'http://localhost:5000/api/orders';

//   constructor(private http: HttpClient) {}
// getOrdersForUser(userId: string): Observable<Order[]> {
//   return this.http.get<any[]>(`${this.apiUrl}/${userId}`, { withCredentials: true }).pipe(
//     map(orders => orders.map(o => ({
//       ...o,
//       id: o._id // Seamlessly map Order ID
//     })))
//   );
// }

//   placeOrder(userId: string) {
//     return this.http.post(`http://localhost:5000/api/cart/${userId}/place-order`, {}, { withCredentials: true });
//   }

//   public getOrderById(id: string): Observable<Order> {
//   return this.http.get<Order>(`${this["orderUrl"]}/detail/${id}`, { withCredentials: true });
// }

// public cancelOrder(id: string): Observable<any> {
//   return this.http.patch(`${this["orderUrl"]}/${id}/cancel`, {}, { withCredentials: true });
// }

// // In order-mgmt.ts
// returnOrder(id: string): Observable<Order> {
//   return this.http.patch<Order>(`${this.apiUrl}/${id}/return`, {});
// }

// }


import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Order } from "../models/order";
import { Observable } from "rxjs"; // Cleaned up import
import { map, tap } from "rxjs/operators"; // Cleaned up import
import { BehaviorSubject } from "rxjs"; // For state management if needed

@Injectable({ providedIn: 'root' })
export class OrderMgmt {
  private apiUrl = 'http://localhost:5000/api/orders';

  private ordersSubject = new BehaviorSubject<any[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}


  // 1. ADDED: This fixes the "getStats is not a function" error
  getStats(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/${userId}`, { withCredentials: true });
  }

  // 2. FIXED: Place Order now returns the Observable correctly
placeOrder(userId: string): Observable<any> {
  console.log("Service: Attempting to call BACKEND for User:", userId);
  
  // FIXED URL: Your backend route is router.post("/:userId/place-order") inside cartRoutes
  // If your main server.js uses app.use('/api/cart', cartRoutes), then use this:
  const url = `http://localhost:5000/api/cart/${userId}/place-order`;
  
  return this.http.post(url, {}, { withCredentials: true });
}

getOrdersForUser(userId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
}

  // 3. FIXED: Changed this["orderUrl"] to this.apiUrl
  public getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/detail/${id}`, { withCredentials: true });
  }

// Inside your OrderMgmt service
public cancelOrder(id: string, reason: string) {
  // Use the /status endpoint defined in your Express routes
  return this.http.patch(`${this.apiUrl}/${id}/status`, { 
    status: 'cancelled',
    reason: reason 
  });
}
  public returnOrder(id: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/return`, {}, { withCredentials: true });
  }
}