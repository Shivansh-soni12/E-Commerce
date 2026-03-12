import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { OrderMgmt } from '../../../services/order-mgmt';
import { UserService } from '../../../services/user-service';
import { filter, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderList implements OnInit {
  orders: any[] = []; 
  searchForm: FormGroup;
  currentUserId: string = '';
  totalOrdersCount: number = 0;
  pendingOrdersCount: number = 0;

  constructor(
    private orderMgmt: OrderMgmt, 
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private zone: NgZone
  ) {
    this.searchForm = this.fb.group({
      searchText: [''],
      status: ['All']
    });
  }

ngOnInit() {
  this.userService.currentUser$.subscribe((user) => {
    if (user && (user._id || user.id)) {
      this.currentUserId = String(user._id || user.id);
      console.log("✅ OrderList: User found! Fetching orders for:", this.currentUserId);
      this.fetchOrders(this.currentUserId);
    } else {
      console.warn("⚠️ OrderList: Still waiting for user data...");

    }

  });
  this.loadOrders();
}

fetchOrders(userId: string) {
  this.orderMgmt.getOrdersForUser(userId).subscribe({
    next: (data: any[]) => {
      this.zone.run(() => {
  if (data.length > 0) {
    const mappedOrders = data.map((order: any) => ({
      id: order._id || order.id, 
      status: order.status || 'pending',
      date: order.createdAt || order.date,
      totalAmount: order.totalAmount || 0,
      productDetails: (order.items || order.productDetails || []).map((item: any) => ({
        name: item.name || 'Unknown Product',
        quantity: item.quantity || 1,
imageUrl: item.imageUrl || 'https://via.placeholder.com/150'      }))
    }));

    setTimeout(() => {
      this.orders = mappedOrders;
      console.log("✅ UI Updated with 9 orders");
      this.cdr.detectChanges(); 
    });
  }
});
    }
  });
}

loadOrders() {
    const userId = this.route.snapshot.paramMap.get('userId'); 

    if (!userId) {
      console.error("No userId found in URL path");
      return;
    }

    this.orderMgmt.getOrdersForUser(userId).subscribe({
      next: (data: any[]) => {
        this.orders = data.map(order => ({
          ...order,
          id: order._id || order.id
        }));

        this.totalOrdersCount = this.orders.length;
        this.pendingOrdersCount = this.orders.filter(o => 
          o.status?.toLowerCase() === 'pending'
        ).length;

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Failed to load orders:", err);
      }
    });
  }
}
