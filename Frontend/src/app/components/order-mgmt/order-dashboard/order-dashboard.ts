import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderMgmt } from '../../../services/order-mgmt';
import { UserService } from '../../../services/user-service';
import { RouterLink, RouterModule, RouterOutlet } from "@angular/router"; 
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core'; 
import { OrderStatus } from '../../../models/order';

@Component({
  selector: 'app-order-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterModule],
  templateUrl: './order-dashboard.html',
  styleUrls: ['./order-dashboard.css'] 
})
export class OrderDashboard implements OnInit, OnDestroy {
  stats = {
    totalOrders: 0,
    pendingCount: 0
  };
  today = new Date();
  private userSub!: Subscription;

  constructor(
    private orderMgmt: OrderMgmt,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userSub = this.userService.currentUser$.pipe(
      filter(user => !!user && (!!user._id || !!user.id))
    ).subscribe(user => {
      const userId = user!._id || user!.id;
      
      this.orderMgmt.getOrdersForUser(String(userId)).subscribe({
        next: (orders: any[]) => {
          const now = new Date();
          let total = orders.length;
          let pending = 0;

          orders.forEach(order => {
            
            const orderDate = new Date(order.createdAt || order.date);
            const etaDate = new Date(orderDate);
            etaDate.setDate(orderDate.getDate() + 2);

            let status = (order.status || '').toLowerCase();

            
            if (now.getTime() > etaDate.getTime()) {
              if (status === 'pending' || status === 'shipped') {
                status = 'delivered';
               
                this.orderMgmt.updateOrderStatus(order._id || order.id, OrderStatus.Delivered).subscribe();
              }
            }

            
            if (status === 'pending' || status === 'shipped') {
              pending++;
            }
          });

          this.stats = {
            totalOrders: total,
            pendingCount: pending
          };
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error("Dashboard Stats Error:", err)
      });
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}