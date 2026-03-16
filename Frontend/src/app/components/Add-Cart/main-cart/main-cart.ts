import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { UserService } from '../../../services/user-service';
import { User } from '../../../models/user';
import { EmptyCart } from '../empty-cart/empty-cart';
import { Cart } from '../cart/cart';
import { OrderSummary } from '../order-summary/order-summary';
import { Wishlist } from '../wishlist/wishlist';

@Component({
  selector: 'app-main-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyCart, OrderSummary, Cart, Wishlist],
  templateUrl: './main-cart.html',
  styleUrls: ['./main-cart.css'],
})
export class MainCart implements OnInit, OnDestroy {
  loggedInUser: User | null = null;
  private userSub!: Subscription;

  constructor(
    public cartService: CartService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
   
    this.userSub = this.userService.currentUser$.subscribe(user => {
      this.loggedInUser = user;
      if (!user && !localStorage.getItem('token')) {
        this.router.navigate(['/login']);
      }
    });
    this.cartService.cart$.subscribe(() => {
    this.cdr.detectChanges(); 
  });
  }

  isCartEmpty(): boolean {
    return !this.loggedInUser?.cart || this.loggedInUser.cart.length === 0;
  }

  onIncrease(item: any) {
    this.userService.addToCart(item);
  }

  onDecrease(item: any) {
    if (item.quantity > 1) {
      const user = this.loggedInUser;
      if (user && user.cart) {
        const target = user.cart.find((i: any) => i.productId === item.productId);
        if (target) {
          target.quantity -= 1;
          this.userService.updateProfile(user).subscribe();
        }
      }
    } else {
      this.onRemoveFromCart(item);
    }
  }

  onRemoveFromCart(item: any) {
    const user = this.loggedInUser;
    if (user) {
      user.cart = user.cart.filter((i: any) => i.productId !== item.productId);
      this.userService.updateProfile(user).subscribe();
    }
  }

  moveToCart(item: any) {
    if (this.loggedInUser) {
      const pId = item.productId || item._id || item.id;

      this.userService.addToCart(item);

      this.loggedInUser.wishlist = this.loggedInUser.wishlist.filter(
        (i: any) => (i.productId || i._id || i.id) !== pId
      );
      this.userService.updateProfile(this.loggedInUser).subscribe();
    }
  }

  removeFromWishlist(item: any) {
    if (this.loggedInUser) {
      const pId = item.productId || item._id || item.id;
      this.loggedInUser.wishlist = this.loggedInUser.wishlist.filter(
        (i: any) => (i.productId || i._id || i.id) !== pId
      );
      this.userService.updateProfile(this.loggedInUser).subscribe();
    }
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }
}