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
      console.log("✅ OrderList: Fetching for user:", this.currentUserId);
      this.fetchOrders(this.currentUserId);
    } else {
      console.warn("⚠️ OrderList: Waiting for user session...");
    }
  });
}

fetchOrders(userId: string) {
  this.orderMgmt.getOrdersForUser(userId).subscribe({
    next: (data: any[]) => {
      this.zone.run(() => {
        this.orders = data.map((order: any) => ({
          id: order._id || order.id,
          status: order.status || 'pending',
          date: order.createdAt || order.date,
          totalAmount: order.totalAmount || 0,
          productDetails: (order.items || []).map((item: any) => ({
            name: item.name || item.productId?.name || 'Unknown Product',
            quantity: item.quantity || 1,
            imageUrl: item.image || item.productId?.image || 'assets/img/default-product.png'
          }))
        }));

        this.totalOrdersCount = this.orders.length;
        this.pendingOrdersCount = this.orders.filter(o => 
          o.status?.toLowerCase() === 'pending'
        ).length;

        this.cdr.detectChanges();
        console.log(`✅ Loaded ${this.orders.length} orders`);
      });
    },
    error: (err) => console.error("Order fetch failed:", err)
  });
}

}
