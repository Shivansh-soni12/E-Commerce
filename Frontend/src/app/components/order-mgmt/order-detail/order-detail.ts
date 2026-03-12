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
  cancelReason: string = '';
isCancelling: boolean = false;

  eOrderStatus = OrderStatus; 
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
  }
  private loadOrderDetails() {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.orderMgmt.getOrderById(id).subscribe({
      next: (orderData: any) => {
        this.order = {
          ...orderData,
          id: orderData._id || orderData.id, 
          status: orderData.status           
        };
        
        console.log("✅ Fixed Order Object:", this.order);
        this.cdr.detectChanges();

        if (orderData.userId) {
          this.userService.getUserById(orderData.userId).subscribe({
            next: (u) => { 
              this.orderUser = u; 
              this.cdr.detectChanges(); 
            },
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
  if (!this.actionReason.trim()) {
    alert('Please provide a reason for cancellation.');
    return;
  }
  
if (this.order?.id) {
   
    this.orderMgmt.cancelOrder(this.order.id, this.actionReason).subscribe({
      next: (response) => {
        this.order!.status = OrderStatus.Cancelled; 
        this.showCancelParams = false;
        this.cdr.detectChanges();
        alert('Order cancelled successfully.');
      },
      error: (err) => {
        console.error("Cancellation error:", err);
        alert('Error cancelling order: ' + err.message);
      }
    });
  }
}

  submitReturn() {
    if (!this.actionReason.trim()) {
      alert('Please describe the issue with the item.');
      return;
    }
    
    if (this.order?.id) {
      this.orderMgmt.returnOrder(this.order.id).subscribe({
        next: () => {
          this.order!.status = OrderStatus.Returned;
          this.showReturnParams = false;
          alert('Return request submitted.');
        },
        error: (err) => alert('Error initiating return: ' + err.message)
      });
    }
  }

  closeActionBox() {
    this.showCancelParams = false;
    this.showReturnParams = false;
  }

  goBack() {
    this.router.navigate(['/orders/history']);
  }
}