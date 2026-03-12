import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../models/product';
import { User } from '../../../models/user';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css']
})
export class ProductCard {
  @Input() product!: Product;
  @Input() loggedInUser: User | null = null;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addtoWishlist=new EventEmitter<Product>();

  onAdd() {
    if (!this.loggedInUser) {
      alert('Please login first to add items to cart!');
    } else {
      this.addToCart.emit(this.product);
    }
  }
  onAddWishList() {
    if (!this.loggedInUser) {
      alert('Please login first to add items to wishlist!');
    } else {
      this.addtoWishlist.emit(this.product);
    }
  }
}
