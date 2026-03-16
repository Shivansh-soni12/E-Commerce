import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderMgmt } from '../../../services/order-mgmt'; 
import { Router } from '@angular/router';
import { UserService } from '../../../services/user-service'; 
import { Subscription } from 'rxjs';
import { CartService } from '../../../services/cart.service'; 

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.html',
  styleUrls: ['./order-summary.css']
})
export class OrderSummary implements OnInit, OnDestroy {
  @Input() cart: any[] = []; 

  loggedInUser: any = null;
  private userSub!: Subscription;

  constructor(
    private orderMgmt: OrderMgmt,
    private router: Router,
    private userService: UserService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.userSub = this.userService.currentUser$.subscribe(user => {
      this.loggedInUser = user;
    });
  }

  get cartItems() {
    return this.cart || [];
  }

  getIndividualTotal(item: any): number {
    return (item.price || 0) * (item.quantity || 0);
  }

  getOriginalTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.getIndividualTotal(item), 0);
  }

  getDeliveryCharges(): number {
    const total = this.getOriginalTotal();
    return (total >= 2000 || total === 0) ? 0 : 50;
  }

  getTotalSavings(): number {
    return 0; 
  }

  getGrandTotal(): number {
    return this.getOriginalTotal() + this.getDeliveryCharges() - this.getTotalSavings();
  }
 proceedOrder() {
    console.log("Proceeding to payment with items:", this.cartItems);
 
    const userId = this.loggedInUser?._id || this.loggedInUser?.id;
 
    if (!userId) {
      alert("Please log in to place an order.");
      this.router.navigate(['/login']);
      return;
    }

    const finalAmount = this.getGrandTotal();

    this.router.navigate(['/payment'], { 
      state: { amount: finalAmount, cart: this.cartItems } 
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}