import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Order, OrderStatus } from "../models/order";
import { Observable, BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class OrderMgmt {
  private apiUrl = 'http://localhost:5000/api/orders';

  private ordersSubject = new BehaviorSubject<any[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}

  
  getOrdersForUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(orders => this.ordersSubject.next(orders))
    );
  }

  
  updateOrderStatus(orderId: string, status: string | OrderStatus): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${orderId}/status`, { status }).pipe(
      tap(() => {
        const currentOrders = this.ordersSubject.value;
        const updatedOrders = currentOrders.map(order => {
          const id = order._id || order.id;
          if (id === orderId) {
            return { ...order, status: status };
          }
          return order;
        });
        this.ordersSubject.next(updatedOrders);
      })
    );
  }

cancelOrder(id: string, reason: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}/${id}/status`, {
    status: 'cancelled', 
    reason: reason
  }).pipe(
    tap(() => {
      const currentOrders = this.ordersSubject.value;
      const updated = currentOrders.map(o => 
        (o._id === id || o.id === id) ? { ...o, status: 'cancelled' } : o
      );
      this.ordersSubject.next(updated);
    })
  );
}

  public getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/detail/${id}`, { withCredentials: true });
  }

public returnOrder(id: string): Observable<Order> {
  
  return this.http.patch<Order>(`${this.apiUrl}/${id}/return`, {}, { withCredentials: true }).pipe(
    tap(updatedOrder => {
      const currentOrders = this.ordersSubject.value;
      const updated = currentOrders.map(o => 
        (o._id === id || o.id === id) ? updatedOrder : o
      );
      this.ordersSubject.next(updated);
    })
  );
}

  getStats(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/${userId}`, { withCredentials: true });
  }

  
  placeOrder(userId: string): Observable<any> {
    const url = `http://localhost:5000/api/cart/${userId}/place-order`;
    return this.http.post(url, {}, { withCredentials: true });
  }

 
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, orderData);
  }
}