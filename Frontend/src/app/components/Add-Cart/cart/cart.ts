import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { UserService } from '../../../services/user-service';
import { OrderMgmt } from '../../../services/order-mgmt'; 
import { Router } from '@angular/router';                
import { User } from '../../../models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart implements OnInit, OnDestroy {
  loggedInUser: User | null = null;
  private userSub!: Subscription;

  @Input() cartItems: any[] = []; 

  @Output() increase = new EventEmitter<any>();
  @Output() decrease = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();

  constructor(
    public cartService: CartService,
    public userService: UserService,
    private orderMgmt: OrderMgmt, 
    private router: Router        
  ) {}

  ngOnInit() {
    this.userSub = this.userService.currentUser$.subscribe(user => {
      this.loggedInUser = user;
      if (user && (!this.cartItems || this.cartItems.length === 0)) {
        this.cartItems = user.cart || [];
      }
    });
  }

  onAdd(item: any) {
    this.userService.addToCart(item);
  }

  onRemove(item: any) {
    if (this.loggedInUser && item.quantity > 1) {
      const updatedCart = [...this.cartItems];
      const target = updatedCart.find(i => i.productId === item.productId);
      if (target) {
        target.quantity -= 1;
        this.syncCart(updatedCart);
      }
    } else {
      this.onDelete(item);
    }
  }

  onDelete(item: any) {
    if (!this.loggedInUser) return;
    const pId = item.productId || item._id || item.id;
    const updatedCart = this.loggedInUser.cart.filter((i: any) => 
      (i.productId || i._id || i.id) !== pId
    );
    const updatedUser = { ...this.loggedInUser, cart: updatedCart };
    this.userService.updateProfile(updatedUser).subscribe({
      next: (res: any) => {
        this.userService['updateLocalUser'](res.user);
        this.cartService.setCart(res.user.cart);
        console.log('Item deleted successfully');
      },
      error: (err) => {
        console.error('Delete failed:', err);
      }
    });
  }

  onAddToWishlist(item: any) {
    this.userService.moveToWishlist(item);
  }

  // --- FIXED PLACE ORDER LOGIC ---
  onPlaceOrder() {
  console.log("1. Button Clicked. Current items:", this.cartItems);
  
  // LOG THE USER OBJECT TO SEE IF IT EXISTS
  console.log("2. LoggedInUser status:", this.loggedInUser);

  if (!this.loggedInUser) {
    console.error("3. FAILURE: loggedInUser is NULL. Code stopping.");
    alert("You are not logged in correctly.");
    return;
  }

  const userId = this.loggedInUser._id;
  console.log("4. User ID is:", userId);

  if (!userId) {
    console.error("5. FAILURE: _id property is missing from user object.");
    return;
  }

  console.log("6. About to call Service...");

  this.orderMgmt.placeOrder(String(userId)).subscribe({
    next: (res) => {
      console.log("7. SUCCESS!", res);
      this.cartService.setCart([]);
      this.router.navigate(['/orders/dashboard']);
    },
    error: (err) => {
      console.error("7. NETWORK ERROR:", err);
    }
  });
}

  getIndividualTotal(item: any): number {
    return item.price * (item.quantity || 0);
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  private syncCart(newCart: any[]) {
    if (this.loggedInUser) {
      const updatedUser = { ...this.loggedInUser, cart: newCart };
      this.userService.updateProfile(updatedUser).subscribe({
        next: (res: any) => {
          this.userService['updateLocalUser'](res.user);
          this.cartService.setCart(res.user.cart);
          console.log('Cart synced to DB');
        },
        error: (err) => console.error('Cart sync failed', err)
      });
    }
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }
}