import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user-service';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.css']
})
export class Wishlist implements OnInit, OnDestroy {
 items: any[] = [];
  private userSub!: Subscription;

  constructor(
    public userService: UserService,
    public cartService: CartService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.userSub = this.userService.currentUser$.subscribe(user => {
      this.items = user?.wishlist ? [...user.wishlist] : [];
      console.log("Wishlist Component received data:", this.items);
      this.cdr.detectChanges(); 
    });
  }

  onRemove(item: any) {
  console.log("Remove button clicked for item:", item);
  const pId = item.productId || item._id || item.id;
  
  if (!pId) {
    console.error("Cannot remove: Item is missing an ID", item);
    return;
  }

  this.userService.removeFromWishlist(pId);
}

 onMoveToCart(item: any) {
  this.userService.moveToCart(item);
}

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }
}