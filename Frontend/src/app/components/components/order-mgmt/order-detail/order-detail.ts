import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderMgmt } from '../../../services/order-mgmt';
import { Order, OrderStatus } from '../../../models/order';
import { UserService } from '../../../services/user-service';
import { User } from '../../../models/user';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css']
})
export class OrderDetail implements OnInit {
  order: Order | undefined;
  orderUser: User | undefined;
  isAdmin: boolean = false;
  showCancelParams = false;
  showReturnParams = false;
  actionReason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderMgmt: OrderMgmt,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrderDetails();
    this.checkAdminStatus();
  }

  private checkAdminStatus() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = currentUser.role === 'admin';
  }

  private loadOrderDetails() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderMgmt.getOrderById(id).subscribe({
        next: (orderData: any) => {
          const orderDate = new Date(orderData.createdAt || orderData.date);
          const etaDate = new Date(orderDate);
          etaDate.setDate(orderDate.getDate() + 2);

          this.order = {
            ...orderData,
            id: orderData._id || orderData.id,
            eta: etaDate
          };

          const today = new Date();
          const currentStatus = (this.order!.status || '').toLowerCase();

          // AUTO-FLIP LOGIC
          if (today.getTime() > etaDate.getTime()) {
            if (currentStatus === 'pending' || currentStatus === 'shipped') {
              this.order!.status = OrderStatus.Delivered;
              this.updateStatusInDatabase(this.order!.id, OrderStatus.Delivered);
            }
          }

          this.cdr.detectChanges();

          if (orderData.userId) {
            this.userService.getUserById(orderData.userId).subscribe({
              next: (u) => { this.orderUser = u; this.cdr.detectChanges(); },
              error: () => {
                this.orderUser = { name: 'Customer', shippingAddress: 'On File' } as any;
                this.cdr.detectChanges();
              }
            });
          }
        }
      });
    }
  }

  private updateStatusInDatabase(orderId: string, newStatus: OrderStatus) {
    this.orderMgmt.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => console.log("✅ Sync: Status updated to", newStatus),
      error: (err) => console.error("❌ Sync Failed", err)
    });
  }

  initiateCancel() {
    this.showCancelParams = true;
    this.showReturnParams = false;
    this.actionReason = '';
  }

  initiateReturn() {
    this.showReturnParams = true;
    this.showCancelParams = false;
    this.actionReason = '';
  }

  submitCancel() {
    if (!this.actionReason.trim() || !this.order?.id) return;
    this.orderMgmt.cancelOrder(this.order.id, this.actionReason).subscribe({
      next: () => {
        this.order!.status = OrderStatus.Cancelled;
        this.showCancelParams = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitReturn() {
    if (!this.actionReason.trim() || !this.order?.id) return;
    this.orderMgmt.returnOrder(this.order.id).subscribe({
      next: () => {
        this.order!.status = OrderStatus.Returned;
        this.showReturnParams = false;
        this.cdr.detectChanges();
      }
    });
  }

  changeStatus(newStatus: any) {
    if (!this.order?.id || !this.isAdmin) return;
    this.orderMgmt.updateOrderStatus(this.order.id, newStatus).subscribe({
      next: () => {
        this.order!.status = newStatus;
        this.cdr.detectChanges();
      }
    });
  }

  closeActionBox() {
    this.showCancelParams = false;
    this.showReturnParams = false;
  }

  goBack() {
    this.router.navigate(['/orders/history']);
  }
}