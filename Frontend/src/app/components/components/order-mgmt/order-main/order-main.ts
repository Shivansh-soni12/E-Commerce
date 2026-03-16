import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user-service';
import { OrderMgmt } from '../../../services/order-mgmt';
import { OrderStatus } from '../../../models/order'; // Import your Enum
import { filter } from 'rxjs/operators';
 
@Component({
  selector: 'app-order-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-main.html',
  styleUrls: ['./order-main.css']
})
export class OrderMain implements OnInit {
  stats = {
    totalOrders: 0,
    pendingCount: 0
  };
 
  constructor(
    private userService: UserService,
    private orderMgmt: OrderMgmt,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit() {
    
this.orderMgmt.orders$.subscribe((orders: any[]) => {
  if (orders && orders.length > 0) {
    this.stats.totalOrders = orders.length;

    this.stats.pendingCount = orders.filter(o => {
      if (!o.status) return false;

     
      const s = String(o.status).toLowerCase().trim();
      console.log(`Order ID: ${o._id || o.id} | Status: "${s}"`);

    
      const isPendingOrShipped = (s === 'pending' || s === 'shipped');
      const isNotFinished = (s !== 'delivered' && s !== 'cancelled' && s !== 'returned' && s !== 'fulfilled');

      return isPendingOrShipped && isNotFinished;
    }).length;

    this.cdr.detectChanges();
  } else {
    this.stats.totalOrders = 0;
    this.stats.pendingCount = 0;
  }
});
  }
 
}