import { Component, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { OrderMgmt } from '../../../services/order-mgmt';
import { UserService } from '../../../services/user-service';
import { OrderStatus } from '../../../models/order';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderList implements OnInit, OnDestroy {
  orders: any[] = []; 
  searchForm: FormGroup;
  private subs = new Subscription();

  constructor(
    private orderMgmt: OrderMgmt, 
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.searchForm = this.fb.group({
      searchText: [''],
      status: ['All']
    });
  }

  ngOnInit() {
  
  this.subs.add(
    this.orderMgmt.orders$.subscribe(rawOrders => {
      this.zone.run(() => {
        const today = new Date();

        this.orders = rawOrders.map(order => {
          const orderDate = new Date(order.createdAt || order.date);
          const etaDate = new Date(orderDate);
          etaDate.setDate(orderDate.getDate() + 2);

          
          let currentStatus = (order.status || 'pending').toLowerCase();
          let displayStatus = currentStatus;

         
          const isOld = today.getTime() > etaDate.getTime();
          const canBeDelivered = (currentStatus === 'pending' || currentStatus === 'shipped');

          if (isOld && canBeDelivered) {
            displayStatus = 'delivered'; 

            
            if (order.status !== 'delivered') {
              this.orderMgmt.updateOrderStatus(order._id || order.id, 'delivered').subscribe({
                next: () => console.log(`Order ${order._id || order.id} auto-updated to delivered`),
                error: (err) => {
                  
                  console.warn("Backend still rejecting update for:", order._id || order.id, err.status);
                }
              });
            }
          }

          return {
            ...order,
            id: order._id || order.id,
            status: displayStatus,
            date: orderDate,
            eta: etaDate,
            
            progressWidth: displayStatus === 'delivered' ? '100%' : (displayStatus === 'shipped' ? '70%' : '40%'),
            productDetails: (order.items || []).map((item: any) => ({
              name: item.name || item.productId?.name || 'Unknown Product',
              quantity: item.quantity || 1
            }))
          };
        });
        this.cdr.detectChanges();
      });
    })
  );

  
  this.userService.currentUser$.subscribe(user => {
    if (user && (user._id || user.id)) {
      this.orderMgmt.getOrdersForUser(String(user._id || user.id)).subscribe();
    }
  });

 
  this.searchForm.valueChanges.subscribe(() => this.cdr.detectChanges());
}

  get filteredOrders() {
    const { searchText, status } = this.searchForm.value;
    return this.orders.filter(order => {
      const matchesStatus = status === 'All' || order.status.toLowerCase() === status.toLowerCase();
      const search = searchText.toLowerCase();
      const matchesSearch = !searchText || 
                            order.id.toLowerCase().includes(search) ||
                            order.productDetails.some((p: any) => p.name.toLowerCase().includes(search));
      return matchesStatus && matchesSearch;
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getStatusColor(status: string): string {
  if (!status) return '#f1c40f'; 

  switch (status.toLowerCase()) {
    case 'delivered':
      return '#2ecc71'; 
    case 'shipped':
      return '#3498db'; 
    case 'returned':
      return '#e67e22'; 
    case 'cancelled':
      return '#e74c3c'; 
    default:
      return '#f1c40f'; 
  }
}
}